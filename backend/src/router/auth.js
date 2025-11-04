const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');

// ==========================================================
// ## Rota de Login ##
// ==========================================================
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const terapeuta = await db('terapeuta').where({ email }).first();

    if (!terapeuta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isPasswordCorrect = await bcrypt.compare(senha, terapeuta.senha);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: terapeuta.idterapeuta, email: terapeuta.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

// ==========================================================
// ## Rota de Cadastro de Visitante ##
// ==========================================================
router.post('/register', async (req, res) => {
  const {
    Nome,
    CPF,
    Telefone,
    Sexo,
    Data_de_Nascimento, // Espera formato 'YYYY-MM-DD'
    Email,
    Senha,
    EmailTerapeuta,
    EmailCuidador
  } = req.body;

  if (!Nome || !Email || !Senha || !CPF || !EmailTerapeuta || !EmailCuidador) {
    return res.status(400).json({ error: 'Campos obrigatórios não encontrados.' });
  }

  try {
    const [novoPaciente] = await db.transaction(async (trx) => {
      const pacienteExistente = await trx('Paciente')
        .where({ Email: Email })
        .orWhere({ CPF: CPF })
        .first();

      if (pacienteExistente) {
        throw new Error('Email ou CPF já cadastrado.');
      }

      // 3. Encontrar o ID do Terapeuta pelo email
      let idTerapeuta = null;
      if (EmailTerapeuta) {
        const terapeuta = await trx('Terapeuta').where({ Email: EmailTerapeuta }).first();
        if (terapeuta) {
          idTerapeuta = terapeuta.IDTerapeuta;
        }
      }

      // 4. Encontrar o ID do Cuidador pelo email
      let idCuidador = null;
      if (EmailCuidador) {
        const cuidador = await trx('Cuidador').where({ Email: EmailCuidador }).first();
        if (cuidador) {
          idCuidador = cuidador.IDCuidador;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(Senha, salt);

      const pacienteParaInserir = {
        Nome,
        CPF,
        Telefone,
        Sexo,
        Data_de_Nascimento,
        Email,
        Senha: senhaHash, // Salva a senha hasheada
        IDTerapeuta: idTerapeuta,
        IDCuidador: idCuidador,
        EmailTerapeuta: EmailTerapeuta,
        EmailCuidador: EmailCuidador   
      };

      return trx('Paciente').insert(pacienteParaInserir).returning('*');
    });

    return res.status(201).json({
      message: 'Paciente cadastrado com sucesso!',
      paciente: novoPaciente
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    // Retorna o erro específico que lançamos na transação
    if (error.message.includes('Email ou CPF') || error.message.includes('não encontrado')) {
      return res.status(409).json({ error: error.message });
    }
    
    // Erro genérico
    return res.status(400).json({ error: 'Ocorreu um erro interno ao cadastrar o paciente.' });
  }
});

// ==========================================================
// ## Rota de Cadastro de Terapeuta ##
// ==========================================================
router.post('/registerTerapeuta', async (req, res) => {
  const {
    Nome,
    CPF,
    Telefone,
    CRP_CRM,
    Sexo,
    Data_de_Nascimento,
    Email,
    Senha
  } = req.body;

  if (!Nome || !CPF || !CRP_CRM || !Email || !Senha) {
    return res.status(400).json({ error: 'Campos obrigatórios (Nome, CPF, CRP/CRM, Email, Senha) estão faltando.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      
      const terapeutaExistente = await trx('Terapeuta')
        .where({ Email: Email })
        .orWhere({ CPF: CPF })
        .orWhere({ CRP_CRM: CRP_CRM})
        .first();

      if (terapeutaExistente) {
        throw new Error('Email ou CPF ou CRP/CRM já cadastrado para um terapeuta.');
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(Senha, salt);

      const terapeutaParaInserir = {
        Nome,
        CPF,
        Telefone,
        CRP_CRM,
        Sexo,
        Data_de_Nascimento,
        Email,
        Senha: senhaHash
      };

      const [novoTerapeuta] = await trx('Terapeuta')
        .insert(terapeutaParaInserir)
        .returning('*');

      // LÓGICA PRINCIPAL: Atualizar pacientes "órfãos"
      // Encontra todos os pacientes que se cadastraram com o email
      // deste terapeuta, mas que ainda não têm o IDTerapeuta preenchido.
      const pacientesAtualizadosCount = await trx('Paciente')
        .where({ EmailTerapeuta: novoTerapeuta.Email }) // Encontra pelo Email
        .andWhere({ IDTerapeuta: null }) // Apenas os que ainda não têm ID
        .update({
          IDTerapeuta: novoTerapeuta.IDTerapeuta // Preenche o ID
        });
      
      // Retorna os dados para fora da transação
      return { novoTerapeuta, pacientesAtualizadosCount };
    });

    // Se a transação deu certo, enviar resposta de sucesso
    return res.status(201).json({
      message: 'Terapeuta cadastrado com sucesso!',
      terapeuta: resultado.novoTerapeuta,
      pacientesVinculados: resultado.pacientesAtualizadosCount // Informa quantos pacientes foram vinculados
    });

  } catch (error) {
    console.error('Erro no cadastro do terapeuta:', error);
    if (error.message.includes('Email ou CPF') || error.message.includes("Campos obrigatórios")) {
      return res.status(409).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Ocorreu um erro interno ao cadastrar o terapeuta.' });
  }
});

// ==========================================================
// ## Rota de Cadastro de Cuidador ##
// ==========================================================
router.post('/registerCuidador', async (req, res) => {
  const {
    Nome,
    CPF,
    Telefone,
    Sexo,
    Data_de_Nascimento,
    Email,
    Senha
  } = req.body;

  if (!Nome || !CPF || !Email || !Senha) {
    return res.status(400).json({ error: 'Campos obrigatórios (Nome, CPF, Email, Senha) estão faltando.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      
      const cuidadorExistente = await trx('Cuidador')
        .where({ Email: Email })
        .orWhere({ CPF: CPF })
        .first();

      if (cuidadorExistente) {
        throw new Error('Email ou CPF já cadastrado para um cuidador.');
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(Senha, salt);

      const cuidadorParaInserir = {
        Nome,
        CPF,
        Telefone,
        CRP_CRM,
        Sexo,
        Data_de_Nascimento,
        Email,
        Senha: senhaHash
      };

      const [novoCuidador] = await trx('Cuidador')
        .insert(cuidadorParaInserir)
        .returning('*');

      // LÓGICA PRINCIPAL: Atualizar pacientes "órfãos"
      // Encontra todos os pacientes que se cadastraram com o email
      // deste Cuidador, mas que ainda não têm o IDCuidador preenchido.
      const pacientesAtualizadosCount = await trx('Paciente')
        .where({ EmailCuidador: novoCuidador.Email }) // Encontra pelo Email
        .andWhere({ IDCuidador: null }) // Apenas os que ainda não têm ID
        .update({
          IDCuidador: novoCuidador.IDCuidador // Preenche o ID
        });
      
      // Retorna os dados para fora da transação
      return { novoCuidador, pacientesAtualizadosCount };
    });

    // Se a transação deu certo, enviar resposta de sucesso
    return res.status(201).json({
      message: 'Cuidador cadastrado com sucesso!',
      Cuidador: resultado.novoCuidador,
      pacientesVinculados: resultado.pacientesAtualizadosCount // Informa quantos pacientes foram vinculados
    });

  } catch (error) {
    console.error('Erro no cadastro do Cuidador:', error);
    if (error.message.includes('Email ou CPF') || error.message.includes("Campos obrigatórios")) {
      return res.status(409).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Ocorreu um erro interno ao cadastrar o Cuidador.' });
  }
});

module.exports = router;