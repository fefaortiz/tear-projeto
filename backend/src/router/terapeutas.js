const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET route to fetch all therapists
// O caminho é '/', pois o prefixo /api/terapeutas será definido no server.js
router.get('/', async (req, res) => {
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

// Você poderia adicionar outras rotas de terapeuta aqui (GET por ID, POST, etc.)

module.exports = router;