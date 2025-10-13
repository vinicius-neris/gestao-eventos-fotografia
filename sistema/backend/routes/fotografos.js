// routes/fotografos.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Criar um novo fotógrafo
router.post('/', (req, res) => {
  const { nome, valor_hora } = req.body;
  
  // Validação básica
  if (!nome || !valor_hora) {
    return res.status(400).json({ error: 'Nome e valor por hora são obrigatórios.' });
  }
  
  if (isNaN(valor_hora) || valor_hora <= 0) {
    return res.status(400).json({ error: 'Valor por hora deve ser um número positivo.' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO fotografos (nome, valor_hora) VALUES (?, ?)');
    const info = stmt.run(nome, valor_hora);
    res.status(201).json({ id: info.lastInsertRowid, nome, valor_hora });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos os fotógrafos
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM fotografos');
    const fotografos = stmt.all();
    res.json(fotografos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um fotógrafo por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM fotografos WHERE id = ?');
    const fotografo = stmt.get(id);
    if (fotografo) {
      res.json(fotografo);
    } else {
      res.status(404).json({ error: 'Fotógrafo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um fotógrafo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, valor_hora } = req.body;
  
  if (!nome || !valor_hora) {
    return res.status(400).json({ error: 'Nome e valor por hora são obrigatórios.' });
  }
  
  if (isNaN(valor_hora) || valor_hora <= 0) {
    return res.status(400).json({ error: 'Valor por hora deve ser um número positivo.' });
  }
  
  try {
    const stmt = db.prepare('UPDATE fotografos SET nome = ?, valor_hora = ? WHERE id = ?');
    const info = stmt.run(nome, valor_hora, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Fotógrafo não encontrado.' });
    }
    
    res.json({ id, nome, valor_hora });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar um fotógrafo
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM fotografos WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Fotógrafo não encontrado.' });
    }
    
    res.json({ message: 'Fotógrafo deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

