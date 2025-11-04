const express = require('express');
const router = express.Router();
const db = require('../database/connection');
// Precisamos do middleware para saber QUEM está criando a Trait
const verifyToken = require('../middleware/authMiddleware'); 

// ==========================================================
// POST /api/traits (Criar nova Trait)
// ==========================================================
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. Pega os dados do corpo da requisição
    const { Nome, Descricao, Intensidade, Data_de_Criacao, IDPaciente } = req.body;

    // 2. Pega os dados do usuário LOGADO (o "Criador")
    const { id: creatorId, role: creatorRole } = req.user;

    // 3. Validação básica
    if (!Nome || !Data_de_Criacao || !IDPaciente) {
      return res.status(400).json({ 
        error: 'Campos Nome, Data_de_Criacao e IDPaciente (dono) são obrigatórios.' 
      });
    }

    // 4. Prepara o objeto para inserção
    const newTraitData = {
      Nome,
      Descricao,
      Intensidade,
      Data_de_Criacao,
      IDPaciente, // O "dono" da Trait (para quem ela se aplica)
    };

    // 5. Adiciona o "Criador" com base no role do usuário logado
    if (creatorRole === 'paciente') {
      newTraitData.IDPaciente_Criador = creatorId;
    } else if (creatorRole === 'cuidador') {
      newTraitData.IDCuidador_Criador = creatorId;
    } else {
      // Se for um "terapeuta" ou outro role, ele não pode criar
      return res.status(403).json({ error: 'Apenas pacientes ou cuidadores podem criar traits.' });
    }

    // 6. Insere no banco
    const [createdTrait] = await db('traits').insert(newTraitData).returning('*');

    res.status(201).json(createdTrait);

  } catch (error) {
    console.error('Erro ao criar Trait:', error);
    // Erro de FK (ex: IDPaciente (dono) não existe)
    if (error.code === '23503') {
      return res.status(404).json({ error: 'O paciente (dono) especificado não foi encontrado.' });
    }
    res.status(500).json({ error: 'Erro interno ao criar Trait.' });
  }
});

// ==========================================================
// GET /api/traits (Buscar Traits por Paciente)
// ==========================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    // É essencial filtrar por paciente.
    // NUNCA retorne todas as traits de todos os pacientes.
    const { idpaciente } = req.query;

    if (!idpaciente) {
      return res.status(400).json({ 
        error: 'O parâmetro de query "idpaciente" é obrigatório.' 
      });
    }

    // Busca todas as traits que pertencem (IDPaciente) ao paciente informado
    const traits = await db('traits')
      .where({ IDPaciente: idpaciente })
      .orderBy('Data_de_Criacao', 'desc');

    res.status(200).json(traits);

  } catch (error) {
    console.error('Erro ao buscar Traits:', error);
    res.status(500).json({ error: 'Erro interno ao buscar Traits.' });
  }
});

// ==========================================================
// PUT /api/traits/:id (Atualizar Trait)
// ==========================================================
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id: idtrait } = req.params;
    // Apenas alguns campos devem ser atualizáveis
    const { Nome, Descricao, Intensidade } = req.body;

    const updateData = {};
    if (Nome !== undefined) updateData.Nome = Nome;
    if (Descricao !== undefined) updateData.Descricao = Descricao;
    if (Intensidade !== undefined) updateData.Intensidade = Intensidade;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const [updatedTrait] = await db('traits')
      .where({ IDTraits: idtrait })
      .update(updateData)
      .returning('*');

    if (!updatedTrait) {
      return res.status(404).json({ error: 'Trait não encontrada.' });
    }

    res.status(200).json(updatedTrait);

  } catch (error) {
    console.error('Erro ao atualizar Trait:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar Trait.' });
  }
});

// ==========================================================
// DELETE /api/traits/:id (Deletar Trait)
// ==========================================================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id: idtrait } = req.params;

    const deletedCount = await db('traits')
      .where({ IDTraits: idtrait })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Trait não encontrada.' });
    }

    // Graças ao "ON DELETE CASCADE" que definimos no banco,
    // todos os "Trackings" associados a esta Trait
    // também serão automaticamente deletados.

    res.status(200).json({ message: 'Trait deletada com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar Trait:', error);
    res.status(500).json({ error: 'Erro interno ao deletar Trait.' });
  }
});

module.exports = router;