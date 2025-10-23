# Documentação da API Mobile - Sistema de Gestão de Eventos

## 1. Visão Geral

A API Mobile é uma interface RESTful desenvolvida para permitir que aplicações externas (mobile, web, desktop) consumam os serviços do sistema de gestão de eventos. A API utiliza autenticação baseada em JWT (JSON Web Tokens) para garantir segurança e controle de acesso.

## 2. Configuração Base

**URL Base:** `http://localhost:3333/api`

**Autenticação:** JWT Bearer Token (exceto para login e registro)

**Content-Type:** `application/json`

## 3. Autenticação

### 3.1. POST /auth/login - Fazer Login

Autentica um usuário e retorna um token JWT para uso em requisições subsequentes.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@local",
  "senha": "admin"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@local",
    "role": "gerente"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciais inválidas."
}
```

**Notas:**
- O token tem validade de 24 horas
- Use o token no header `Authorization: Bearer <token>` para requisições autenticadas

---

### 3.2. POST /auth/registrar - Registrar Novo Usuário

Cria um novo usuário no sistema.

**Endpoint:** `POST /api/auth/registrar`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "role": "cliente"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 2,
    "nome": "João Silva",
    "email": "joao@example.com",
    "role": "cliente"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email já cadastrado."
}
```

**Roles Disponíveis:**
- `gerente` - Acesso total ao sistema
- `funcionario` - Acesso a pedidos, faturas e pagamentos
- `cliente` - Acesso apenas aos seus dados
- `fotografo` - Acesso a eventos e fotos

---

## 4. Eventos

Todos os endpoints de eventos requerem autenticação JWT.

### 4.1. GET /eventos - Listar Eventos

Lista todos os eventos do sistema.

**Endpoint:** `GET /api/eventos`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Casamento João e Maria",
    "data_evento": "2025-12-15",
    "hora_evento": "18:00",
    "local": "Salão de Festas Centro",
    "criado_por": 1,
    "criado_por_nome": "Admin",
    "created_at": "2025-10-23T10:30:00Z"
  },
  {
    "id": 2,
    "nome": "Aniversário Maria",
    "data_evento": "2025-11-20",
    "hora_evento": "19:00",
    "local": "Casa de Maria",
    "criado_por": 1,
    "criado_por_nome": "Admin",
    "created_at": "2025-10-23T11:15:00Z"
  }
]
```

---

### 4.2. GET /eventos/:id - Obter Detalhes do Evento

Obtém informações detalhadas de um evento específico.

**Endpoint:** `GET /api/eventos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameter:**
- `id` (integer) - ID do evento

**Response (200 OK):**
```json
{
  "id": 1,
  "nome": "Casamento João e Maria",
  "data_evento": "2025-12-15",
  "hora_evento": "18:00",
  "local": "Salão de Festas Centro",
  "criado_por": 1,
  "criado_por_nome": "Admin",
  "created_at": "2025-10-23T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Evento não encontrado."
}
```

---

### 4.3. POST /eventos - Criar Evento

Cria um novo evento (apenas para gerentes).

**Endpoint:** `POST /api/eventos`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "Formatura 2025",
  "data_evento": "2025-12-20",
  "hora_evento": "20:00",
  "local": "Auditório Principal"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "nome": "Formatura 2025",
  "data_evento": "2025-12-20",
  "hora_evento": "20:00",
  "local": "Auditório Principal",
  "criado_por": 1
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Apenas gerentes podem criar eventos."
}
```

---

## 5. Pedidos

Todos os endpoints de pedidos requerem autenticação JWT.

### 5.1. GET /pedidos - Listar Pedidos

Lista pedidos. Clientes veem apenas seus pedidos; gerentes veem todos.

**Endpoint:** `GET /api/pedidos`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "cliente_id": 2,
    "evento_id": 1,
    "valor": 5000.00,
    "descricao": "Fotografia do casamento",
    "status": "pendente",
    "cliente_nome": "João Silva",
    "evento_nome": "Casamento João e Maria",
    "created_at": "2025-10-23T10:45:00Z"
  }
]
```

---

### 5.2. GET /pedidos/:id - Obter Detalhes do Pedido

Obtém informações detalhadas de um pedido específico.

**Endpoint:** `GET /api/pedidos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameter:**
- `id` (integer) - ID do pedido

**Response (200 OK):**
```json
{
  "id": 1,
  "cliente_id": 2,
  "evento_id": 1,
  "valor": 5000.00,
  "descricao": "Fotografia do casamento",
  "status": "pendente",
  "cliente_nome": "João Silva",
  "evento_nome": "Casamento João e Maria",
  "created_at": "2025-10-23T10:45:00Z"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Acesso negado."
}
```

---

### 5.3. POST /pedidos - Criar Pedido

Cria um novo pedido.

**Endpoint:** `POST /api/pedidos`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "cliente_id": 2,
  "evento_id": 1,
  "valor": 5000.00,
  "descricao": "Fotografia do casamento com 8 horas"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "cliente_id": 2,
  "evento_id": 1,
  "valor": 5000.00,
  "descricao": "Fotografia do casamento com 8 horas",
  "status": "pendente"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Cliente, evento e valor são obrigatórios."
}
```

---

## 6. Faturas

Todos os endpoints de faturas requerem autenticação JWT.

### 6.1. GET /faturas - Listar Faturas

Lista faturas. Clientes veem apenas suas faturas; gerentes veem todas.

**Endpoint:** `GET /api/faturas`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "pedido_id": 1,
    "valor_total": 5000.00,
    "data_vencimento": "2025-12-20",
    "status_pagamento": "pendente",
    "pedido_desc": "Fotografia do casamento",
    "pedido_valor": 5000.00,
    "cliente_nome": "João Silva",
    "created_at": "2025-10-23T11:00:00Z"
  }
]
```

---

### 6.2. GET /faturas/:id - Obter Detalhes da Fatura

Obtém informações detalhadas de uma fatura específica.

**Endpoint:** `GET /api/faturas/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameter:**
- `id` (integer) - ID da fatura

**Response (200 OK):**
```json
{
  "id": 1,
  "pedido_id": 1,
  "valor_total": 5000.00,
  "data_vencimento": "2025-12-20",
  "status_pagamento": "pendente",
  "pedido_desc": "Fotografia do casamento",
  "pedido_valor": 5000.00,
  "cliente_nome": "João Silva",
  "created_at": "2025-10-23T11:00:00Z"
}
```

---

### 6.3. POST /faturas - Criar Fatura

Cria uma nova fatura a partir de um pedido.

**Endpoint:** `POST /api/faturas`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pedido_id": 1,
  "valor_total": 5000.00,
  "data_vencimento": "2025-12-20"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "pedido_id": 1,
  "valor_total": 5000.00,
  "data_vencimento": "2025-12-20",
  "status_pagamento": "pendente"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Pedido e valor total são obrigatórios."
}
```

---

## 7. Pagamentos

Todos os endpoints de pagamentos requerem autenticação JWT.

### 7.1. GET /pagamentos - Listar Pagamentos

Lista todos os pagamentos do sistema.

**Endpoint:** `GET /api/pagamentos`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fatura_id": 1,
    "forma_pagamento_id": 4,
    "valor_pago": 5000.00,
    "comprovante_path": "/uploads/comprovante_1.pdf",
    "fatura_valor_total": 5000.00,
    "forma_pagamento_nome": "Transferência Bancária",
    "created_at": "2025-10-23T12:00:00Z"
  }
]
```

---

### 7.2. GET /pagamentos/:id - Obter Detalhes do Pagamento

Obtém informações detalhadas de um pagamento específico.

**Endpoint:** `GET /api/pagamentos/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameter:**
- `id` (integer) - ID do pagamento

**Response (200 OK):**
```json
{
  "id": 1,
  "fatura_id": 1,
  "forma_pagamento_id": 4,
  "valor_pago": 5000.00,
  "comprovante_path": "/uploads/comprovante_1.pdf",
  "fatura_valor_total": 5000.00,
  "forma_pagamento_nome": "Transferência Bancária",
  "created_at": "2025-10-23T12:00:00Z"
}
```

---

### 7.3. POST /pagamentos - Registrar Pagamento

Registra um novo pagamento com upload de comprovante.

**Endpoint:** `POST /api/pagamentos`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `fatura_id` (integer) - ID da fatura
- `forma_pagamento_id` (integer) - ID da forma de pagamento
- `valor_pago` (number) - Valor pago
- `comprovante` (file) - Arquivo de comprovante (opcional)

**cURL Example:**
```bash
curl -X POST http://localhost:3333/api/pagamentos \
  -H "Authorization: Bearer <token>" \
  -F "fatura_id=1" \
  -F "forma_pagamento_id=4" \
  -F "valor_pago=5000.00" \
  -F "comprovante=@/path/to/comprovante.pdf"
```

**Response (201 Created):**
```json
{
  "id": 1,
  "fatura_id": 1,
  "forma_pagamento_id": 4,
  "valor_pago": 5000.00,
  "comprovante_path": "/uploads/comprovante_1.pdf",
  "status": "pago"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Fatura e valor pago são obrigatórios."
}
```

---

## 8. Formas de Pagamento

As formas de pagamento disponíveis no sistema são:

| ID | Nome |
|---|---|
| 1 | Dinheiro |
| 2 | Cartão de Crédito |
| 3 | Cartão de Débito |
| 4 | Transferência Bancária |
| 5 | PIX |

---

## 9. Códigos de Status HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 10. Tratamento de Erros

Todas as respostas de erro seguem o padrão:

```json
{
  "error": "Descrição do erro"
}
```

---

## 11. Exemplo de Fluxo Completo

### Passo 1: Fazer Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@local",
    "senha": "admin"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@local",
    "role": "gerente"
  }
}
```

### Passo 2: Listar Eventos
```bash
curl -X GET http://localhost:3333/api/eventos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Passo 3: Criar Pedido
```bash
curl -X POST http://localhost:3333/api/pedidos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 2,
    "evento_id": 1,
    "valor": 5000.00,
    "descricao": "Fotografia do casamento"
  }'
```

### Passo 4: Criar Fatura
```bash
curl -X POST http://localhost:3333/api/faturas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "pedido_id": 1,
    "valor_total": 5000.00,
    "data_vencimento": "2025-12-20"
  }'
```

### Passo 5: Registrar Pagamento
```bash
curl -X POST http://localhost:3333/api/pagamentos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "fatura_id=1" \
  -F "forma_pagamento_id=4" \
  -F "valor_pago=5000.00" \
  -F "comprovante=@/path/to/comprovante.pdf"
```

---

## 12. Notas Importantes

- **Token JWT:** Armazenar com segurança no cliente e incluir em todas as requisições autenticadas
- **CORS:** A API permite requisições de qualquer origem
- **Uploads:** Comprovantes são salvos em `/uploads/` e acessíveis via HTTP
- **Banco de Dados:** SQLite compartilhado entre API e sistema principal
- **Validações:** Todos os dados são validados no servidor antes de serem salvos

