// routes/faturas.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// gerar fatura para pedido
router.post('/', (req, res) => {
  const { pedido_id, valor_total, data_vencimento } = req.body;
  if (!pedido_id || !valor_total) return res.status(400).json({ error: 'pedido_id e valor_total obrigatórios' });
  const exist = db.prepare('SELECT id FROM pedidos WHERE id = ?').get(pedido_id);
  if (!exist) return res.status(404).json({ error: 'Pedido não encontrado' });
  const stmt = db.prepare('INSERT INTO faturas (pedido_id, valor_total, data_vencimento) VALUES (?,?,?)');
  const info = stmt.run(pedido_id, valor_total, data_vencimento || null);
  // marcar pedido como faturado
  db.prepare("UPDATE pedidos SET status = 'faturado' WHERE id = ?").run(pedido_id);
  const fatura = db.prepare('SELECT * FROM faturas WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(fatura);
});

// listar faturas
router.get('/', (req, res) => {
  const { pedido_id, status_pagamento } = req.query;
  let sql = 'SELECT f.*, p.descricao as pedido_desc FROM faturas f JOIN pedidos p ON f.pedido_id = p.id';
  const where = [];
  const params = [];
  if (pedido_id) { where.push('f.pedido_id = ?'); params.push(pedido_id); }
  if (status_pagamento) { where.push('f.status_pagamento = ?'); params.push(status_pagamento); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY f.data_emissao DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// detalhe de fatura
router.get('/:id', (req, res) => {
  const f = db.prepare('SELECT f.*, p.descricao as pedido_desc FROM faturas f JOIN pedidos p ON f.pedido_id = p.id WHERE f.id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Fatura não encontrada' });
  res.json(f);
});

module.exports = router;

