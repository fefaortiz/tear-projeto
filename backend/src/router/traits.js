const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET /api/traits (Buscar todos)
router.get('/', async (req, res) => {
  // Lógica para buscar todos os traits
  res.json({ message: 'GET all traits' });
});

// POST /api/traits (Criar novo)
router.post('/', async (req, res) => {
  // Lógica para criar um novo traits com req.body
  res.json({ message: 'POST new traits' });
});

// PUT /api/traits/:id (Atualizar)
router.put('/:id', async (req, res) => {
  // Lógica para atualizar o traits com id = req.params.id
  res.json({ message: `PUT traits ${req.params.id}` });
});

// DELETE /api/traits/:id (Deletar)
router.delete('/:id', async (req, res) => {
  // Lógica para deletar o traits com id = req.params.id
  res.json({ message: `DELETE traits ${req.params.id}` });
});

module.exports = router;