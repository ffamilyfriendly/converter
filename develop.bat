@echo off
wt -d "C:\Users\jonat\OneDrive\programmering\ts\converter_v2" cmd /k "npm run dev" ^
; split-pane cmd /k "cd /d C:\Users\jonat\OneDrive\programmering\ts\converter_v2 && npm run start" ^
; split-pane cmd /k "ngrok http --url=tender-picked-snapper.ngrok-free.app 3000"