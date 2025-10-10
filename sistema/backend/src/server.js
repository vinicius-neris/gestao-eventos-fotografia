// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const usuariosRouter = require('./routes/usuarios');
const eventosRouter = require('./routes/eventos');
const pedidosRouter = require('./routes/pedidos');
const faturasRouter = require('./routes/faturas');
const pagamentosRouter = require('./routes/pagamentos');

const app = express();
app.use(cors());
app.use(express.json());

// uploads (comprovantes)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use('/uploads', express.static(uploadsDir));
const upload = multer({ dest: uploadsDir });

// rotas
app.use('/api/usuarios', usuariosRouter);
app.use('/api/eventos', eventosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/faturas', faturasRouter);
app.use('/api/pagamentos', pagamentosRouter(upload));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`API integrada rodando em http://localhost:${PORT}`));
