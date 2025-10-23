# API Mobile - Sistema de Gestão de Eventos

API RESTful para consumo externo (mobile, web, desktop) do sistema de gestão de eventos.

## Características

- ✅ Autenticação JWT
- ✅ Endpoints para Eventos, Pedidos, Faturas e Pagamentos
- ✅ Upload de comprovantes
- ✅ Controle de acesso baseado em roles
- ✅ Validações de dados
- ✅ Tratamento de erros

## Instalação

```bash
npm install
```

## Uso

```bash
npm start
```

A API estará disponível em `http://localhost:3333`

## Documentação

Consulte `../_DOCS/API_DOCUMENTACAO.md` para a documentação completa.

## Endpoints

- `POST /api/auth/login` - Fazer login
- `POST /api/auth/registrar` - Registrar novo usuário
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Criar evento
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `GET /api/faturas` - Listar faturas
- `POST /api/faturas` - Criar fatura
- `GET /api/pagamentos` - Listar pagamentos
- `POST /api/pagamentos` - Registrar pagamento

## Autenticação

Use JWT Bearer Token:
```
Authorization: Bearer <token>
```

## Licença

MIT
