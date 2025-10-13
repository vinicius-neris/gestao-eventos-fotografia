// routes/participacoes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Criar uma nova participação (atribuir fotógrafo a evento)
router.post('/', (req, res) => {
  const { evento_id, fotografo_id, horas_trabalhadas, valor_recebido } = req.body;
  
  // Validação básica
  if (!evento_id || !fotografo_id || !horas_trabalhadas) {
    return res.status(400).json({ error: 'Evento, fotógrafo e horas trabalhadas são obrigatórios.' });
  }
  
  if (isNaN(horas_trabalhadas) || horas_trabalhadas <= 0) {
    return res.status(400).json({ error: 'Horas trabalhadas deve ser um número positivo.' });
  }
  
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
    
    // Calcular valor_recebido se não fornecido
    const valorFinal = valor_recebido || (fotografo.valor_hora * horas_trabalhadas);
    
    const stmt = db.prepare('INSERT INTO participacoes (evento_id, fotografo_id, horas_trabalhadas, valor_recebido) VALUES (?, ?, ?, ?)');
    const info = stmt.run(evento_id, fotografo_id, horas_trabalhadas, valorFinal);
    
    res.status(201).json({ 
      id: info.lastInsertRowid, 
      evento_id, 
      fotografo_id, 
      horas_trabalhadas, 
      valor_recebido: valorFinal 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as participações
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT p.*, e.nome as evento_nome, f.nome as fotografo_nome 
      FROM participacoes p 
      JOIN eventos e ON p.evento_id = e.id 
      JOIN fotografos f ON p.fotografo_id = f.id
    `);
    const participacoes = stmt.all();
    res.json(participacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar participações por evento
router.get('/evento/:evento_id', (req, res) => {
  const { evento_id } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT p.*, f.nome as fotografo_nome, f.valor_hora 
      FROM participacoes p 
      JOIN fotografos f ON p.fotografo_id = f.id 
      WHERE p.evento_id = ?
    `);
    const participacoes = stmt.all(evento_id);
    res.json(participacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar participações por fotógrafo
router.get('/fotografo/:fotografo_id', (req, res) => {
  const { fotografo_id } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT p.*, e.nome as evento_nome, e.data_evento 
      FROM participacoes p 
      JOIN eventos e ON p.evento_id = e.id 
      WHERE p.fotografo_id = ?
    `);
    const participacoes = stmt.all(fotografo_id);
    res.json(participacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar uma participação
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { horas_trabalhadas, valor_recebido } = req.body;
  
  if (!horas_trabalhadas && !valor_recebido) {
    return res.status(400).json({ error: 'Horas trabalhadas ou valor recebido devem ser fornecidos.' });
  }
  
  try {
    const participacao = db.prepare('SELECT * FROM participacoes WHERE id = ?').get(id);
    if (!participacao) {
      return res.status(404).json({ error: 'Participação não encontrada.' });
    }
    
    const novasHoras = horas_trabalhadas || participacao.horas_trabalhadas;
    const novoValor = valor_recebido || participacao.valor_recebido;
    
    const stmt = db.prepare('UPDATE participacoes SET horas_trabalhadas = ?, valor_recebido = ? WHERE id = ?');
    stmt.run(novasHoras, novoValor, id);
    
    res.json({ id, horas_trabalhadas: novasHoras, valor_recebido: novoValor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar uma participação
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM participacoes WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Participação não encontrada.' });
    }
    
    res.json({ message: 'Participação deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

