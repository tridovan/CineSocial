@echo off
taskkill /FI "WINDOWTITLE eq API Gateway" /F
taskkill /FI "WINDOWTITLE eq Identity Service" /F
taskkill /FI "WINDOWTITLE eq Post Service" /F
taskkill /FI "WINDOWTITLE eq Media Service" /F
taskkill /FI "WINDOWTITLE eq Notification Service" /F
taskkill /FI "WINDOWTITLE eq Search Service" /F
taskkill /FI "WINDOWTITLE eq Chat Service" /F
echo Da tat tat ca service CineSocial.
pause