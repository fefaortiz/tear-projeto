const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const verifyToken = require('../middleware/authMiddleware');

// ==========================================================
// POST /api/tracking/:idtraits (Criar novo Tracking)
// ==========================================================
router.post('/:idtraits', verifyToken, async (req, res) => {
  try {
    // 1. Pega o ID da URL e dados do corpo
    const { idtraits } = req.params;
    const { intensidade, descricao, dia_de_registro } = req.body;

    const finalDate = dia_de_registro ?? new Date().toISOString().split('T')[0];

    // 3. Pega ID e ROLE diretamente do Token (payload)
    const { id: creatorId, role } = req.user; 

    // 4. Validação básica
    if (!idtraits) {
      return res.status(400).json({ 
        error: 'O ID da trait é obrigatório na URL.' 
      });
    }

    // 5. Verifica se já existe um tracking para esta trait na data de hoje
    const existingTracking = await db('tracking')
      .where({
        idtraits: idtraits,
        dia_de_registro: finalDate 
      })
      .first(); 

    if (existingTracking) {
      return res.status(409).json({ 
        error: 'Já existe um registro de tracking para esta característica hoje.' 
      });
    }

    // 6. Prepara o objeto para inserção
    const newTrackingData = {
      intensidade,
      descricao, // Incluindo a descrição solicitada
      dia_de_registro,
      idtraits, 
      idpaciente_criador: null,
      idcuidador_criador: null,
    };

    // 7. Lógica do Criador
    if (role === 'paciente') {
        newTrackingData.idpaciente_criador = creatorId;
    } else if (role === 'cuidador') {
        newTrackingData.idcuidador_criador = creatorId;
    } else {
        return res.status(403).json({ error: 'Apenas pacientes ou cuidadores podem criar trackings.' });
    }

    // 8. Insere no banco
    const [createdTracking] = await db('tracking').insert(newTrackingData).returning('*');

    res.status(201).json(createdTracking);

  } catch (error) {
    console.error('Erro ao criar Tracking:', error);

    if (error.code === '23503') {
      return res.status(404).json({ error: 'A Trait especificada não foi encontrada.' });
    }
    res.status(500).json({ error: 'Erro interno ao criar Tracking.' });
  }
});

// ==========================================================
// GET /api/tracking (Buscar Trackings por Trait)
// ==========================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const { idtrait } = req.query; // ex: /api/tracking?idtrait=5

    if (!idtrait) {
      return res.status(400).json({ 
        error: 'O parâmetro de query "idtrait" é obrigatório.' 
      });
    }

    const trackings = await db('tracking')
      .where({ idtraits: idtrait })
      .orderBy('dia_de_registro', 'asc'); // 'asc' (ascendente) para ver a linha do tempo

    res.status(200).json(trackings);

  } catch (error) {
    console.error('Erro ao buscar Trackings:', error);
    res.status(500).json({ error: 'Erro interno ao buscar Trackings.' });
  }
});

// ==========================================================
// PUT /api/tracking/:id (Atualizar um Tracking)
// ==========================================================
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id: idtracking } = req.params;
    const { intensidade, dia_de_registro, descricao } = req.body;

    const updateData = {};
    if (intensidade !== undefined) updateData.intensidade = intensidade;
    if (dia_de_registro !== undefined) updateData.dia_de_registro = dia_de_registro;
    if (descricao !== undefined) updateData.descricao = descricao;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const [updatedTracking] = await db('tracking')
      .where({ idtracking: idtracking })
      .update(updateData)
      .returning('*');

    if (!updatedTracking) {
      return res.status(404).json({ error: 'Registro de Tracking não encontrado.' });
    }

    res.status(200).json(updatedTracking);

  } catch (error) {
    console.error('Erro ao atualizar Tracking:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar Tracking.' });
  }
});

// ==========================================================
// DELETE /api/tracking/:id (Deletar um Tracking)
// ==========================================================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id: idtracking } = req.params;

    const deletedCount = await db('tracking')
      .where({ idtracking: idtracking })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Registro de Tracking não encontrado.' });
    }

    res.status(200).json({ message: 'Registro de Tracking deletado com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar Tracking:', error);
    res.status(500).json({ error: 'Erro interno ao deletar Tracking.' });
  }
});

module.exports = router;