Código-fonte do sistema.

Backend integrado - Sistema de Eventos + Módulo Financeiro

Como executar:
  cd sistema/backend
  npm install
  npm start

Porta padrão: http://localhost:3333

Principais endpoints:
- POST   /api/usuarios        -> criar usuário {nome,email,senha,role}
- POST   /api/usuarios/login  -> login {email,senha}
- GET    /api/usuarios
- POST   /api/eventos         -> criar evento
- GET    /api/eventos
- POST   /api/pedidos         -> criar pedido {evento_id,cliente_id,descricao,valor}
- GET    /api/pedidos
- GET    /api/pedidos/:id
- POST   /api/faturas         -> gerar fatura {pedido_id,valor_total,data_vencimento}
- GET    /api/faturas
- GET    /api/faturas/:id
- POST   /api/pagamentos      -> registrar pagamento (form-data: fatura_id, valor_pago, forma_pagamento_id, comprovante file)
- GET    /api/pagamentos
