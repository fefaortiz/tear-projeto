const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
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

// POST route for user login
app.post('/login', async (req, res) => {
  try {
    // a. Get email and password from the request body
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // b. Find the therapist in the database by their email
    const terapeuta = await db('terapeuta').where({ email }).first();

    if (!terapeuta) {
      // User not found (use a generic message for security)
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // c. Compare the provided password with the hashed password in the database
    // Note: This assumes your stored password is NOT hashed yet.
    // For a real app, you must hash passwords upon registration.
    const isPasswordCorrect = (senha === terapeuta.senha); // Simple check for now
    // const isPasswordCorrect = await bcrypt.compare(senha, terapeuta.senha); // Use this for hashed passwords

    if (!isPasswordCorrect) {
      // Password does not match
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // d. If credentials are correct, create a token
    const token = jwt.sign(
      { id: terapeuta.idterapeuta, email: terapeuta.email }, // Payload: data to store in the token
      process.env.JWT_SECRET, // The secret key from your .env file
      { expiresIn: '8h' } // Token expiration time
    );

    // e. Send a success response with the token
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

// POST route for user registration
app.post('/register', async (req, res) => {
  try {
    const { 
      nome, 
      email, 
      senha,
      cpf,
      crp_crm,
      telefone,
      sexo,
      data_de_nascimento
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !senha || !cpf || !crp_crm || !telefone || !sexo || !data_de_nascimento) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios!' 
      });
    }

    // Validar formato do CPF (apenas números)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    // Verificar se já existe terapeuta com o mesmo email, CPF ou CRP/CRM
    const existenteEmail = await db('terapeuta').where({ email }).first();
    const existenteCpf = await db('terapeuta').where({ cpf: cpfLimpo }).first();
    const existenteCrpCrm = await db('terapeuta').where({ crp_crm }).first();

    if (existenteEmail) {
      return res.status(400).json({ error: 'Já existe um usuário cadastrado com esse email.' });
    }
    if (existenteCpf) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }
    if (existenteCrpCrm) {
      return res.status(400).json({ error: 'CRP/CRM já cadastrado.' });
    }

    // Criptografar a senha antes de salvar
    // const hashedPassword = await bcrypt.hash(senha, 10);
    const hashedPassword = senha; // Se ainda não estiver usando bcrypt

    // Inserir o novo terapeuta no banco
    const [novoId] = await db('terapeuta')
      .insert({
        nome,
        email,
        senha: hashedPassword,
        cpf: cpfLimpo,
        crp_crm,
        telefone: telefone || null,
        sexo: sexo || null,
        data_de_nascimento: data_de_nascimento ? new Date(data_de_nascimento) : null
      })
      .returning('idterapeuta');

    // Criar um token JWT para o novo usuário
    const token = jwt.sign(
      { id: novoId, email },
      process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025',
      { expiresIn: '8h' }
    );

    // Retornar sucesso
    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token: token
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
});