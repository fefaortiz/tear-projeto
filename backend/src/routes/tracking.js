const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const verifyToken = require('../middleware/authMiddleware');

// ==========================================================
// POST /api/tracking (Criar novo Tracking) - LÓGICA DE EMAIL
// ==========================================================
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. Pega os dados do corpo da requisição (dia_de_registro REMOVIDO)
    const { nome, intensidade, idtraits } = req.body;

    // 2. Pega os dados do usuário LOGADO (o "Criador")
    const { id: creatorId, email: creatorEmail } = req.user;

    // 3. Validação básica (verificação de dia_de_registro REMOVIDA)
    if (!idtraits) {
      return res.status(400).json({ 
        error: 'Campo idtraits (a qual trait pertence) é obrigatório.' 
      });
    }

    const hoje = new Date().toISOString().split('T')[0];

    // 3.2
    const existingTracking = await db('tracking')
      .where({
        idtraits: idtraits,
        dia_de_registro: hoje // Usa a data gerada
      })
      .first(); 

    if (existingTracking) {
      // 409 Conflict é o status correto para "recurso já existe"
      return res.status(409).json({ 
        error: 'Já existe um registro de tracking para esta característica neste dia.' 
      });
    }

    // 4. Prepara o objeto para inserção [MODIFICADO]
    const newTrackingData = {
      nome,
      intensidade,
      dia_de_registro: hoje, // Salva a data de hoje
      idtraits, // O "pai" deste tracking
    };

    // 5. Lógica do Criador (igual)
    const paciente = await db('paciente').where({ email: creatorEmail }).first();

    if (paciente) {
        newTrackingData.idpaciente_criador = creatorId;
    } else {
        const cuidador = await db('cuidador').where({ email: creatorEmail }).first();
        if (cuidador) {
            newTrackingData.idcuidador_criador = creatorId;
        } else {
            return res.status(401).json({ error: 'Usuário (criador) inválido ou não autorizado a criar.' });
        }
    }

    // 6. Insere no banco
    const [createdTracking] = await db('tracking').insert(newTrackingData).returning('*');

    res.status(201).json(createdTracking);

  } catch (error) {
    console.error('Erro ao criar Tracking:', error);
    if (error.code === '23505') { // 23505 = unique_violation
        return res.status(409).json({ error: 'Já existe um registro de tracking para esta característica neste dia.' });
    }

    // Erro de FK (ex: IDTraits (pai) não existe)
    if (error.code === '23503') {
      return res.status(404).json({ error: 'A Trait (característica) especificada não foi encontrada.' });
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
    const { nome, intensidade, dia_de_registro } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (intensidade !== undefined) updateData.intensidade = intensidade;
    if (dia_de_registro !== undefined) updateData.dia_de_registro = dia_de_registro;

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