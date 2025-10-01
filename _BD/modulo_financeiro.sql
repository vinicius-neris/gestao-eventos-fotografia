-- Banco de Dados - Módulo Financeiro
-- Autor: Vinícius Neris Ferreira Santana
-- Matrícula: 202210326

CREATE DATABASE gestao_eventos;
USE gestao_eventos;

-- Tabela de usuários (gerente, funcionário, cliente)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('gerente', 'funcionario', 'cliente') NOT NULL
);

-- Tabela de eventos
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    local VARCHAR(150),
    criado_por INT,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

-- Tabela de pedidos (relacionados a eventos)
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT,
    cliente_id INT,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('pendente','aprovado','cancelado') DEFAULT 'pendente',
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

-- Tabela de faturas
CREATE TABLE faturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    valor_total DECIMAL(10,2) NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    status ENUM('aberta','paga','atrasada') DEFAULT 'aberta',
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Tabela de formas de pagamento
CREATE TABLE formas_pagamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

INSERT INTO formas_pagamento (nome) VALUES ('Cartão de Crédito'), ('Pix'), ('Boleto'), ('Transferência');

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fatura_id INT,
    forma_pagamento_id INT,
    valor_pago DECIMAL(10,2) NOT NULL,
    data_pagamento DATE,
    comprovante VARCHAR(255), -- caminho do arquivo de comprovante
    FOREIGN KEY (fatura_id) REFERENCES faturas(id),
    FOREIGN KEY (forma_pagamento_id) REFERENCES formas_pagamento(id)
);
