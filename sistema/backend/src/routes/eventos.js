// routes/eventos.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajuste o caminho para db.js

// Rota para criar um novo evento
router.post('/', (req, res) => {
  const { nome, data_evento, hora_evento, local, criado_por } = req.body;
  
  // Validação básica
  if (!nome || !criado_por) {
    return res.status(400).json({ error: 'Nome e criador são obrigatórios.' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO eventos (nome, data_evento, hora_evento, local, criado_por) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(nome, data_evento, hora_evento, local, criado_por);
    res.status(201).json({ id: info.lastInsertRowid, nome, data_evento, hora_evento, local, criado_por });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar todos os eventos
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT e.*, u.nome as criado_por_nome FROM eventos e JOIN usuarios u ON e.criado_por = u.id');
    const eventos = stmt.all();
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para obter um evento por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT e.*, u.nome as criado_por_nome FROM eventos e JOIN usuarios u ON e.criado_por = u.id WHERE e.id = ?');
    const evento = stmt.get(id);
    if (evento) {
      res.json(evento);
    } else {
      res.status(404).json({ error: 'Evento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
