@echo off
title CineSocial Launcher
echo ======================================================
echo   KHOI DONG CINE SOCIAL MICROSERVICES (FIXED PORTS)
echo ======================================================

:: 1. API Gateway (Port 8080 - Khớp với file config của bạn)
echo [1/7] Starting API Gateway...
start "API Gateway" java -Xms128m -Xmx256m -jar backend\api-gateway\target\api-gateway-1.0.0.jar

:: 2. Identity Service (Port 8081)
echo [2/7] Starting Identity Service...
start "Identity Service" java -Xms128m -Xmx256m -jar backend\identity-service\target\identity-service-1.0.0.jar

:: 3. Post Service (Port 8082)
echo [3/7] Starting Post Service...
start "Post Service" java -Xms128m -Xmx256m -jar backend\post-service\target\post-service-0.0.1-SNAPSHOT.jar

:: 4. Media Service (Port 8083)
echo [4/7] Starting Media Service...
start "Media Service" java -Xms128m -Xmx256m -jar backend\media-service\target\media-service-0.0.1-SNAPSHOT.jar

:: 5. Chat Service (Port 8084 - Khớp với route trong Gateway)
echo [5/7] Starting Chat Service...
start "Chat Service" java -Xms128m -Xmx256m -jar backend\chat-service\target\chat-service-0.0.1-SNAPSHOT.jar

:: 6. Notification Service (Port 8085 - Khớp với route trong Gateway)
echo [6/7] Starting Notification Service...
start "Notification Service" java -Xms128m -Xmx256m -jar backend\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar

:: 7. Search Service (Port 8086 - Khớp với route trong Gateway và config của Search)
echo [7/7] Starting Search Service...
start "Search Service" java -Xms128m -Xmx256m -jar backend\search-service\target\search-service-0.0.1-SNAPSHOT.jar

echo ======================================================
echo   DA KICH HOAT TAT CA SERVICE!
echo   Vui long dam bao Docker (Elasticsearch 9200) dang chay.
echo ======================================================
pause