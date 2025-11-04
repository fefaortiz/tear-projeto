const jwt = require('jsonwebtoken');

// Lembre-se que o seu JWT_SECRET está no .env
// (O server.js já deve carregar o 'dotenv', então process.env funcionará)

function verifyToken(req, res, next) {
  // 1. Buscar o token do cabeçalho de autorização (Authorization header)
  const authHeader = req.headers.authorization;

  // 2. Verificar se o cabeçalho existe e está no formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token de autenticação não fornecido ou mal formatado.' 
    });
  }

  // 3. Extrair o token (ex: "Bearer eyJ..." -> "eyJ...")
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de autenticação não fornecido.' 
    });
  }

  try {
    // 4. Verificar se o token é válido (usando sua chave secreta)
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 5. (IMPORTANTE) Anexar o payload do token ao objeto 'req'
    // Agora, todas as rotas protegidas saberão quem é o usuário
    req.user = payload; // ex: { id: 123, email: '...', role: '...' }

    // 6. Chamar 'next()' para permitir que a requisição continue
    next();

  } catch (error) {
    // 7. Se o token for inválido ou expirado, envie um erro
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = verifyToken;
