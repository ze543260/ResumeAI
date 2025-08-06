# Resume Analyzer AI

Uma plataforma completa de análise de currículos com inteligência artificial, construída com React, TypeScript, Django e integração com OpenAI.

## 🚀 Características Principais

- **Upload Intuitivo**: Interface drag-and-drop para upload de currículos (PDF, DOC, DOCX)
- **Análise com IA**: Processamento inteligente usando OpenAI para extração e análise de dados
- **Dashboard Interativo**: Visualizações e métricas detalhadas sobre análises de currículos
- **Sistema de Pontuação**: Avaliação abrangente de diferentes seções do currículo
- **Feedback Inteligente**: Sugestões personalizadas para melhorias
- **Matching de Vagas**: Comparação de currículos com descrições de trabalho

## 🛠️ Stack Tecnológica

### Frontend

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **React Dropzone** para upload de arquivos
- **Recharts** para visualizações
- **Lucide React** para ícones

### Backend (A ser implementado)

- **Django** com Django REST Framework
- **PostgreSQL** para banco de dados
- **Celery** para processamento assíncrono
- **Redis** para cache e message broker

### IA e Integração

- **Gemini API** para análise de texto
- **PyPDF2/pdfplumber** para extração de PDF
- **python-docx** para documentos Word

## 📁 Estrutura do Projeto

```
resume-analyzer-ai/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── Header.tsx      # Cabeçalho da aplicação
│   ├── pages/              # Páginas principais
│   │   ├── Dashboard.tsx   # Dashboard com métricas
│   │   ├── Upload.tsx      # Página de upload
│   │   └── Analysis.tsx    # Página de análise detalhada
│   ├── types/              # Definições TypeScript
│   │   └── index.ts        # Interfaces e tipos
│   └── utils/              # Utilitários e helpers
├── .github/
│   └── copilot-instructions.md  # Instruções para o Copilot
└── README.md
```

## 🚦 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação e Execução

1. Clone o repositório:

```bash
git clone <repository-url>
cd resume-analyzer-ai
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:5173`

## 📋 Funcionalidades Implementadas

### ✅ Frontend

- [x] Interface de upload com drag-and-drop
- [x] Dashboard com métricas e visualizações
- [x] Página de análise detalhada
- [x] Design responsivo com Tailwind CSS
- [x] Roteamento com React Router
- [x] Componentes reutilizáveis

### 🔄 Em Desenvolvimento

- [ ] Backend Django com API REST
- [ ] Integração com OpenAI
- [ ] Processamento de arquivos PDF/DOC
- [ ] Banco de dados PostgreSQL
- [ ] Autenticação de usuários
- [ ] Sistema de jobs com Celery

## 🎨 Componentes Principais

### Dashboard

- Estatísticas gerais de análises
- Gráficos de distribuição de pontuação
- Lista de análises recentes
- Métricas de performance por seção

### Upload

- Interface drag-and-drop intuitiva
- Preview de arquivos enviados
- Barra de progresso para processamento
- Validação de tipos e tamanhos de arquivo

### Análise

- Pontuação geral do currículo
- Análise detalhada por seção
- Feedback e sugestões de melhoria
- Visualização de dados extraídos

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Executa linting
```

## 🚀 Próximos Passos

1. **Backend Implementation**

   - Configurar Django REST Framework
   - Implementar endpoints de API
   - Configurar banco de dados PostgreSQL

2. **AI Integration**

   - Integrar OpenAI API
   - Implementar parsing de PDF/DOC
   - Criar algoritmos de scoring

3. **Advanced Features**
   - Sistema de autenticação
   - Matching com vagas de emprego
   - Export de relatórios
   - Análise comparativa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📧 Contato

Seu Nome - [seu-email@example.com](mailto:seu-email@example.com)

Link do Projeto: [https://github.com/seu-usuario/resume-analyzer-ai](https://github.com/seu-usuario/resume-analyzer-ai)
