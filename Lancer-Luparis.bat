@echo off
cd /d "%~dp0"
echo Luparis : http://localhost:8765/index.html
echo Ferme cette fenetre pour arreter le serveur.
start "" http://localhost:8765/index.html
where py >nul 2>nul && (py -m http.server 8765) || (python -m http.server 8765)
pause
