// config/db.js
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data.db");
const db = new Database(dbPath);

// criar tabelas se não existirem
db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('gerente','funcionario','cliente'))
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  data_evento TEXT,
  hora_evento TEXT,
  local TEXT,
  criado_por INTEGER,
  FOREIGN KEY(criado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS fotografos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  valor_hora REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS participacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  fotografo_id INTEGER NOT NULL,
  horas_trabalhadas REAL NOT NULL,
  valor_recebido REAL NOT NULL,
  FOREIGN KEY(evento_id) REFERENCES eventos(id),
  FOREIGN KEY(fotografo_id) REFERENCES fotografos(id)
);

CREATE TABLE IF NOT EXISTS fotos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  fotografo_id INTEGER NOT NULL,
  caminho TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY(evento_id) REFERENCES eventos(id),
  FOREIGN KEY(fotografo_id) REFERENCES fotografos(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER,
  cliente_id INTEGER NOT NULL,
  descricao TEXT,
  valor REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','faturado','cancelado')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(evento_id) REFERENCES eventos(id),
  FOREIGN KEY(cliente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS faturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  valor_total REAL NOT NULL,
  data_emissao TEXT DEFAULT (date('now')),
  data_vencimento TEXT,
  status_pagamento TEXT NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente','pago')),
  FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
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
  data_pagamento TEXT DEFAULT (datetime('now')),
  comprovante_path TEXT,
  FOREIGN KEY(fatura_id) REFERENCES faturas(id),
  FOREIGN KEY(forma_pagamento_id) REFERENCES formas_pagamento(id)
);

`);

// popular formas de pagamento se ainda não houver
const countFP = db.prepare("SELECT COUNT(*) as c FROM formas_pagamento").get().c;
if (!countFP) {
  const ins = db.prepare("INSERT INTO formas_pagamento (nome) VALUES (?)");
  ["Cartão de Crédito","Pix","Boleto","Transferência"].forEach(name => ins.run(name));
}

// criar usuário gerente padrão para testes, se não existir
const admin = db.prepare("SELECT id FROM usuarios WHERE email = ?").get("admin@local");
if (!admin) {
  db.prepare("INSERT INTO usuarios (nome,email,senha_hash,role) VALUES (?,?,?,?)")
    .run("Administrador","admin@local","admin","gerente");
}

module.exports = db;

