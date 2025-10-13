// routes/fotos.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

module.exports = (upload) => {
  // Upload de foto
  router.post('/', upload.single('foto'), (req, res) => {
    const { evento_id, fotografo_id } = req.body;
    
    // Validação básica
    if (!evento_id || !fotografo_id) {
      return res.status(400).json({ error: 'Evento e fotógrafo são obrigatórios.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma foto foi enviada.' });
    }
    
    const caminho = `/uploads/${req.file.filename}`;
    const uploaded_at = new Date().toISOString();
    
    try {
      // Verificar se o evento existe
      const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }
      
      // Verificar se o fotógrafo existe
      const fotografo = db.prepare('SELECT * FROM fotografos WHERE id = ?').get(fotografo_id);
      if (!fotografo) {
        return res.status(404).json({ error: 'Fotógrafo não encontrado.' });
      }
      
      const stmt = db.prepare('INSERT INTO fotos (evento_id, fotografo_id, caminho, uploaded_at) VALUES (?, ?, ?, ?)');
      const info = stmt.run(evento_id, fotografo_id, caminho, uploaded_at);
      
      res.status(201).json({ 
        id: info.lastInsertRowid, 
        evento_id, 
        fotografo_id, 
        caminho, 
        uploaded_at 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Listar todas as fotos
  router.get('/', (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT f.*, e.nome as evento_nome, fo.nome as fotografo_nome 
        FROM fotos f 
        JOIN eventos e ON f.evento_id = e.id 
        JOIN fotografos fo ON f.fotografo_id = fo.id
      `);
      const fotos = stmt.all();
      res.json(fotos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Listar fotos por evento
  router.get('/evento/:evento_id', (req, res) => {
    const { evento_id } = req.params;
    try {
      const stmt = db.prepare(`
        SELECT f.*, fo.nome as fotografo_nome 
        FROM fotos f 
        JOIN fotografos fo ON f.fotografo_id = fo.id 
        WHERE f.evento_id = ?
      `);
      const fotos = stmt.all(evento_id);
      res.json(fotos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Listar fotos por fotógrafo
  router.get('/fotografo/:fotografo_id', (req, res) => {
    const { fotografo_id } = req.params;
    try {
      const stmt = db.prepare(`
        SELECT f.*, e.nome as evento_nome, e.data_evento 
        FROM fotos f 
        JOIN eventos e ON f.evento_id = e.id 
        WHERE f.fotografo_id = ?
      `);
      const fotos = stmt.all(fotografo_id);
      res.json(fotos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Deletar uma foto
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM fotos WHERE id = ?');
      const info = stmt.run(id);
      
      if (info.changes === 0) {
        return res.status(404).json({ error: 'Foto não encontrada.' });
      }
      
      res.json({ message: 'Foto deletada com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};

