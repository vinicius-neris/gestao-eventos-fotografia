// config/db.js
const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados (compartilhado entre API e sistema)
const dbPath = path.join(__dirname, '../data.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    role TEXT DEFAULT 'cliente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    data_evento TEXT,
    hora_evento TEXT,
    local TEXT,
    criado_por INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    evento_id INTEGER NOT NULL,
    valor REAL NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
  );

  CREATE TABLE IF NOT EXISTS faturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    valor_total REAL NOT NULL,
    data_vencimento TEXT,
    status_pagamento TEXT DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
  );

  CREATE TABLE IF NOT EXISTS formas_pagamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fatura_id INTEGER NOT NULL,
    forma_pagamento_id INTEGER,
    valor_pago REAL NOT NULL,
    comprovante_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fatura_id) REFERENCES faturas(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES formas_pagamento(id)
  );

  INSERT OR IGNORE INTO usuarios (id, nome, email, senha_hash, role) 
  VALUES (1, 'Admin', 'admin@local', 'admin', 'gerente');

  INSERT OR IGNORE INTO formas_pagamento (id, nome) VALUES 
  (1, 'Dinheiro'),
  (2, 'Cartão de Crédito'),
  (3, 'Cartão de Débito'),
  (4, 'Transferência Bancária'),
  (5, 'PIX');
`);

module.exports = db;

