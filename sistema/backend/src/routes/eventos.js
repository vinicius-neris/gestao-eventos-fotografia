// routes/eventos.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.post('/', (req, res) => {
  const { nome, data_evento, hora_evento, local, criado_por } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome do evento obrigatório' });
  const stmt = db.prepare('INSERT INTO eventos (nome,data_evento,hora_evento,local,criado_por) VALUES (?,?,?,?,?)');
  const info = stmt.run(nome, data_evento || null, hora_evento || null, local || null, criado_por || null);
  const ev = db.prepare('SELECT * FROM eventos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(ev);
});

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM eventos ORDER BY data_evento DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const ev = db.prepare('SELECT * FROM eventos WHERE id = ?').get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Evento não encontrado' });
  res.json(ev);
});

module.exports = router;

