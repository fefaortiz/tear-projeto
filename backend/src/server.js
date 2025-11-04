const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.js');
const terapeutaRoutes = require('./routes/terapeutas.js');
const trackingRoutes = require('./routes/tracking.js');
const traitsRoutes = require('./routes/traits.js');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Uma rota de teste para garantir que a API está no ar
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Olá do Backend!' });
});

// --- 3. Registrar as Rotas com Prefixos ---
// Todas as rotas em auth.js começarão com /api/auth
app.use('/api/auth', authRoutes); 

// Todas as rotas em terapeuta.js começarão com /api/terapeutas
app.use('/api/terapeutas', terapeutaRoutes); 

// Todas as rotas em tracking.js começarão com /api/tracking
app.use('/api/tracking', trackingRoutes); 

// Todas as rotas em traits.js começarão com /api/traits
app.use('/api/traits', traitsRoutes); 

// --- 4. Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
});