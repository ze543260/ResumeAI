@echo off
color 0A
echo ==========================================
echo   Resume Analyzer AI - Iniciando Servicos
echo ==========================================
echo.

echo [1/4] Verificando dependencias do backend...
cd /d "%~dp0..\backend"
if not exist "node_modules\" (
    echo Instalando dependencias do backend...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias do backend
        pause
        exit /b 1
    )
)

echo [2/4] Verificando dependencias do frontend...
cd /d "%~dp0..\frontend"
if not exist "node_modules\" (
    echo Instalando dependencias do frontend...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias do frontend
        pause
        exit /b 1
    )
)

echo [3/4] Iniciando backend...
cd /d "%~dp0..\backend"
start "Backend - Resume Analyzer" cmd /c "npm start & pause"

echo [4/4] Aguardando 3 segundos e iniciando frontend...
timeout /t 3 /nobreak >nul

cd /d "%~dp0..\frontend"
start "Frontend - Resume Analyzer" cmd /c "npm run dev & pause"

echo.
echo ==========================================
echo   Servicos iniciados com sucesso!
echo ==========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para fechar este terminal...
pause >nul