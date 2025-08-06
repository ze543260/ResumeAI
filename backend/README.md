# Resume Analyzer AI - Backend

Um sistema avançado de análise de currículos usando Google Gemini AI, construído com Node.js e Express.

## 🚀 Funcionalidades

- **Análise de Currículos com IA**: Utiliza Google Gemini para análise inteligente
- **Upload de Arquivos**: Suporte para PDF, DOC, DOCX e TXT
- **Análise Comparativa**: Compare currículos com descrições de vagas
- **API RESTful**: Endpoints bem estruturados e documentados
- **Segurança**: Rate limiting, helmet, validação de entrada
- **Logging**: Sistema de logs estruturado com Winston
- **Tratamento de Erros**: Middleware robusto para tratamento de erros

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   ├── database.js          # Configuração MongoDB
│   ├── gemini.js            # Configuração Google Gemini AI
│   └── logger.js            # Configuração Winston Logger
├── models/
│   └── User.js              # Modelo de usuário (Mongoose)
├── src/
│   ├── app.js              # Configuração principal do Express
│   ├── controllers/
│   │   └── resumeController.js # Controller para análise de currículos
│   ├── middleware/
│   │   └── errorHandler.js     # Middlewares para tratamento de erros
│   ├── routes/
│   │   ├── authRoutes.js       # Rotas de autenticação
│   │   ├── resumeRoutes.js     # Rotas de análise de currículos
│   │   └── userRoutes.js       # Rotas de usuário
│   ├── services/
│   │   ├── aiService.js        # Serviço de IA (Gemini)
│   │   └── fileService.js      # Serviço de upload de arquivos
│   └── utils/
│       └── index.js            # Utilitários diversos
├── uploads/                    # Diretório para arquivos enviados
├── .env                       # Variáveis de ambiente
├── package.json
└── server.js                  # Ponto de entrada da aplicação
```

## 🛠️ Configuração

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Configure as variáveis no arquivo `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/resume-analyzer

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=pdf,doc,docx,txt

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Obter Chave da API Google Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Configure a variável `GEMINI_API_KEY` no arquivo `.env`

## 🚀 Executando a Aplicação

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

## 📋 API Endpoints

### Análise de Currículos

#### `POST /api/resume/upload-analyze`

Upload e análise de currículo em um só endpoint.

**Parâmetros:**

- `resume` (file): Arquivo do currículo (PDF, DOC, DOCX, TXT)
- `jobDescription` (string, opcional): Descrição da vaga para comparação

**Resposta:**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file_id",
      "originalName": "resume.pdf",
      "size": 123456,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    },
    "analysis": {
      "overallScore": 85,
      "strengths": ["Strong technical skills", "..."],
      "weaknesses": ["Could improve formatting", "..."],
      "suggestions": "Consider adding more quantifiable achievements...",
      "atsScore": 8,
      "jobMatch": "Good match for the position..."
    },
    "improvements": {
      "suggestions": [...],
      "priority": "medium",
      "estimatedImpact": {...}
    }
  }
}
```

#### `POST /api/resume/analyze-text`

Análise apenas de texto (sem upload de arquivo).

**Parâmetros:**

```json
{
  "resumeText": "Conteúdo do currículo em texto...",
  "jobDescription": "Descrição da vaga (opcional)..."
}
```

#### `POST /api/resume/upload`

Upload de arquivo apenas (sem análise).

#### `GET /api/resume/stats`

Estatísticas do sistema.

#### `GET /api/resume/health`

Health check do módulo de análise.

### Autenticação (Placeholders)

#### `POST /api/auth/register`

Registro de usuário.

#### `POST /api/auth/login`

Login de usuário.

#### `POST /api/auth/logout`

Logout de usuário.

#### `GET /api/auth/verify`

Verificação de token.

### Usuário (Placeholders)

#### `GET /api/users/profile`

Obter perfil do usuário.

#### `PUT /api/users/profile`

Atualizar perfil do usuário.

#### `GET /api/users/analysis-history`

Histórico de análises do usuário.

### Sistema

#### `GET /api/health`

Health check geral da aplicação.

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Google Gemini AI** - Inteligência artificial para análise
- **Multer** - Upload de arquivos
- **Winston** - Sistema de logging
- **Express Validator** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Controle de taxa de requisições

## 📊 Características da Análise de IA

O sistema utiliza o Google Gemini para fornecer:

1. **Pontuação Geral** (1-100): Avaliação geral do currículo
2. **Pontos Fortes**: Principais qualidades identificadas
3. **Pontos Fracos**: Áreas que precisam de melhoria
4. **Sugestões**: Recomendações específicas e acionáveis
5. **Palavras-chave**: Keywords relevantes encontradas/ausentes
6. **Formatação**: Comentários sobre estrutura e apresentação
7. **Compatibilidade ATS** (1-10): Quão bem passa por sistemas ATS
8. **Correspondência com Vaga**: Análise comparativa (se fornecida)
9. **Habilidades Ausentes**: Skills que faltam para a vaga
10. **Sugestões de Personalização**: Como adaptar para a vaga específica

## 🛡️ Segurança

- Rate limiting configurável
- Validação rigorosa de entrada
- Sanitização de dados
- Headers de segurança com Helmet
- Tratamento seguro de arquivos
- Logging de segurança

## 📝 Logging

O sistema registra:

- Todas as requisições HTTP
- Erros e exceções
- Operações de arquivo
- Análises de IA realizadas
- Métricas de performance

## 🔄 Próximos Passos

- [ ] Implementar autenticação JWT completa
- [ ] Adicionar suporte a MongoDB/Mongoose
- [ ] Implementar extração de texto de PDFs e DOCs
- [ ] Adicionar cache Redis
- [ ] Implementar testes unitários e de integração
- [ ] Adicionar rate limiting por usuário
- [ ] Implementar webhook notifications
- [ ] Adicionar métricas e monitoring

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
