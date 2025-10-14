const express = require('express');
const cors = require('cors');
const db = require('./database/connection');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Uma rota de teste para garantir que a API está no ar
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Olá do Backend!' });
});

// GET route to fetch all therapists
app.get('/terapeutas', async (req, res) => {
  try {
    // Use Knex to select all records from the 'terapeuta' table
    const terapeutas = await db('terapeuta').select('*');
    
    // Send the fetched data back as a JSON response
    return res.status(200).json(terapeutas);

  } catch (error) {
    // If an error occurs, log it and send a server error response
    console.error('Error fetching terapeutas:', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar os terapeutas.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
});