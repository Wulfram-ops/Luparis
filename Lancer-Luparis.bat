@echo off
cd /d "%~dp0"
echo Luparis : http://localhost:8765/index.html
echo Ferme cette fenetre pour arreter le serveur.
rem Rebuild app.js from src\js if a file there was edited
where py >nul 2>nul && (py tools\build_site.py) || (python tools\build_site.py)
start "" http://localhost:8765/index.html
where py >nul 2>nul && (py -m http.server 8765) || (python -m http.server 8765)
pause
