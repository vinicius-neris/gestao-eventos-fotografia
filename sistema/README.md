# Sistema de Gestão de Eventos e Financeiro

Este projeto é um sistema web para gerenciamento de eventos, fotógrafos, participações em eventos, upload de fotos e controle financeiro. Ele é dividido em um backend Node.js (Express com SQLite) e um frontend simples em HTML/CSS/JavaScript.

## Estrutura do Projeto

A estrutura de pastas do projeto é organizada da seguinte forma:

```
projeto-completo/
├── backend/
│   ├── config/
│   │   └── db.js               # Configuração do banco de dados SQLite e criação de tabelas
│   ├── routes/
│   │   ├── eventos.js          # Rotas da API para gerenciamento de eventos
│   │   ├── faturas.js          # Rotas da API para gerenciamento de faturas
│   │   ├── fotos.js            # Rotas da API para upload e gerenciamento de fotos
│   │   ├── fotografos.js       # Rotas da API para gerenciamento de fotógrafos
│   │   ├── pagamentos.js       # Rotas da API para gerenciamento de pagamentos
│   │   ├── participacoes.js    # Rotas da API para gerenciamento de participações de fotógrafos em eventos
│   │   └── pedidos.js          # Rotas da API para gerenciamento de pedidos
│   ├── uploads/                # Diretório para armazenar comprovantes de pagamento e fotos
│   ├── .gitignore              # Arquivo para ignorar arquivos e pastas no Git (node_modules, data.db, etc.)
│   ├── package.json            # Dependências e scripts do backend
│   └── server.js               # Servidor principal da API (Express)
├── frontend/
│   ├── .gitignore              # Arquivo para ignorar arquivos e pastas no Git (específico do frontend)
│   ├── eventos.html            # Página para gerenciamento de eventos
│   ├── financeiro.html         # Página para gerenciamento financeiro (pedidos, faturas, pagamentos)
│   └── index.html              # Página de login
└── README.md                   # Este arquivo
```

## Funcionalidades Implementadas

### Backend (Node.js/Express)

*   **Autenticação:** Login de usuários com `admin@local`/`admin` (senha `admin` para testes, com `bcryptjs` para senhas reais).
*   **Usuários:** Rotas para login e criação de usuários.
*   **Eventos:** Rotas CRUD (Create, Read, Update, Delete) para gerenciar eventos.
*   **Fotógrafos:** Rotas CRUD para cadastrar e gerenciar fotógrafos (nome, valor por hora).
*   **Participações:** Rotas CRUD para atribuir fotógrafos a eventos, registrando horas trabalhadas e valor recebido.
*   **Fotos:** Rotas para upload de fotos relacionadas a eventos e fotógrafos, e listagem de fotos.
*   **Pedidos:** Rotas CRUD para criar e gerenciar pedidos.
*   **Faturas:** Rotas CRUD para gerar faturas a partir de pedidos e listar faturas.
*   **Pagamentos:** Rotas CRUD para registrar pagamentos de faturas, incluindo upload de comprovantes.
*   **Banco de Dados:** Utiliza SQLite (`better-sqlite3`) para armazenamento de dados, com criação automática de tabelas na inicialização.
*   **Validação:** Validações básicas de entrada de dados nas rotas da API.

### Frontend (HTML/CSS/JavaScript)

*   **Página de Login (`index.html`):** Interface para autenticação de usuários.
*   **Página Financeira (`financeiro.html`):** Interface para criar pedidos, gerar faturas, registrar pagamentos e listar faturas.
*   **Página de Eventos (`eventos.html`):** Interface para criar e listar eventos.
*   **Página de Fotógrafos (`fotografos.html`):** Interface para cadastrar e listar fotógrafos.
*   **Design Moderno:** Estilização aprimorada para uma melhor experiência do usuário.
*   **Feedback:** Mensagens de sucesso/erro para as operações.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes softwares instalados em sua máquina:

*   **Node.js:** Versão 16 ou superior. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
*   **Git:** Para controle de versão e clonagem do repositório.

## Como Configurar e Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local:

### 1. Configuração do Repositório Git

Se você já tem um repositório Git no GitHub e já subiu os documentos anteriores, siga estes passos:

1.  **Clone seu Repositório Existente:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DO_SEU_REPOSITORIO>
    ```
    *Substitua `<URL_DO_SEU_REPOSITORIO>` pela URL do seu repositório no GitHub e `<NOME_DO_SEU_REPOSITORIO>` pelo nome da pasta do seu repositório.* 

2.  **Baixe e Descompacte os Novos Arquivos:**
    *   Baixe o arquivo `projeto-completo.zip` que será fornecido.
    *   Descompacte-o em um local temporário.

3.  **Mova os Novos Arquivos para o Seu Repositório:**
    *   Copie o conteúdo da pasta `projeto-completo/backend` para a pasta `backend` do seu repositório.
    *   Copie o conteúdo da pasta `projeto-completo/frontend` para a pasta `frontend` do seu repositório.
    *   Certifique-se de sobrescrever os arquivos existentes (como `server.js`, `package.json`, `index.html`, `financeiro.html`) e adicionar os novos arquivos (`fotografos.js`, `participacoes.js`, `fotos.js`, `eventos.html`, `fotografos.html`).
    *   Exemplo de comandos (ajuste conforme a localização dos seus arquivos descompactados):
        ```bash
        # Assumindo que você está na raiz do seu repositório e o zip foi descompactado em ~/Downloads/projeto-completo
        cp -r ~/Downloads/projeto-completo/backend/* backend/
        cp -r ~/Downloads/projeto-completo/frontend/* frontend/
        ```

4.  **Adicione, Commit e Envie para o GitHub:**
    ```bash
    git add .
    git commit -m "feat: Implementação de funcionalidades de eventos, fotógrafos, participações e fotos, e aprimoramento do frontend."
    git push origin main # ou master, dependendo do seu branch padrão
    ```

### 2. Executando o Backend

1.  **Navegue até o Diretório do Backend:**
    ```bash
    cd backend
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```
    *Isso instalará todas as dependências necessárias, incluindo `express`, `cors`, `multer`, `better-sqlite3` e `bcryptjs`.*

3.  **Inicie o Servidor:**
    ```bash
    node server.js
    ```
    Você deverá ver a mensagem: `API integrada rodando em http://localhost:3333`.
    *Mantenha este terminal aberto e o servidor rodando enquanto usa o frontend.*

### 3. Acessando o Frontend

1.  **Abra os Arquivos HTML:**
    *   Navegue até a pasta `frontend` do seu projeto.
    *   Abra os arquivos `index.html`, `financeiro.html`, `eventos.html` ou `fotografos.html` diretamente no seu navegador web (Chrome, Firefox, etc.). Não é necessário um servidor web separado para o frontend, pois ele fará requisições para o backend que está rodando em `http://localhost:3333`.

## Credenciais de Teste

Para acessar o sistema, você pode usar as seguintes credenciais:

*   **E-mail:** `admin@local`
*   **Senha:** `admin`

## Próximos Passos e Melhorias Sugeridas

Com a base agora mais completa, as próximas etapas podem incluir:

*   **Autenticação e Autorização:** Implementar um sistema de autenticação mais robusto (ex: JWT) para proteger as rotas da API e gerenciar permissões de usuário.
*   **Edição e Exclusão no Frontend:** Adicionar interfaces para editar e excluir eventos, fotógrafos e participações.
*   **Visualização Detalhada:** Criar páginas de detalhes para eventos, mostrando fotógrafos atribuídos, fotos e informações financeiras.
*   **Cálculos Financeiros:** Refinar a lógica de cálculo de percentuais e valores a serem pagos aos fotógrafos, conforme a descrição do problema.
*   **Gerenciamento de Fotos:** Desenvolver uma interface para fotógrafos fazerem upload de suas fotos e para usuários visualizarem as fotos por evento/fotógrafo.
*   **Notificações:** Implementar um sistema de notificações para eventos, pagamentos, etc.
*   **Framework Frontend:** Considerar a migração para um framework JavaScript moderno (React, Vue, Angular) para aplicações mais complexas e escaláveis.
*   **Testes:** Adicionar testes unitários e de integração para garantir a estabilidade do sistema.

Este guia deve fornecer uma base sólida para você continuar o desenvolvimento do seu sistema de gestão de eventos. Se precisar de mais alguma ajuda ou tiver dúvidas, estou à disposição!
