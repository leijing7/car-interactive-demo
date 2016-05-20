::npm-install.bat
@echo off
::install web server dependencies && game server dependencies
cd web-server && npm install -d && cd .. && cd interactive-server && npm install -d
