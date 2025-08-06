# Resume Analyzer AI - PowerShell Start Script
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  Resume Analyzer AI - Iniciando Servicos" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

try {
    # Check if backend is already running
    if (Test-Port -Port 5000) {
        Write-Host "[INFO] Backend already running on port 5000" -ForegroundColor Yellow
    } else {
        Write-Host "[1/4] Verificando dependencias do backend..." -ForegroundColor Cyan
        
        # Backend dependencies
        Set-Location $backendDir
        if (-not (Test-Path "node_modules")) {
            Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "Falha ao instalar dependencias do backend"
            }
        }
        
        Write-Host "[2/4] Iniciando backend..." -ForegroundColor Cyan
        # Start backend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host 'Backend iniciado em http://localhost:5000' -ForegroundColor Green; npm start"
        
        # Wait for backend to start
        Write-Host "Aguardando backend inicializar..." -ForegroundColor Yellow
        $timeout = 30
        $elapsed = 0
        while (-not (Test-Port -Port 5000) -and $elapsed -lt $timeout) {
            Start-Sleep 1
            $elapsed++
            Write-Progress -Activity "Aguardando backend" -Status "Tempo decorrido: $elapsed segundos" -PercentComplete (($elapsed / $timeout) * 100)
        }
        Write-Progress -Completed -Activity "Aguardando backend"
        
        if (Test-Port -Port 5000) {
            Write-Host "✓ Backend iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Backend pode não ter iniciado corretamente" -ForegroundColor Yellow
        }
    }
    
    # Check if frontend is already running
    if (Test-Port -Port 5173) {
        Write-Host "[INFO] Frontend already running on port 5173" -ForegroundColor Yellow
    } else {
        Write-Host "[3/4] Verificando dependencias do frontend..." -ForegroundColor Cyan
        
        # Frontend dependencies
        Set-Location $frontendDir
        if (-not (Test-Path "node_modules")) {
            Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "Falha ao instalar dependencias do frontend"
            }
        }
        
        Write-Host "[4/4] Iniciando frontend..." -ForegroundColor Cyan
        # Start frontend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; Write-Host 'Frontend iniciado em http://localhost:5173' -ForegroundColor Green; npm run dev"
    }
    
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "   Servicos iniciados com sucesso!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para parar os servicos, feche as janelas do PowerShell que foram abertas." -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} finally {
    Set-Location $scriptDir
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar este terminal..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
