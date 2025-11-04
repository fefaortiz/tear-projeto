const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/authMiddleware');

// GET route to fetch all therapists
// O caminho é '/', pois o prefixo /api/terapeutas será definido no server.js
router.get('/', verifyToken, async (req, res) => {
  try {
    const cuidadores = await db('cuidador').select('*');
    return res.status(200).json(cuidadores);
  } catch (error) {
    console.error('Error fetching cuidadores:', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar os cuidadores.' 
    });
  }
});

// ==========================================================
// NOVO: Rota 2 (GET /api/cuidadores/lookup)
// Busca um cuidador por ID, CPF ou Email
// ==========================================================
router.get('/lookup', verifyToken, async (req, res) => {
  try {
    // 1. Pega os parâmetros da URL (ex: /lookup?cpf=123)
    const { id, cpf, email } = req.query;

    let cuidador;
    const query = db('cuidador');

    // (Presumindo colunas minúsculas: 'idcuidador', 'cpf', 'email')
    if (id) {
      query.where({ idcuidador: id });
    } else if (cpf) {
      query.where({ cpf: cpf });
    } else if (email) {
      query.where({ email: email });
    } else {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id, cpf ou email) é obrigatório.' 
      });
    }

    cuidador = await query.first();

    if (!cuidador) {
      return res.status(404).json({ error: 'Cuidador não encontrado.' });
    }

    return res.status(200).json(cuidador);

  } catch (error) {
    console.error('Erro ao buscar cuidador:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota 3 (GET /api/cuidadores/por-paciente)
// Busca o cuidador vinculado a um paciente
// ==========================================================
router.get('/por-paciente', verifyToken, async (req, res) => {
  try {
    // 1. Pega os parâmetros de busca do paciente
    const { id_paciente, email_paciente, cpf_paciente } = req.query;

    if (!id_paciente && !email_paciente && !cpf_paciente) {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id_paciente ou email_paciente ou cpf_paciente) é obrigatório.' 
      });
    }

    // 2. Esta é a forma eficiente: Usamos um JOIN
    // "SELECT cuidador.* FROM cuidador
    //  JOIN paciente ON cuidador.idcuidador = paciente.idcuidador
    //  WHERE paciente.idpaciente = ? OR paciente.email = ?"
    const query = db('cuidador')
      .join('paciente', 'cuidador.idcuidador', '=', 'paciente.idcuidador')
      .select('cuidador.*');

    if (id_paciente) {
      query.where('paciente.idpaciente', id_paciente);
    } else if (email_paciente) {
      query.where('paciente.email', email_paciente);
    } else if (cpf_paciente) {
      query.where('paciente.cpf', cpf_paciente);
    }

    const cuidador = await query.first();

    if (!cuidador) {
      return res.status(404).json({ error: 'Cuidador não encontrado para este paciente.' });
    }

    return res.status(200).json(cuidador);

  } catch (error) {
    console.error('Erro ao buscar cuidador por paciente:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota PATCH /api/cuidadores/profile
// Atualiza o perfil do cuidador LOGADO
// ==========================================================
router.patch('/profile', verifyToken, async (req, res) => {
  const { id: idcuidador } = req.user;

  const { nome, telefone, sexo, data_de_nascimento, email, senha } = req.body;

  const updateData = {};

  if (nome !== undefined) updateData.nome = nome;
  if (telefone !== undefined) updateData.telefone = telefone;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (data_de_nascimento !== undefined) updateData.data_de_nascimento = data_de_nascimento;
  if (email) updateData.email = email;

  // Lógica especial para a SENHA
  // Se uma nova senha foi fornecida, hasheamos ela.
  if (senha) {
    try {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(senha, salt);
    } catch (hashError) {
      console.error("Erro ao hashear nova senha:", hashError);
      return res.status(500).json({ error: 'Erro ao processar a senha.' });
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      error: 'Nenhum campo para atualizar foi fornecido.' 
    });
  }

  try {
    const [updatedCuidador] = await db.transaction(async (trx) => {
      // Passo A: Precisamos do email *antigo* antes de atualizar
      const cuidadorAtual = await trx('cuidador')
        .where({ idcuidador })
        .first();

      if (!cuidadorAtual) {
        throw new Error('Cuidador não encontrado');
      }

      // Passo B: Atualiza a tabela 'cuidador'
      const [cuidador] = await trx('cuidador')
        .where({ idcuidador })
        .update(updateData)
        .returning('*'); // Retorna o objeto completo do cuidador atualizado

      // Passo C: Lógica especial para o EMAIL
      // Se o email foi atualizado (e é diferente do antigo),
      // devemos propagar essa mudança para a tabela 'paciente'.
      if (email && email !== cuidadorAtual.email) {
        await trx('paciente')
          .where({ emailcuidador: cuidadorAtual.email }) // Encontra pacientes com o email antigo
          .update({ emailcuidador: email }); // Atualiza para o email novo
      }

      return [cuidador]; // Finaliza e retorna o terapeuta
    });

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      cuidador: updatedCuidador
    });

  } catch (error) {
    console.error('Erro ao atualizar cuidador:', error);
    
    // Erro comum: o novo email já existe no banco
    if (error.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está em uso.' });
    }

    if (error.message === 'Cuidador não encontrado') {
        return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' });
  }
});

router.get('/cuidadores', verifyToken, async (req, res) => {
  try {
    const cuidadores = await db('cuidador').select('*');
    return res.status(200).json(cuidadores);
  } catch (error) {
    console.error('Error fetching cuidadores:', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar os cuidadores.' 
    });
  }
});

module.exports = router;