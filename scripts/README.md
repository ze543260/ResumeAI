# Scripts de Inicialização - Resume Analyzer AI

Este diretório contém scripts para facilitar o início e parada dos serviços do Resume Analyzer AI.

## Scripts Disponíveis

### 1. `start.bat` (Windows Batch)

Script básico para iniciar os serviços usando cmd do Windows.

**Uso:**

```cmd
cd scripts
start.bat
```

### 2. `start.ps1` (PowerShell)

Script mais avançado com verificação de portas e melhor tratamento de erros.

**Uso:**

```powershell
cd scripts
.\start.ps1
```

**Nota:** Se houver erro de política de execução, execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. `stop.bat` (Windows Batch)

Script para parar todos os serviços em execução.

**Uso:**

```cmd
cd scripts
stop.bat
```

## O que os scripts fazem

1. **Verificam e instalam dependências** se necessário
2. **Iniciam o backend** na porta 5000
3. **Iniciam o frontend** na porta 5173
4. **Aguardam os serviços estarem prontos**
5. **Mostram as URLs de acesso**

## URLs dos Serviços

- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **API Documentation:** http://localhost:5000/api-docs (se disponível)

## Resolução de Problemas

### Porta em uso

Se alguma porta estiver em uso, o script tentará detectar e informar. Use `stop.bat` para parar processos existentes.

### Dependências

Os scripts verificam automaticamente e instalam dependências quando necessário. Se houver erro, execute manualmente:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Permissões

Se houver problemas de permissão com PowerShell, execute como Administrador ou ajuste a política de execução.

## Desenvolvimento

Para desenvolvimento, recomenda-se usar:

- **Backend:** `npm run dev` (usa nodemon para hot reload)
- **Frontend:** `npm run dev` (usa Vite dev server)

Os scripts usam comandos de produção por padrão para maior estabilidade.
