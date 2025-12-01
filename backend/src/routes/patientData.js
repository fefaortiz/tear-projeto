const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const verifyToken = require('../middleware/authMiddleware');

// =======================================================================
// 1. Evolução Semanal por Trait (Para o WeeklyTrackingChart)
// Retorna: Array de objetos { dia_de_registro, intensidade }
// =======================================================================
router.get('/weekly-history/:idtrait', verifyToken, async (req, res) => {
  try {
    const { idtrait } = req.params;
    const { id } = req.user; // ID do usuário logado (extraído do Token)

    // Calcula data de 7 dias atrás
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString().split('T')[0];

    const history = await db('tracking')
      .select('dia_de_registro', 'intensidade')
      .where({ 
        idtraits: idtrait,
        idpaciente_criador: id // Filtra apenas pelos dados deste paciente
      })
      .andWhere('dia_de_registro', '>=', dateString)
      .orderBy('dia_de_registro', 'asc');

    res.json(history);

  } catch (error) {
    console.error('Erro ao buscar histórico semanal:', error);
    res.status(500).json({ error: 'Erro interno ao buscar dados do gráfico.' });
  }
});

// =======================================================================
// 2. Frequência de Intensidade (Para o TraitFrequencyChart)
// Retorna: Array [{ intensidade: 1, frequencia: 5 }, { intensidade: 2, frequencia: 10 }...]
// =======================================================================
router.get('/frequency/:idtrait', verifyToken, async (req, res) => {
  try {
    const { idtrait } = req.params;
    const { id } = req.user;

    const frequency = await db('tracking')
      .select('intensidade')
      .count('* as frequencia')
      .where({ 
        idtraits: idtrait,
        idpaciente_criador: id 
      })
      .groupBy('intensidade')
      .orderBy('intensidade', 'asc');

    // O banco pode retornar strings no count, convertemos para número no frontend ou aqui.
    // O Knex/PG geralmente retorna string para BigInt.
    const formattedFreq = frequency.map(item => ({
        intensidade: item.intensidade,
        frequencia: Number(item.frequencia)
    }));

    res.json(formattedFreq);

  } catch (error) {
    console.error('Erro ao buscar frequência:', error);
    res.status(500).json({ error: 'Erro interno ao buscar frequência.' });
  }
});

// =======================================================================
// 3. Taxa de Preenchimento Diário (Para o DailyCompletionChart)
// Retorna: { totalTraits: 5, completedToday: 2, percentage: 40 }
// =======================================================================
router.get('/daily-completion', verifyToken, async (req, res) => {
  try {
    const { id } = req.user;
    const today = new Date().toISOString().split('T')[0];

    // A. Contar Total de Traits Existentes no Sistema (Ou atribuídos ao paciente)
    // Assumindo que todos os traits são visíveis para todos:
    const totalTraitsResult = await db('traits').count('* as total').first();
    const totalTraits = Number(totalTraitsResult.total);

    // B. Contar quantos traits DIFERENTES o usuário preencheu hoje
    const completedResult = await db('tracking')
      .where({ 
        idpaciente_criador: id,
        dia_de_registro: today
      })
      .countDistinct('idtraits as completed')
      .first();
    
    const completedToday = Number(completedResult.completed);

    // C. Calcular Porcentagem
    const percentage = totalTraits > 0 
        ? Math.round((completedToday / totalTraits) * 100) 
        : 0;

    res.json({
      totalTraits,
      completedToday,
      percentage
    });

  } catch (error) {
    console.error('Erro ao buscar preenchimento diário:', error);
    res.status(500).json({ error: 'Erro interno ao calcular status diário.' });
  }
});

// =======================================================================
// 4. Média Geral Semanal (Para o AverageIntensityCard)
// Retorna: { average: 3.5 }
// =======================================================================
router.get('/weekly-average', verifyToken, async (req, res) => {
  try {
    const { id } = req.user;

    // Data de 7 dias atrás
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString().split('T')[0];

    const result = await db('tracking')
      .avg('intensidade as media')
      .where({ idpaciente_criador: id })
      .andWhere('dia_de_registro', '>=', dateString)
      .first();

    // Se não houver registros, a média vem null
    const average = result.media ? Number(result.media).toFixed(1) : "0.0";

    res.json({ average });

  } catch (error) {
    console.error('Erro ao buscar média semanal:', error);
    res.status(500).json({ error: 'Erro interno ao calcular média.' });
  }
});

module.exports = router;