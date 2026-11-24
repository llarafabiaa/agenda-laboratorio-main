# ReservaLab

Sistema web para gerenciamento de reservas de laboratório por período, com controle de usuários, reservas e datas bloqueadas.

O frontend é servido pelo próprio backend. Não é necessário iniciar uma aplicação frontend separada.

## Funcionalidades

- Cadastro e autenticação de usuários
- Perfis `PROFESSOR` e `ADMIN`
- Criação, consulta e cancelamento de reservas
- Agenda semanal com disponibilidade por período
- Bloqueio de datas pelo administrador
- Prevenção de reservas duplicadas no mesmo dia e período
- Prevenção de reservas em datas bloqueadas

## Tecnologias

- Node.js e Express
- MySQL
- HTML, CSS e JavaScript
- JWT para autenticação
- bcryptjs para criptografia de senhas

## Pré-requisitos

Instale antes de continuar:

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [MySQL](https://dev.mysql.com/downloads/mysql/) versão 8 ou superior
- Git, caso vá clonar o repositório

Confirme as instalações no terminal:

```powershell
node --version
npm --version
mysql --version
```

## Configuração no Windows

### 1. Obter o projeto

Se estiver usando Git:

```powershell
git clone <URL_DO_REPOSITORIO>
cd agenda-laboratorio-main
```

Caso já tenha recebido a pasta do projeto, abra um terminal nela.

### 2. Instalar as dependências do backend

```powershell
cd backend
npm install
```

### 3. Criar o banco de dados

Inicie o serviço do MySQL. Depois, no diretório `backend`, execute:

```powershell
Get-Content -Raw .\script.sql | mysql -u root -p
```

Informe a senha do usuário MySQL quando solicitada. Esse script cria o banco `reservas_laboratorio`, todas as tabelas, os sete períodos e os triggers necessários.

Também é possível importar o script pelo MySQL Workbench:

1. Abra o arquivo `backend/script.sql`.
2. Execute o script completo.
3. Confirme que o banco `reservas_laboratorio` foi criado.

### 4. Configurar as variáveis de ambiente

Crie o arquivo `backend/.env` com o seguinte conteúdo:

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=reservas_laboratorio

JWT_SECRET=uma_chave_longa_e_secreta

ADMIN_MASTER_EMAIL=admin@reservas.lab
ADMIN_MASTER_PASSWORD=Admin@123
```

Substitua `DB_PASSWORD` pela senha real do MySQL e `JWT_SECRET` por uma chave própria e secreta.

As variáveis do banco possuem valores padrão no código, mas é recomendável configurar pelo menos `DB_PASSWORD` e `JWT_SECRET`.

Quando o servidor inicia, ele garante a existência do usuário administrador mestre informado nas variáveis `ADMIN_MASTER_EMAIL` e `ADMIN_MASTER_PASSWORD`.

## Executando o projeto

Na pasta `backend`, execute:

```powershell
npm start
```

Para desenvolvimento com reinicialização automática:

```powershell
npm run dev
```

Se tudo estiver correto, o terminal mostrará:

```text
Servidor rodando em http://localhost:3000
```

Abra no navegador:

- Sistema: <http://localhost:3000>
- Cadastro: <http://localhost:3000/pages/cadastro.html>
- Reservas: <http://localhost:3000/pages/reservas.html>

## Primeiro acesso

Na primeira execução, o sistema cria um administrador mestre com os seguintes valores padrão:

- E-mail: `admin@reservas.lab`
- Senha: `Admin@123`

Caso tenha definido `ADMIN_MASTER_EMAIL` e `ADMIN_MASTER_PASSWORD` no arquivo `.env`, use esses valores.

Por segurança, altere a senha padrão em um ambiente real.

Novos cadastros pela tela pública recebem automaticamente o perfil `PROFESSOR`. Somente um usuário `ADMIN` pode criar, editar ou remover bloqueios.

## Executar de outra máquina na rede local

Por padrão, o frontend referencia `localhost:3000`. A URL só funciona diretamente nessa máquina.

Para acesso pela rede:

1. Configure `PORT=3000` no `.env`.
2. Inicie o servidor na máquina hospedeira.
3. Descubra o endereço IPv4 da máquina com `ipconfig`.
4. Libere a porta `3000` no firewall do Windows.
5. Acesse `http://<IP_DA_MAQUINA>:3000` pelo navegador.

Exemplo: `http://192.168.1.20:3000`.

Para uso em rede externa, será necessário configurar adequadamente o firewall, o roteador e HTTPS.

## Estrutura do projeto

```text
agenda-laboratorio-main/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── script.sql
│   └── server.js
└── frontend/
    ├── css/
    ├── js/
    ├── pages/
    └── index.html
```

## Solução de problemas

### `Acesso negado ao MySQL`

- Confirme `DB_USER` e `DB_PASSWORD` em `backend/.env`.
- Teste a conexão:

```powershell
mysql -u root -p
```

### `Unknown database 'reservas_laboratorio'`

Importe novamente o script:

```powershell
cd backend
Get-Content -Raw .\script.sql | mysql -u root -p
```

### `Nao foi possivel iniciar o banco de dados`

- Confirme se o serviço do MySQL está em execução.
- Confirme `DB_HOST` e `DB_PORT`.
- Garanta que o usuário configurado tem acesso ao banco.

### `Cannot find module`

Na pasta `backend`, instale novamente as dependências:

```powershell
npm install
```

### Porta 3000 já está em uso

Defina outra porta no `backend/.env`, por exemplo:

```dotenv
PORT=3001
```

O frontend atual possui `localhost:3000` fixo em alguns arquivos. Ao mudar a porta, atualize os endereços HTTP de `frontend/index.html`, `frontend/js/api.js` e dos arquivos em `frontend/pages`.
