@echo off
title Stock-Room — Stop
echo.
echo  Fermando Stock-Room...
echo.

docker compose down

echo.
echo  Stock-Room fermato.
echo.
pause
