Video demo: https://youtu.be/XMoeWGEIr1M

# CineConnect - Microservices Social Network for Movie Lovers

CineConnect is a social networking platform designed for movie enthusiasts where users can:
- Write movie reviews (Posts)
- Upload short video Reels
- Follow other users
- Chat in real-time
- Search content at high speed (movies, users, posts)

The project focuses on complex domain problems such as distributed systems, data consistency, scalability, asynchronous workflows, and event-driven communication.

---

## Microservices Architecture

### 1. Core Services

| Service            | Technology Stack                    | Responsibilities |
|-------------------|-------------------------------------|------------------|
| Gateway Service    | Gateway Webflux                    | Entry point, JWT Authentication, OAuth2|
| Identity Service   | MySQL, Debezium                    | User profile, Follow/Unfollow, Issue JWT Token |
| Post Service       | MySQL, Debezium, Kafka              |Posts, Likes, Comments, Reels |
| Media Service      | MinIO, FFmpeg, Kafka                | Image/video upload, video transcoding (async) |
| Chat Service       | WebSocket STOMP, MongoDB, Kafka     | Real-time messaging (1-1 & group) |
| Notification Serivce| SSE, Mongo                         | Push notifications |
| Search Service     | Elasticsearch, Kafka                | Full-text search, autocomplete suggestions |

---

## Infrastructure Components

- Message Broker: Apache Kafka
- Databases:
  - MySQL (transactional)
  - MongoDB (messages, notifications)
  - Elasticsearch (read/search)
- Object Storage: MinIO
- Change Data Capture: Debezium
- Media Processing: FFmpeg

---

## Core Features

### 1. Social Feed & Interactions
- Publish movie review posts with images/videos
- Like and comment
- Follow/Unfollow system
- Personalized Feed based on Following graph

### 3. Object store
1. User uploads a video
2. Media Service receives file
3. Media Service pushes event to Kafka
4. Worker compresses video via FFmpeg
5. MinIO stores transcoded output
6. If an error occurs, the saga will revert to a failed state so the user can retry.

### 3. Real-time Chat
- Supports direct and group messaging
- WebSocket STOMP over TCP
- Data stored in MongoDB for fast write throughput
- Handles scaling challenges across multiple instances

### 4. Smart Search
- Full-text search via Elasticsearch
- Fuzzy matching
- Autocomplete suggestions

---

## Solving Microservice Architecture Challenges

### 1. Distributed Data Consistency (Transactional Outbox + Debezium)

Challenges:
- Ensuring atomic DB writes + event publishing
- Syncing User Profile across services
- Syncing Posts → Search index

Solutions:
- Use Outbox table to store domain events alongside main transactions
- Debezium captures Outbox changes and publishes to Kafka
- Post/Chat fetch User Profile on-demand via Feign for first usage
- Identity Service only publishes profile update events (CDC)

Optimization:
- Avoid syncing all profiles to Post/Chat Service unnecessarily
- Sync only when interaction happens
- Guaranteed Post → Search sync using Outbox + Debezium (because Search always needs Post data)

---

### 2. Distributed Transaction (Saga Pattern - Choreography)

Applied on Reel Publishing:

Workflow:
- Post created with status `PENDING_MEDIA`
- `PostCreatedEvent` → Kafka
- Media Service consumes event → transcodes video
- Emits `MediaProcessedEvent`
- Post Service updates status → `PUBLISHED`
- If failed → `MEDIA_FAILED` and user can retry without re-posting

---

### 3. CQRS + Search Synchronization

Challenges:
- Complex queries in MySQL are slow

Solution:
- Write layer: MySQL
- Read layer: Elasticsearch
- Sync via Kafka
- Achieves millisecond-level search performance

## Limitations (Due to Resource Constraints)

### 1. Performance & Caching
- No Redis for caching → DB receives more read load
- Rate limiting weaker when scaling Gateway horizontally
- All profile/config reads hit MySQL directly

### 2. Security
- No token revocation (no Redis to store blacklist)
- Tokens remain valid until expiration
- No distributed locking system

### 3. Observability & Monitoring
- No ELK/EFK stack
- No Zipkin/Jaeger tracing
- Logs distributed across containers
- Debugging performed manually


### 4. Single Point of Failure (SPOF)
- Kafka, MySQL, MinIO run as single nodes
- No replica / failover capability

### 5. Websocket STOMP & MESSAGE Broker
- Because the computer resources are insufficient to use another message broker (RabbitQ...).
- Kafka is used as a message orchestrator to exchange messages between instances of a service being used.
Challenges:
- 
- Users connected to different Chat Service instances

Solution:
- Kafka pub/sub to exchange chat messages between instances
- Randomized consumer group for horizontal scaling

Trade-off:
- Broadcast to all instances due to WebSocket being stateful


## Learning Objectives

This project is intentionally designed to explore:

- Microservice domain decomposition
- Event-driven architecture and asynchronous workflows
- Data consistency patterns:
  - Outbox Pattern
  - Debezium CDC
  - Saga Pattern
  - CQRS
- Media transcoding pipelines
- WebSocket (Which interceptor performs authorization authentication)
- Object storage with MinIO
- Elasticsearch as read model

---

## Future Improvements

Planned features that were skipped due to time/hardware limits:

- Email verification
- Forgot password flow
- Redis caching & distributed locks
- Token revocation management
- Centralized logging & tracing

---

## Conclusion

CineConnect is not a production-grade commercial product, but a realistic educational project that explores real-world microservice challenges including:

- Consistency
- Scalability
- Streaming
- Event-driven workflows
- Real-time communication
- Distributed search
- Trade-offs between performance and resource constraints

Despite missing some production components (Redis, ELK, multi-node clusters), the system successfully demonstrates key architectural patterns used in modern distributed systems.

