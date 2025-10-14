const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Uma rota de teste para garantir que a API está no ar
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Olá do Backend!' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
});