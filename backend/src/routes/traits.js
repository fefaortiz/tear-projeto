const express = require('express');
const router = express.Router();
const db = require('../database/connection');
// Precisamos do middleware para saber QUEM está criando a Trait
const verifyToken = require('../middleware/authMiddleware'); 

// ==========================================================
// POST /api/traits (Criar nova Trait)
// ==========================================================
router.post('/:idpaciente', verifyToken, async (req, res) => {
  try {
    const { idpaciente } = req.params;

    // [MODIFICADO] 'data_de_criacao' removida do body
    const { nome, descricao, intensidade } = req.body;

    const { id: creatorId, email: creatorEmail } = req.user;

    let role = null;

    // [MODIFICADO] Validação de 'data_de_criacao' removida
    if (!nome || !idpaciente) {
      return res.status(400).json({ 
        // Mensagem de erro atualizada
        error: 'Campos Nome e IDPaciente (dono) são obrigatórios.' 
      });
    }

    // [NOVO] Gera a data de hoje
    const hoje = new Date().toISOString().split('T')[0];

    // (O restante da sua lógica de autorização permanece)
    const paciente = await db('paciente').where({ email: creatorEmail }).first();
    const pacienteDoTrait = await db('paciente').where({ idpaciente: idpaciente }).first();
    
    if (paciente) {
      role = 'paciente';
    } else {
      const cuidador = await db('cuidador').where({ email: creatorEmail }).first();
      if (cuidador) {
          role = 'cuidador';
          if (pacienteDoTrait.idcuidador !== creatorId) {
            return res.status(403).json({ error: 'Usuário do token não autorizado a criar um trait pelo paciente.' });
          }
      }
    }

    if (role) {
      console.log('O papel (role) do usuário é:', role);
    } else {
      return res.status(404).json({ error: 'Usuário do token não encontrado.' });
    }

    // [MODIFICADO] Objeto usa a data 'hoje'
    const newTraitData = {
      nome,
      descricao,
      intensidade,
      data_de_criacao: hoje, // <-- Alterado
      idpaciente,
    };

    if (role === 'paciente') {
      newTraitData.idpaciente_criador = creatorId;
    } else if (role === 'cuidador') {
      newTraitData.idcuidador_criador = creatorId;
    } else {
      // (Esta mensagem de erro está copiada do seu código)
      return res.status(403).json({ error: 'Apenas pacientes ou cuidadores podem criar trackings.' });
    }

    const [createdTrait] = await db('traits').insert(newTraitData).returning('*');

    res.status(201).json(createdTrait);

  } catch (error) {
    console.error('Erro ao criar Trait:', error);
    if (error.code === '23503') {
      return res.status(404).json({ error: 'O paciente (dono) especificado não foi encontrado.' });
    }
    res.status(500).json({ error: 'Erro interno ao criar Trait.' });
  }
});

// ==========================================================
// GET /api/traits/:idpaciente (Buscar Traits com Status de Tracking Diário)
// ==========================================================
router.get('/:idpaciente', verifyToken, async (req, res) => {
  try {
    const { idpaciente } = req.params;

    if (!idpaciente) {
      // Este erro deve ser ajustado, pois 'idpaciente' vem de req.params, não de query.
      return res.status(400).json({ 
        error: 'O parâmetro de rota "idpaciente" é obrigatório.' 
      });
    }

    // Pega a data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];

    // 1. Buscar todas as Traits para o IDPaciente
    let traits = await db('traits')
      .where({ idpaciente: idpaciente })
      .orderBy('data_de_criacao', 'desc')
      .select('idtraits', 'nome', 'descricao', 'intensidade', 'data_de_criacao'); // Seleciona campos para clareza

    if (traits.length === 0) {
        return res.status(200).json([]); // Retorna array vazio se não houver traits
    }

    // 2. Para cada Trait, verificar se existe um registro de Tracking para hoje
    // Usamos Promise.all para executar todas as verificações de forma paralela.
    const traitsWithStatus = await Promise.all(traits.map(async (trait) => {
      // Verifica se existe um registro de tracking para esta Trait e esta data
      const existingTracking = await db('tracking')
        .where({
          idtraits: trait.idtraits,
          dia_de_registro: hoje
        })
        .first(); 

      return {
        ...trait,
        // Adiciona o flag booleano
        tracking_registrado_hoje: !!existingTracking, 
      };
    }));


    res.status(200).json(traitsWithStatus);

  } catch (error) {
    console.error('Erro ao buscar Traits e status de Tracking:', error);
    res.status(500).json({ error: 'Erro interno ao buscar Traits.' });
  }
});

// ==========================================================
// PUT /api/traits/:id (Atualizar Trait)
// ==========================================================
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id: idtrait } = req.params;

    const { nome, descricao, intensidade } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (intensidade !== undefined) updateData.intensidade = intensidade;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido.' });
    }

    const [updatedTrait] = await db('traits')
      .where({ idtraits: idtrait })
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
      .where({ idtraits: idtrait })
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