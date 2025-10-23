// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.usuario = decoded;
    next();
  });
};

// Gerar token JWT
const gerarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { verificarToken, gerarToken, JWT_SECRET };

