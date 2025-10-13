// routes/faturas.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajuste o caminho para db.js

// Rota para criar uma nova fatura
router.post('/', (req, res) => {
  const { pedido_id, valor_total, data_vencimento } = req.body;
  
  // Validação básica
  if (!pedido_id || !valor_total) {
    return res.status(400).json({ error: 'Pedido e valor total são obrigatórios.' });
  }
  
  if (isNaN(valor_total) || valor_total <= 0) {
    return res.status(400).json({ error: 'Valor total deve ser um número positivo.' });
  }
  
  try {
    // Verificar se o pedido existe
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedido_id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    
    const stmt = db.prepare('INSERT INTO faturas (pedido_id, valor_total, data_vencimento) VALUES (?, ?, ?)');
    const info = stmt.run(pedido_id, valor_total, data_vencimento);
    // Atualizar status do pedido para 'faturado'
    db.prepare('UPDATE pedidos SET status = ? WHERE id = ?').run('faturado', pedido_id);
    res.status(201).json({ id: info.lastInsertRowid, pedido_id, valor_total, data_vencimento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar todas as faturas
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT f.*, p.descricao as pedido_desc, p.valor as pedido_valor, u.nome as cliente_nome FROM faturas f JOIN pedidos p ON f.pedido_id = p.id JOIN usuarios u ON p.cliente_id = u.id');
    const faturas = stmt.all();
    res.json(faturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para obter uma fatura por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT f.*, p.descricao as pedido_desc, p.valor as pedido_valor, u.nome as cliente_nome FROM faturas f JOIN pedidos p ON f.pedido_id = p.id JOIN usuarios u ON p.cliente_id = u.id WHERE f.id = ?');
    const fatura = stmt.get(id);
    if (fatura) {
      res.json(fatura);
    } else {
      res.status(404).json({ error: 'Fatura não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

