// routes/pagamentos.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ajuste o caminho para db.js
const path = require('path');

module.exports = (upload) => {
  // Rota para registrar um novo pagamento
  router.post('/', upload.single('comprovante'), (req, res) => {
    const { fatura_id, forma_pagamento_id, valor_pago } = req.body;
    const comprovante_path = req.file ? `/uploads/${req.file.filename}` : null;

    // Validação básica
    if (!fatura_id || !valor_pago) {
      return res.status(400).json({ error: 'Fatura e valor pago são obrigatórios.' });
    }
    
    if (isNaN(valor_pago) || valor_pago <= 0) {
      return res.status(400).json({ error: 'Valor pago deve ser um número positivo.' });
    }

    try {
      // Verificar se a fatura existe
      const fatura = db.prepare('SELECT valor_total FROM faturas WHERE id = ?').get(fatura_id);
      if (!fatura) {
        return res.status(404).json({ error: 'Fatura não encontrada.' });
      }
      
      const stmt = db.prepare('INSERT INTO pagamentos (fatura_id, forma_pagamento_id, valor_pago, comprovante_path) VALUES (?, ?, ?, ?)');
      const info = stmt.run(fatura_id, forma_pagamento_id, valor_pago, comprovante_path);

      // Atualizar status da fatura para 'pago' se o valor pago for igual ou maior ao valor total da fatura
      if (parseFloat(valor_pago) >= fatura.valor_total) {
        db.prepare('UPDATE faturas SET status_pagamento = ? WHERE id = ?').run('pago', fatura_id);
      }

      res.status(201).json({ id: info.lastInsertRowid, fatura_id, forma_pagamento_id, valor_pago, comprovante_path });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para listar todos os pagamentos
  router.get('/', (req, res) => {
    try {
      const stmt = db.prepare('SELECT p.*, f.valor_total as fatura_valor_total, fp.nome as forma_pagamento_nome FROM pagamentos p JOIN faturas f ON p.fatura_id = f.id LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id');
      const pagamentos = stmt.all();
      res.json(pagamentos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para obter um pagamento por ID
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('SELECT p.*, f.valor_total as fatura_valor_total, fp.nome as forma_pagamento_nome FROM pagamentos p JOIN faturas f ON p.fatura_id = f.id LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id WHERE p.id = ?');
      const pagamento = stmt.get(id);
      if (pagamento) {
        res.json(pagamento);
      } else {
        res.status(404).json({ error: 'Pagamento não encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
