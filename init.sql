CREATE DATABASE IF NOT EXISTS identity_db;
CREATE DATABASE IF NOT EXISTS post_db;


-- USER DÀNH CHO DEBEZIUM
CREATE USER IF NOT EXISTS 'debezium'@'%' IDENTIFIED WITH mysql_native_password BY 'dbz';
GRANT REPLICATION SLAVE, REPLICATION CLIENT, SELECT ON *.* TO 'debezium'@'%';

-- FLUSH QUYỀN
FLUSH PRIVILEGES;


USE identity_db;

CREATE TABLE IF NOT EXISTS outbox_events (
    id CHAR(36) PRIMARY KEY, -- UUID
    aggregate_type VARCHAR(255) NOT NULL, -- Vd: USER
    aggregate_id VARCHAR(255) NOT NULL,   -- Vd: userId
    type VARCHAR(255) NOT NULL,           -- Vd: PROFILE_UPDATED
    payload JSON NOT NULL,                -- Chứa data (avatar, name...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);