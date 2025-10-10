// routes/pagamentos.js
const express = require('express');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

module.exports = (upload) => {
  const router = express.Router();

  // registrar pagamento com upload opcional
  router.post('/', upload.single('comprovante'), (req, res) => {
    const { fatura_id, forma_pagamento_id, valor_pago } = req.body;
    if (!fatura_id || !valor_pago) return res.status(400).json({ error: 'fatura_id e valor_pago obrigatórios' });

    const f = db.prepare('SELECT * FROM faturas WHERE id = ?').get(fatura_id);
    if (!f) return res.status(404).json({ error: 'Fatura não encontrada' });

    let comprovantePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '';
      const newName = `${Date.now()}-${req.file.filename}${ext}`;
      const dest = path.join(req.file.destination, newName);
      fs.renameSync(req.file.path, dest);
      comprovantePath = `/uploads/${newName}`;
    }

    const stmt = db.prepare('INSERT INTO pagamentos (fatura_id, forma_pagamento_id, valor_pago, comprovante_path) VALUES (?,?,?,?)');
    const info = stmt.run(fatura_id, forma_pagamento_id || null, valor_pago, comprovantePath);

    // marcar fatura como paga (simplificação)
    db.prepare('UPDATE faturas SET status_pagamento = ? WHERE id = ?').run('pago', fatura_id);

    const pagamento = db.prepare('SELECT * FROM pagamentos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(pagamento);
  });

  // listar pagamentos (filtro por fatura)
  router.get('/', (req, res) => {
    const { fatura_id } = req.query;
    let sql = 'SELECT pay.*, f.pedido_id FROM pagamentos pay JOIN faturas f ON pay.fatura_id = f.id';
    const params = [];
    if (fatura_id) { sql += ' WHERE pay.fatura_id = ?'; params.push(fatura_id); }
    sql += ' ORDER BY pay.data_pagamento DESC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  });

  return router;
};

