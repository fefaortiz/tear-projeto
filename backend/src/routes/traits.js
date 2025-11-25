const express = require('express');
const router = express.Router();
const db = require('../database/connection');
// Precisamos do middleware para saber QUEM está criando a Trait
const verifyToken = require('../middleware/authMiddleware'); 

// ==========================================================
// POST /api/traits/:idpaciente (Criar nova Trait)
// ==========================================================
router.post('/:idpaciente', verifyToken, async (req, res) => {
  try {
    const { idpaciente } = req.params;

    // Campos do corpo da requisição
    const { nome, descricao, intensidade } = req.body;

    // 1. Pega ID e ROLE diretamente do Token (payload)
    // O middleware verifyToken já injetou estes dados em req.user
    const { id: creatorId, role } = req.user; 

    // 2. Validação básica
    if (!nome || !idpaciente) {
      return res.status(400).json({ 
        error: 'Campos Nome e IDPaciente (dono) são obrigatórios.' 
      });
    }

    // Gera a data de hoje
    const hoje = new Date().toISOString().split('T')[0];

    // 3. Busca o Paciente DONO do trait (Necessário para a verificação do cuidador)
    const pacienteDoTrait = await db('paciente').where({ idpaciente: idpaciente }).first();
    
    if (!pacienteDoTrait) {
      return res.status(404).json({ error: 'O paciente (dono) especificado não foi encontrado.' });
    }

    // 4. Lógica de Autorização e Atribuição do Criador
    const newTraitData = {
      nome,
      descricao,
      intensidade,
      data_de_criacao: hoje,
      idpaciente, // Dono da Trait (o paciente)
    };
    
    if (role === 'paciente') {
      // Regra de segurança: Paciente só pode criar traits para si mesmo
      // Converte para Number para garantir comparação correta (ID do token é number, idpaciente de params é string)
      if (Number(idpaciente) !== creatorId) { 
          return res.status(403).json({ error: 'Paciente só pode criar traits para si mesmo.' });
      }
      newTraitData.idpaciente_criador = creatorId;
    } else if (role === 'cuidador') {
      // Regra de autorização: Cuidador só pode criar traits para pacientes vinculados
      if (pacienteDoTrait.idcuidador !== creatorId) {
        return res.status(403).json({ error: 'Cuidador não autorizado a criar Trait para este paciente.' });
      }
      newTraitData.idcuidador_criador = creatorId;
    } else {
      // Terapeutas ou outros papéis não devem criar traits
      return res.status(403).json({ error: 'Apenas pacientes ou cuidadores podem criar traits.' });
    }

    // 5. Insere no banco
    const [createdTrait] = await db('traits').insert(newTraitData).returning('*');

    res.status(201).json(createdTrait);

  } catch (error) {
    console.error('Erro ao criar Trait:', error);
    if (error.code === '23503') {
      // Este erro de FK já está coberto pela checagem do pacienteDoTrait, mas é bom manter
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

// ==========================================================
// GET /api/traits/daily-tracking/:idpaciente 
// ==========================================================
router.get('/daily-tracking/:idpaciente', verifyToken, async (req, res) => {
  try {
    const { idpaciente } = req.params;
    const today = new Date().toISOString().split('T')[0]; 

    // 1. Busca inicial das Traits com o Tracking de HOJE
    const traitsWithTracking = await db('traits as t')
      .select(
        't.idtraits',
        't.nome',
        't.descricao',
        't.intensidade as intensidade_default',
        'tr.idtracking',
        'tr.intensidade as nota_hoje',
        // [CORREÇÃO] Pega os criadores da tabela 'traits' (t), não 'tracking' (tr)
        't.idpaciente_criador',
        't.idcuidador_criador'
      )
      .where('t.idpaciente', idpaciente)
      .leftJoin('tracking as tr', function() {
        this.on('tr.idtraits', '=', 't.idtraits').andOn('tr.dia_de_registro', '=', db.raw('?', [today]));
      })
      .orderBy('t.idtraits', 'asc');

    // 2. Processar os resultados para adicionar o nome do criador
    const result = await Promise.all(traitsWithTracking.map(async (trait) => {
      let nomeCriador = null;
      let roleCriador = null;
      const atualizadoHoje = !!trait.idtracking; 

      if (trait.idpaciente_criador) {
        const paciente = await db('paciente').select('nome').where('idpaciente', trait.idpaciente_criador).first();
        if (paciente) {
          nomeCriador = paciente.nome;
          roleCriador = 'Paciente';
        }
      } else if (trait.idcuidador_criador) {
        const cuidador = await db('cuidador').select('nome').where('idcuidador', trait.idcuidador_criador).first();
        if (cuidador) {
          nomeCriador = cuidador.nome;
          roleCriador = 'Cuidador';
        }
      }

      return {
        idtraits: trait.idtraits,
        nome: trait.nome,
        nota: atualizadoHoje ? trait.nota_hoje : trait.intensidade_default || 'Não registrado', 
        atualizadoHoje: atualizadoHoje,
        criador: nomeCriador,
        criadorRole: roleCriador,
      };
    }));

    res.status(200).json(result);

  } catch (error) {
    console.error('Erro ao listar traits com tracking:', error);
    res.status(500).json({ error: 'Erro interno ao buscar dados de tracking diário.' });
  }
});

module.exports = router;