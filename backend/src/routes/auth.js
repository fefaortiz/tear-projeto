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

    // 1. Busca em todas as tabelas e determina o papel (role)
    let usuario = null;
    let role = null;
    let idDoUsuario = null;

    const terapeuta = await db('terapeuta').where({ email: email }).first();
    if (terapeuta) {
      usuario = terapeuta;
      role = 'terapeuta';
      idDoUsuario = terapeuta.idterapeuta;
    }

    if (!usuario) {
      const paciente = await db('paciente').where({ email: email }).first();
      if (paciente) {
        usuario = paciente;
        role = 'paciente';
        idDoUsuario = paciente.idpaciente;
      }
    }

    if (!usuario) {
      const cuidador = await db('cuidador').where({ email: email }).first();
      if (cuidador) {
        usuario = cuidador;
        role = 'cuidador';
        idDoUsuario = cuidador.idcuidador;
      }
    }
    
    // Se o usuário ainda for null, as credenciais estão inválidas
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 2. Verifica a senha
    const isPasswordCorrect = await bcrypt.compare(senha, usuario.senha);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }
    
    // 3. Assina o Token com o ID, Email e AGORA o ROLE!
    const token = jwt.sign(
      { 
        id: idDoUsuario, 
        email: usuario.email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      role: role // É bom retornar o role diretamente na resposta também, para uso imediato no frontend
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

// ==========================================================
// ## Rota de Cadastro de Paciente ##
// ==========================================================
router.post('/register', async (req, res) => {
  const {
    nome,
    cpf,
    telefone,
    sexo,
    data_de_nascimento, // Espera formato 'YYYY-MM-DD'
    email,
    senha,
    emailTerapeuta,
    emailCuidador
  } = req.body;

  if (!nome || !email || !senha || !cpf || !emailTerapeuta || !emailCuidador) {
    return res.status(400).json({ error: 'Campos obrigatórios não encontrados.' });
  }

  try {
    const [novoPaciente] = await db.transaction(async (trx) => {
      const pacienteExistente = await trx('paciente')
        .where({ email: email })
        .orWhere({ cpf: cpf })
        .first();

      if (pacienteExistente) {
        throw new Error('Email ou CPF já cadastrado.');
      }

      // 3. Encontrar o ID do Terapeuta pelo email
      let idTerapeuta = null;
      if (emailTerapeuta) {
        const terapeuta = await trx('terapeuta').where({ email: emailTerapeuta }).first();
        if (terapeuta) {
          idTerapeuta = terapeuta.idterapeuta;
        }
      }

      // 4. Encontrar o ID do Cuidador pelo email
      let idCuidador = null;
      if (emailCuidador) {
        const cuidador = await trx('cuidador').where({ email: emailCuidador }).first();
        if (cuidador) {
          idCuidador = cuidador.idcuidador;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const pacienteParaInserir = {
        nome,
        cpf,
        telefone,
        sexo,
        data_de_nascimento,
        email,
        senha: senhaHash, // Salva a senha hasheada
        idterapeuta: idTerapeuta,
        idcuidador: idCuidador,
        emailterapeuta: emailTerapeuta,
        emailcuidador: emailCuidador   
      };

      return trx('paciente').insert(pacienteParaInserir).returning('*');
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
    nome,
    cpf,
    telefone,
    crp_crm,
    sexo,
    data_de_nascimento,
    email,
    senha
  } = req.body;

  if (!nome || !cpf || !crp_crm || !email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios (Nome, CPF, CRP/CRM, Email, senha) estão faltando.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      
      const terapeutaExistente = await trx('terapeuta')
        .where({ email: email })
        .orWhere({ cpf: cpf })
        .orWhere({ crp_crm: crp_crm})
        .first();

      if (terapeutaExistente) {
        throw new Error('Email ou CPF ou CRP/CRM já cadastrado para um terapeuta.');
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const terapeutaParaInserir = {
        nome,
        cpf,
        telefone,
        crp_crm,
        sexo,
        data_de_nascimento,
        email,
        senha: senhaHash
      };

      const [novoTerapeuta] = await trx('terapeuta')
        .insert(terapeutaParaInserir)
        .returning('*');

      // LÓGICA PRINCIPAL: Atualizar pacientes "órfãos"
      // Encontra todos os pacientes que se cadastraram com o email
      // deste terapeuta, mas que ainda não têm o IDTerapeuta preenchido.
      const pacientesAtualizadosCount = await trx('paciente')
        .where({ emailterapeuta: novoTerapeuta.email }) // Encontra pelo email
        .andWhere({ idterapeuta: null }) // Apenas os que ainda não têm ID
        .update({
          idterapeuta: novoTerapeuta.idterapeuta // Preenche o ID
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
    nome,
    cpf,
    telefone,
    sexo,
    data_de_nascimento,
    email,
    senha
  } = req.body;

  if (!nome || !cpf || !email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios (Nome, CPF, Email, senha) estão faltando.' });
  }

  try {
    const resultado = await db.transaction(async (trx) => {
      
      const cuidadorExistente = await trx('cuidador')
        .where({ email: email })
        .orWhere({ cpf: cpf })
        .first();

      if (cuidadorExistente) {
        throw new Error('Email ou CPF já cadastrado para um cuidador.');
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const cuidadorParaInserir = {
        nome,
        cpf,
        telefone,
        sexo,
        data_de_nascimento,
        email,
        senha: senhaHash
      };

      const [novoCuidador] = await trx('cuidador')
        .insert(cuidadorParaInserir)
        .returning('*');

      // LÓGICA PRINCIPAL: Atualizar pacientes "órfãos"
      // Encontra todos os pacientes que se cadastraram com o email
      // deste Cuidador, mas que ainda não têm o IDCuidador preenchido.
      const pacientesAtualizadosCount = await trx('paciente')
        .where({ emailcuidador: novoCuidador.email }) // Encontra pelo email
        .andWhere({ idcuidador: null }) // Apenas os que ainda não têm ID
        .update({
          idcuidador: novoCuidador.idcuidador // Preenche o ID
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