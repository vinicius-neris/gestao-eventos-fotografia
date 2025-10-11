// routes/usuarios.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajuste o caminho para db.js
const bcrypt = require('bcryptjs'); // Para hash de senhas

// Rota de login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  const usuario = stmt.get(email);

  if (!usuario) {
    return res.status(400).json({ error: 'Usuário não encontrado.' });
  }

  // Comparar a senha fornecida com a senha_hash armazenada
  // Verificar se a senha é hash ou texto simples (para compatibilidade com admin@local)
  let senhaValida = false;
  if (usuario.senha_hash.startsWith('$2')) {
    // É um hash bcrypt
    senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
  } else {
    // É texto simples (para o admin@local/admin)
    senhaValida = senha === usuario.senha_hash;
  }
  
  if (!senhaValida) {
    return res.status(400).json({ error: 'Senha incorreta.' });
  }

  // Retornar informações do usuário (sem a senha_hash)
  const { senha_hash, ...usuarioSemSenha } = usuario;
  res.json(usuarioSemSenha);
});

// Rota para criar um novo usuário (exemplo, pode ser expandida)
router.post('/', (req, res) => {
  const { nome, email, senha, role } = req.body;
  
  // Validação básica
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  
  // Gerar hash da senha
  const senha_hash = bcrypt.hashSync(senha, 10);

  try {
    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(nome, email, senha_hash, role || 'cliente');
    res.status(201).json({ id: info.lastInsertRowid, nome, email, role: role || 'cliente' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
