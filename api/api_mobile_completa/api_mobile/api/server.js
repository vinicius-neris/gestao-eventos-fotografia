// api/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { verificarToken, gerarToken } = require('./middleware/auth');
const db = require('../sistema/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup de uploads
const uploadsDir = path.join(__dirname, '../sistema/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));
const upload = multer({ dest: uploadsDir });

// ============================================
// ROTAS DE AUTENTICAÇÃO (Sem JWT)
// ============================================

// POST /api/auth/login - Fazer login
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Comparar senha (compatível com bcrypt e texto simples)
    let senhaValida = false;
    if (usuario.senha_hash && usuario.senha_hash.startsWith('$2')) {
      const bcrypt = require('bcryptjs');
      senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    } else {
      senhaValida = senha === usuario.senha_hash;
    }

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gerar token JWT
    const token = gerarToken(usuario);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// POST /api/auth/registrar - Registrar novo usuário
app.post('/api/auth/registrar', (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const senha_hash = bcrypt.hashSync(senha, 10);

    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(nome, email, senha_hash, role || 'cliente');

    const token = gerarToken({ id: info.lastInsertRowid, email, role: role || 'cliente' });

    res.status(201).json({
      token,
      usuario: {
        id: info.lastInsertRowid,
        nome,
        email,
        role: role || 'cliente'
      }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// ============================================
// ROTAS DE EVENTOS (Com JWT)
// ============================================

// GET /api/eventos - Listar eventos
app.get('/api/eventos', verificarToken, (req, res) => {
  try {
    const eventos = db.prepare(`
      SELECT e.*, u.nome as criado_por_nome 
      FROM eventos e 
      JOIN usuarios u ON e.criado_por = u.id
      ORDER BY e.data_evento DESC
    `).all();

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar eventos.' });
  }
});

// GET /api/eventos/:id - Obter detalhes do evento
app.get('/api/eventos/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  try {
    const evento = db.prepare(`
      SELECT e.*, u.nome as criado_por_nome 
      FROM eventos e 
      JOIN usuarios u ON e.criado_por = u.id 
      WHERE e.id = ?
    `).get(id);

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter evento.' });
  }
});

// POST /api/eventos - Criar evento (apenas Gerente)
app.post('/api/eventos', verificarToken, (req, res) => {
  const { nome, data_evento, hora_evento, local } = req.body;

  if (req.usuario.role !== 'gerente') {
    return res.status(403).json({ error: 'Apenas gerentes podem criar eventos.' });
  }

  if (!nome) {
    return res.status(400).json({ error: 'Nome do evento é obrigatório.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO eventos (nome, data_evento, hora_evento, local, criado_por) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(nome, data_evento, hora_evento, local, req.usuario.id);

    res.status(201).json({
      id: info.lastInsertRowid,
      nome,
      data_evento,
      hora_evento,
      local,
      criado_por: req.usuario.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento.' });
  }
});

// ============================================
// ROTAS DE PEDIDOS (Com JWT)
// ============================================

// GET /api/pedidos - Listar pedidos
app.get('/api/pedidos', verificarToken, (req, res) => {
  try {
    let query = `
      SELECT p.*, u.nome as cliente_nome, e.nome as evento_nome 
      FROM pedidos p 
      JOIN usuarios u ON p.cliente_id = u.id 
      JOIN eventos e ON p.evento_id = e.id
    `;

    // Se for cliente, mostrar apenas seus pedidos
    if (req.usuario.role === 'cliente') {
      query += ` WHERE p.cliente_id = ${req.usuario.id}`;
    }

    query += ` ORDER BY p.id DESC`;

    const pedidos = db.prepare(query).all();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pedidos.' });
  }
});

// GET /api/pedidos/:id - Obter detalhes do pedido
app.get('/api/pedidos/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  try {
    const pedido = db.prepare(`
      SELECT p.*, u.nome as cliente_nome, e.nome as evento_nome 
      FROM pedidos p 
      JOIN usuarios u ON p.cliente_id = u.id 
      JOIN eventos e ON p.evento_id = e.id 
      WHERE p.id = ?
    `).get(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // Verificar permissão
    if (req.usuario.role === 'cliente' && pedido.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pedido.' });
  }
});

// POST /api/pedidos - Criar pedido
app.post('/api/pedidos', verificarToken, (req, res) => {
  const { cliente_id, evento_id, valor, descricao } = req.body;

  if (!cliente_id || !evento_id || !valor) {
    return res.status(400).json({ error: 'Cliente, evento e valor são obrigatórios.' });
  }

  if (isNaN(valor) || valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO pedidos (cliente_id, evento_id, valor, descricao, status) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(cliente_id, evento_id, valor, descricao, 'pendente');

    res.status(201).json({
      id: info.lastInsertRowid,
      cliente_id,
      evento_id,
      valor,
      descricao,
      status: 'pendente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

// ============================================
// ROTAS DE FATURAS (Com JWT)
// ============================================

// GET /api/faturas - Listar faturas
app.get('/api/faturas', verificarToken, (req, res) => {
  try {
    let query = `
      SELECT f.*, p.descricao as pedido_desc, p.valor as pedido_valor, u.nome as cliente_nome 
      FROM faturas f 
      JOIN pedidos p ON f.pedido_id = p.id 
      JOIN usuarios u ON p.cliente_id = u.id
    `;

    // Se for cliente, mostrar apenas suas faturas
    if (req.usuario.role === 'cliente') {
      query += ` WHERE p.cliente_id = ${req.usuario.id}`;
    }

    query += ` ORDER BY f.id DESC`;

    const faturas = db.prepare(query).all();
    res.json(faturas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar faturas.' });
  }
});

// GET /api/faturas/:id - Obter detalhes da fatura
app.get('/api/faturas/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  try {
    const fatura = db.prepare(`
      SELECT f.*, p.descricao as pedido_desc, p.valor as pedido_valor, u.nome as cliente_nome 
      FROM faturas f 
      JOIN pedidos p ON f.pedido_id = p.id 
      JOIN usuarios u ON p.cliente_id = u.id 
      WHERE f.id = ?
    `).get(id);

    if (!fatura) {
      return res.status(404).json({ error: 'Fatura não encontrada.' });
    }

    // Verificar permissão
    if (req.usuario.role === 'cliente' && fatura.cliente_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    res.json(fatura);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter fatura.' });
  }
});

// POST /api/faturas - Criar fatura
app.post('/api/faturas', verificarToken, (req, res) => {
  const { pedido_id, valor_total, data_vencimento } = req.body;

  if (!pedido_id || !valor_total) {
    return res.status(400).json({ error: 'Pedido e valor total são obrigatórios.' });
  }

  if (isNaN(valor_total) || valor_total <= 0) {
    return res.status(400).json({ error: 'Valor total deve ser um número positivo.' });
  }

  try {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedido_id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const stmt = db.prepare(`
      INSERT INTO faturas (pedido_id, valor_total, data_vencimento, status_pagamento) 
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(pedido_id, valor_total, data_vencimento, 'pendente');

    db.prepare('UPDATE pedidos SET status = ? WHERE id = ?').run('faturado', pedido_id);

    res.status(201).json({
      id: info.lastInsertRowid,
      pedido_id,
      valor_total,
      data_vencimento,
      status_pagamento: 'pendente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar fatura.' });
  }
});

// ============================================
// ROTAS DE PAGAMENTOS (Com JWT)
// ============================================

// GET /api/pagamentos - Listar pagamentos
app.get('/api/pagamentos', verificarToken, (req, res) => {
  try {
    let query = `
      SELECT p.*, f.valor_total as fatura_valor_total, fp.nome as forma_pagamento_nome 
      FROM pagamentos p 
      JOIN faturas f ON p.fatura_id = f.id 
      LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id
    `;

    query += ` ORDER BY p.id DESC`;

    const pagamentos = db.prepare(query).all();
    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pagamentos.' });
  }
});

// GET /api/pagamentos/:id - Obter detalhes do pagamento
app.get('/api/pagamentos/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  try {
    const pagamento = db.prepare(`
      SELECT p.*, f.valor_total as fatura_valor_total, fp.nome as forma_pagamento_nome 
      FROM pagamentos p 
      JOIN faturas f ON p.fatura_id = f.id 
      LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id 
      WHERE p.id = ?
    `).get(id);

    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado.' });
    }

    res.json(pagamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter pagamento.' });
  }
});

// POST /api/pagamentos - Registrar pagamento
app.post('/api/pagamentos', verificarToken, upload.single('comprovante'), (req, res) => {
  const { fatura_id, forma_pagamento_id, valor_pago } = req.body;
  const comprovante_path = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fatura_id || !valor_pago) {
    return res.status(400).json({ error: 'Fatura e valor pago são obrigatórios.' });
  }

  if (isNaN(valor_pago) || valor_pago <= 0) {
    return res.status(400).json({ error: 'Valor pago deve ser um número positivo.' });
  }

  try {
    const fatura = db.prepare('SELECT valor_total FROM faturas WHERE id = ?').get(fatura_id);
    if (!fatura) {
      return res.status(404).json({ error: 'Fatura não encontrada.' });
    }

    const stmt = db.prepare(`
      INSERT INTO pagamentos (fatura_id, forma_pagamento_id, valor_pago, comprovante_path) 
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(fatura_id, forma_pagamento_id, valor_pago, comprovante_path);

    // Atualizar status da fatura
    if (parseFloat(valor_pago) >= fatura.valor_total) {
      db.prepare('UPDATE faturas SET status_pagamento = ? WHERE id = ?').run('pago', fatura_id);
    }

    res.status(201).json({
      id: info.lastInsertRowid,
      fatura_id,
      forma_pagamento_id,
      valor_pago,
      comprovante_path,
      status: parseFloat(valor_pago) >= fatura.valor_total ? 'pago' : 'parcialmente_pago'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar pagamento.' });
  }
});

// ============================================
// ROTA DE HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'API está funcionando corretamente!' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\n✅ API Mobile rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

