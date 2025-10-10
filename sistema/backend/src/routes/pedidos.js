// routes/pedidos.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// criar pedido
router.post('/', (req, res) => {
  const { evento_id, cliente_id, descricao, valor } = req.body;
  if (!cliente_id || !valor) return res.status(400).json({ error: 'cliente_id e valor são obrigatórios' });
  const stmt = db.prepare('INSERT INTO pedidos (evento_id, cliente_id, descricao, valor) VALUES (?,?,?,?)');
  const info = stmt.run(evento_id || null, cliente_id, descricao || null, valor);
  const novo = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(novo);
});

// listar pedidos (filtros)
router.get('/', (req, res) => {
  const { cliente_id, status } = req.query;
  let sql = 'SELECT p.*, u.nome as cliente_nome FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id';
  const where = [];
  const params = [];
  if (cliente_id) { where.push('p.cliente_id = ?'); params.push(cliente_id); }
  if (status) { where.push('p.status = ?'); params.push(status); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// detalhar pedido
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT p.*, u.nome as cliente_nome FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id WHERE p.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(row);
});

module.exports = router;

