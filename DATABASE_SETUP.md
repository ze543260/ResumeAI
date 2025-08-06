# 📊 Guia de Configuração do Banco de Dados

## Opção 1: MongoDB Atlas (Cloud) - RECOMENDADO ⭐

### Passos para configurar MongoDB Atlas:

1. **Criar conta gratuita**

   - Acesse: https://www.mongodb.com/cloud/atlas
   - Clique em "Try Free"
   - Crie sua conta gratuita

2. **Criar um Cluster**

   - Escolha "M0 Sandbox" (gratuito)
   - Selecione a região mais próxima (ex: US East)
   - Clique em "Create Cluster"

3. **Configurar acesso**

   - Database Access → Add New Database User
   - Username: `resumeanalyzer`
   - Password: (gere uma senha forte)
   - Roles: `Read and write to any database`

4. **Configurar Network Access**

   - Network Access → Add IP Address
   - Para desenvolvimento: `0.0.0.0/0` (qualquer IP)
   - Para produção: adicione IPs específicos

5. **Obter String de Conexão**

   - Clusters → Connect → Connect your application
   - Driver: Node.js
   - Version: 4.1 or later
   - Copie a connection string

6. **Configurar no .env**
   ```env
   MONGODB_URI=mongodb+srv://resumeanalyzer:<password>@cluster0.xxxxx.mongodb.net/resume-analyzer?retryWrites=true&w=majority
   ```

## Opção 2: MongoDB Local

### Windows:

1. **Instalar MongoDB Community Server**

   ```powershell
   # Usando Chocolatey
   choco install mongodb

   # Ou usando winget
   winget install MongoDB.Server
   ```

2. **Iniciar o MongoDB**

   ```powershell
   # Criar diretório de dados
   mkdir C:\data\db

   # Iniciar MongoDB
   mongod --dbpath C:\data\db
   ```

3. **Configurar no .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/resume-analyzer
   ```

### Linux/Mac:

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS (usando Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community
# ou
sudo systemctl start mongod
```

## Opção 3: Docker (Para desenvolvimento)

1. **Criar docker-compose.yml**

   ```yaml
   version: "3.8"
   services:
     mongodb:
       image: mongo:latest
       container_name: resume-analyzer-db
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_DATABASE: resume-analyzer
       volumes:
         - mongodb_data:/data/db

   volumes:
     mongodb_data:
   ```

2. **Executar**
   ```bash
   docker-compose up -d
   ```

## Testando a Conexão

1. **Verificar se o MongoDB está rodando**

   ```bash
   # Para MongoDB local
   mongo --eval "db.adminCommand('ismaster')"

   # Para MongoDB Atlas
   # Use o MongoDB Compass com sua connection string
   ```

2. **Testar a conexão do backend**
   ```bash
   cd backend
   node -e "require('./config/database')()"
   ```

## Variáveis de Ambiente (.env)

```env
# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/resume-analyzer

# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/resume-analyzer

# MongoDB com autenticação
MONGODB_URI=mongodb://username:password@localhost:27017/resume-analyzer

# MongoDB Docker
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
```

## Estrutura de Dados

O sistema criará automaticamente as seguintes collections:

- `users` - Dados dos usuários
- `analyses` - Histórico de análises de currículos
- `files` - Metadata dos arquivos enviados

## Comandos Úteis

```bash
# Verificar status do MongoDB (local)
sudo systemctl status mongod

# Parar/Iniciar MongoDB (local)
sudo systemctl stop mongod
sudo systemctl start mongod

# Conectar ao MongoDB
mongo
# ou
mongosh

# Ver bancos de dados
show dbs

# Usar banco específico
use resume-analyzer

# Ver collections
show collections
```

## Troubleshooting

### Erro de conexão:

1. Verificar se o MongoDB está rodando
2. Verificar a string de conexão no .env
3. Verificar Network Access (Atlas)
4. Verificar credenciais do usuário

### Erro de autenticação:

1. Verificar username/password
2. Verificar roles do usuário no Atlas
3. Verificar se o IP está liberado

### Performance:

1. Criar índices nas collections
2. Limitar resultados das queries
3. Usar pagination

## Recomendação Final

Para **desenvolvimento**: Use MongoDB Atlas (gratuito, fácil setup)
Para **produção**: Use MongoDB Atlas com tier pago ou servidor dedicado
Para **testes locais**: Use Docker ou instalação local
