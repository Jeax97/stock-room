@echo off
title Stock-Room — Gestione Magazzino
echo.
echo  ====================================
echo    Stock-Room — Gestione Magazzino
echo  ====================================
echo.

:: Controlla se Docker e' in esecuzione
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRORE] Docker non e' in esecuzione!
    echo  Avvia Docker Desktop e riprova.
    echo.
    pause
    exit /b 1
)

echo  Avvio in corso... (la prima volta ci vogliono alcuni minuti)
echo.

docker compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo  [ERRORE] Qualcosa e' andato storto. Controlla i log con:
    echo  docker compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo  ====================================
echo    Stock-Room avviato con successo!
echo  ====================================
echo.
echo  Apri il browser su: http://localhost
echo.
echo  Per fermare: doppio click su "stop.bat"
echo.
pause
