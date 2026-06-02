@echo off
title Eu Vejo Você - Expo
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "C:\Users\lcsmj\EuVejoVoce"
call npx.cmd expo start --host lan
pause
