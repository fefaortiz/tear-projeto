const express = require('express');
const router = express.Router();
const db = require('../database/connection');
// Precisamos do middleware para saber QUEM está criando o Tracking
const verifyToken = require('../middleware/authMiddleware');

// ==========================================================
// POST /api/tracking (Criar novo Tracking)
// ==========================================================
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. Pega os dados do corpo da requisição
    // O IDTraits é a "Trait" pai da qual este tracking faz parte.
    const { Nome, Intensidade, Dia_de_Registro, IDTraits } = req.body;

    // 2. Pega os dados do usuário LOGADO (o "Criador")
    const { id: creatorId, role: creatorRole } = req.user;

    // 3. Validação básica
    if (!IDTraits || !Dia_de_Registro) {
      return res.status(400).json({ 
        error: 'Campos IDTraits (a qual trait pertence) e Dia_de_Registro são obrigatórios.' 
      });
    }

    // 4. Prepara o objeto para inserção
    const newTrackingData = {
      Nome,
      Intensidade,
      Dia_de_Registro,
      IDTraits, // O "pai" deste tracking
    };

    // 5. Adiciona o "Criador" com base no role do usuário logado
    if (creatorRole === 'paciente') {
      newTrackingData.IDPaciente_Criador = creatorId;
    } else if (creatorRole === 'cuidador') {
      newTrackingData.IDCuidador_Criador = creatorId;
    } else {
      return res.status(403).json({ error: 'Apenas pacientes ou cuidadores podem criar trackings.' });
    }

    // 6. Insere no banco
    const [createdTracking] = await db('tracking').insert(newTrackingData).returning('*');

    res.status(201).json(createdTracking);

  } catch (error) {
    console.error('Erro ao criar Tracking:', error);
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
    // É essencial filtrar pela Trait (IDTraits).
    const { idtrait } = req.query; // ex: /api/tracking?idtrait=5

    if (!idtrait) {
      return res.status(400).json({ 
        error: 'O parâmetro de query "idtrait" é obrigatório.' 
      });
    }

    // Busca todos os trackings que pertencem (IDTraits) à Trait informada
    // Ordena por data para mostrar a evolução
    const trackings = await db('tracking')
      .where({ IDTraits: idtrait })
      .orderBy('Dia_de_Registro', 'asc'); // 'asc' (ascendente) para ver a linha do tempo

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
    
    // Campos que podem ser atualizados em um registro de tracking
    const { Nome, Intensidade, Dia_de_Registro } = req.body;

    const updateData = {};
    if (Nome !== undefined) updateData.Nome = Nome;
    if (Intensidade !== undefined) updateData.Intensidade = Intensidade;
    if (Dia_de_Registro !== undefined) updateData.Dia_de_Registro = Dia_de_Registro;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const [updatedTracking] = await db('tracking')
      .where({ IDTracking: idtracking })
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
      .where({ IDTracking: idtracking })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Registro de Tracking não encontrado.' });
    }

    // Esta tabela não tem 'ON DELETE CASCADE' para outras,
    // então a deleção é simples.
    res.status(200).json({ message: 'Registro de Tracking deletado com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar Tracking:', error);
    res.status(500).json({ error: 'Erro interno ao deletar Tracking.' });
  }
});

module.exports = router;