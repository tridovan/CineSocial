@echo off
title CineSocial Launcher
echo ======================================================
echo   KHOI DONG CINE SOCIAL MICROSERVICES (NO IDE MODE)
echo ======================================================

:: 1. API Gateway (Port 8888)
echo [1/7] Starting API Gateway...
start "API Gateway" java -Xms128m -Xmx256m -jar backend\api-gateway\target\api-gateway-1.0.0.jar

:: 2. Identity Service (Port 8081)
echo [2/7] Starting Identity Service...
start "Identity Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\identity-service\target\identity-service-1.0.0.jar

:: 3. Post Service (Port 8082 - du kien)
echo [3/7] Starting Post Service...
start "Post Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\post-service\target\post-service-0.0.1-SNAPSHOT.jar

:: 4. Media Service (Port 8083 - du kien)
echo [4/7] Starting Media Service...
start "Media Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\media-service\target\media-service-0.0.1-SNAPSHOT.jar

:: 5. Notification Service (Port 8084 - du kien)
echo [5/7] Starting Notification Service...
start "Notification Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar

:: 6. Search Service (Port 8085 - du kien)
echo [6/7] Starting Search Service...
start "Search Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\search-service\target\search-service-0.0.1-SNAPSHOT.jar

:: 7. Chat Service (Port 8086 - du kien)
echo [7/7] Starting Chat Service...
start "Chat Service" java -Xms128m -Xmx256m -Dspring.kafka.bootstrap-servers=localhost:9094 -jar backend\chat-service\target\chat-service-0.0.1-SNAPSHOT.jar

echo ======================================================
echo   DA KICH HOAT TAT CA SERVICE!
echo   Hay doi khoang 30-60s de he thong khoi dong xong.
echo   Kiem tra cac cua so console nho hien len de xem log.
echo ======================================================
pause