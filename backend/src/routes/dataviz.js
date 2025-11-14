const express = require('express');
const router = express.Router();

const ibgeAutismData = require('../data/autism-data-completo.json');

// ==========================================================
// GET /api/dataviz/ibge-stats (Dados do IBGE sobre Autismo no Brasil)
// ==========================================================
router.get('/ibge-stats', (req, res) => {
  try {
    // Retorna os dados como JSON
    res.json(ibgeAutismData);
  } catch (error) {
    console.error('Erro ao buscar dados do IBGE:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar dados.' });
  }
});

module.exports = router;