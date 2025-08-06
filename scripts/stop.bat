@echo off
color 0C
echo ==========================================
echo   Resume Analyzer AI - Parando Servicos
echo ==========================================
echo.

echo Parando processos Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Processos Node.js encerrados
) else (
    echo ⚠ Nenhum processo Node.js encontrado
)

echo.
echo Parando processos npm...
taskkill /f /im npm.cmd >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Processos npm encerrados
) else (
    echo ⚠ Nenhum processo npm encontrado
)

echo.
echo ==========================================
echo   Todos os servicos foram encerrados!
echo ==========================================
echo.
pause
