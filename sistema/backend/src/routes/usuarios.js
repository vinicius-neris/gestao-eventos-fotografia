// routes/usuarios.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// criar usuario
router.post('/', (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha || !role) return res.status(400).json({ error: 'Dados incompletos' });
  try {
    const stmt = db.prepare('INSERT INTO usuarios (nome,email,senha_hash,role) VALUES (?,?,?,?)');
    const info = stmt.run(nome, email, senha, role);
    const user = db.prepare('SELECT id, nome, email, role FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(user);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro interno' });
  }
});

// login simples
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Dados incompletos' });
  const user = db.prepare('SELECT id, nome, email, role, senha_hash FROM usuarios WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (user.senha_hash !== senha) return res.status(401).json({ error: 'Senha inválida' });
  delete user.senha_hash;
  res.json(user);
});

// listar usuarios
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT id, nome, email, role FROM usuarios').all();
  res.json(rows);
});

module.exports = router;

