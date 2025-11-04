const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET /api/tracking (Buscar todos)
router.get('/', async (req, res) => {
  // Lógica para buscar todos os trackings
  res.json({ message: 'GET all tracking' });
});

// POST /api/tracking (Criar novo)
router.post('/', async (req, res) => {
  // Lógica para criar um novo tracking com req.body
  res.json({ message: 'POST new tracking' });
});

// PUT /api/tracking/:id (Atualizar)
router.put('/:id', async (req, res) => {
  // Lógica para atualizar o tracking com id = req.params.id
  res.json({ message: `PUT tracking ${req.params.id}` });
});

// DELETE /api/tracking/:id (Deletar)
router.delete('/:id', async (req, res) => {
  // Lógica para deletar o tracking com id = req.params.id
  res.json({ message: `DELETE tracking ${req.params.id}` });
});

module.exports = router;