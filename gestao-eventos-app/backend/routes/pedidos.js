// routes/pedidos.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajuste o caminho para db.js

// Rota para criar um novo pedido
router.post('/', (req, res) => {
  const { evento_id, cliente_id, descricao, valor } = req.body;
  
  // Validação básica
  if (!cliente_id || !valor) {
    return res.status(400).json({ error: 'Cliente e valor são obrigatórios.' });
  }
  
  if (isNaN(valor) || valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo.' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO pedidos (evento_id, cliente_id, descricao, valor) VALUES (?, ?, ?, ?)');
    const info = stmt.run(evento_id, cliente_id, descricao, valor);
    res.status(201).json({ id: info.lastInsertRowid, evento_id, cliente_id, descricao, valor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar todos os pedidos
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT p.*, u.nome as cliente_nome, e.nome as evento_nome FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id LEFT JOIN eventos e ON p.evento_id = e.id');
    const pedidos = stmt.all();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para obter um pedido por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT p.*, u.nome as cliente_nome, e.nome as evento_nome FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id LEFT JOIN eventos e ON p.evento_id = e.id WHERE p.id = ?');
    const pedido = stmt.get(id);
    if (pedido) {
      res.json(pedido);
    } else {
      res.status(404).json({ error: 'Pedido não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

