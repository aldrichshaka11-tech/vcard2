@echo off
title Smartcard Backend Server
echo Starting Flask Backend on http://localhost:8000 ...
cd backend
venv\Scripts\python app.py
pause
