@echo off
title Security Scanner MVP
echo ========================================
echo Security Scanner MVP - Demarrage
echo ========================================
echo.

:: Vérifier Python
py --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe!
    pause
    exit /b 1
)

:: Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe!
    pause
    exit /b 1
)

echo [OK] Python et Node.js detectes
echo.

:: Créer dossier data si besoin
if not exist "data" mkdir data

:: Définir les chemins
for %%I in ("%~dp0.") do set "ROOT_DIR=%%~fI"
set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"

:: ────────────────────────────────────────────────
:: Lancer backend (fenêtre séparée)
:: ────────────────────────────────────────────────
echo [INFO] Demarrage du backend FastAPI sur http://localhost:8000
start "Backend - FastAPI" cmd /k "pushd ""%BACKEND_DIR%"" && py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Petite pause pour laisser le backend démarrer
timeout /t 3 /nobreak >nul

:: ────────────────────────────────────────────────
:: Lancer frontend → TOUJOURS dev + toujours npm install
:: ────────────────────────────────────────────────
echo [INFO] Demarrage du frontend Next.js (dev) sur http://localhost:3000
start "Frontend - Next.js (dev)" cmd /k "pushd ""%FRONTEND_DIR%"" && echo [INFO] Installation des dependances... && npm install && npm run dev"

:: Petite pause supplémentaire
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Serveurs lances avec succes!
echo ========================================
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:8000
echo API Docs : http://localhost:8000/docs
echo.
echo Fermez les fenetres CMD pour arreter.
echo ========================================
echo.

:: Ouvrir le navigateur
start "" "http://localhost:3000"

echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul