const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/authMiddleware');

// GET route to fetch all therapists
// O caminho é '/', pois o prefixo /api/terapeutas será definido no server.js
router.get('/', verifyToken, async (req, res) => {
  try {
    const terapeutas = await db('terapeuta').select('*');
    return res.status(200).json(terapeutas);
  } catch (error) {
    console.error('Error fetching terapeutas:', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar os terapeutas.' 
    });
  }
});

// ==========================================================
// NOVO: Rota 2 (GET /api/terapeutas/:id)
// Busca um terapeuta por ID
// ==========================================================
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // 1. Pega os parâmetros da URL (ex: /lookup?cpf=123)
    const { id } = req.params;

    let terapeuta;
    const query = db('terapeuta');

    // (Presumindo colunas minúsculas: 'idterapeuta', 'cpf', 'email')
    if (id) {
      query.where({ idterapeuta: id });
    } else if (cpf) {
      query.where({ cpf: cpf });
    } else if (email) {
      query.where({ email: email });
    } else {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id, cpf ou email) é obrigatório.' 
      });
    }

    terapeuta = await query.first();

    if (!terapeuta) {
      return res.status(404).json({ error: 'Terapeuta não encontrado.' });
    }

    return res.status(200).json(terapeuta);

  } catch (error) {
    console.error('Erro ao buscar terapeuta:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota 3 (GET /api/terapeutas/por-paciente)
// Busca o terapeuta vinculado a um paciente
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
    // "SELECT terapeuta.* FROM terapeuta
    //  JOIN paciente ON terapeuta.idterapeuta = paciente.idterapeuta
    //  WHERE paciente.idpaciente = ? OR paciente.email = ?"
    const query = db('terapeuta')
      .join('paciente', 'terapeuta.idterapeuta', '=', 'paciente.idterapeuta')
      .select('terapeuta.*');

    if (id_paciente) {
      query.where('paciente.idpaciente', id_paciente);
    } else if (email_paciente) {
      query.where('paciente.email', email_paciente);
    } else if (cpf_paciente) {
      query.where('paciente.cpf', cpf_paciente);
    }

    const terapeuta = await query.first();

    if (!terapeuta) {
      return res.status(404).json({ error: 'Terapeuta não encontrado para este paciente.' });
    }

    return res.status(200).json(terapeuta);

  } catch (error) {
    console.error('Erro ao buscar terapeuta por paciente:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota PATCH /api/terapeutas/:idterapeuta
// Atualiza o perfil do terapeuta LOGADO
// ==========================================================
router.put('/:idterapeuta', verifyToken, async (req, res) => {
  const { idterapeuta } = req.params;

  const { nome, telefone, sexo, data_de_nascimento, crp_crm } = req.body;

  const updateData = {};

  if (nome !== undefined) updateData.nome = nome;
  if (telefone !== undefined) updateData.telefone = telefone;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (data_de_nascimento !== undefined) updateData.data_de_nascimento = data_de_nascimento;
  if (crp_crm !== undefined) updateData.crp_crm = crp_crm;

  try {
    const [updatedTerapeuta] = await db.transaction(async (trx) => {
      // Passo A: Precisamos do email *antigo* antes de atualizar
      const terapeutaAtual = await trx('terapeuta')
        .where({ idterapeuta })
        .first();

      if (!terapeutaAtual) {
        throw new Error('Terapeuta não encontrado');
      }

      // Passo B: Atualiza a tabela 'terapeuta'
      const [terapeuta] = await trx('terapeuta')
        .where({ idterapeuta })
        .update(updateData)
        .returning('*'); // Retorna o objeto completo do terapeuta atualizado

      return [terapeuta]; // Finaliza e retorna o terapeuta
    });

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      terapeuta: updatedTerapeuta
    });

  } catch (error) {
    console.error('Erro ao atualizar terapeuta:', error);
    
    if (error.message === 'Terapeuta não encontrado') {
        return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' });
  }
});

// ==========================================================
// NOVO: Rota DELETE /api/terapeutas/profile
// Exclui o perfil do terapeuta LOGADO
// ==========================================================
router.delete('/delete', verifyToken, async (req, res) => {
  const { id: idterapeuta } = req.user;

  try {
    const deletedCount = await db('terapeuta')
      .where({ idterapeuta: idterapeuta })
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Terapeuta não encontrado.' });
    }
    
    return res.status(200).json({ 
      message: 'Conta do terapeuta excluída com sucesso. Todos os pacientes associados foram desvinculados.' 
    });

  } catch (error) {
    console.error('Erro ao excluir terapeuta:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno ao excluir o perfil.' });
  }
});

module.exports = router;