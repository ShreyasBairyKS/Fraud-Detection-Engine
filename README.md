# 🛡️ Fraud Detection Engine

> Real-time transaction fraud detection system powered by **Neo4j** graph analysis, **Redis** streams, and a pluggable rule engine.

---

## 🏗️ Architecture  

```
┌──────────────┐     ┌────────────────────┐     ┌─────────────────┐
│   Client /   │────▶│    API Gateway      │────▶│  Auth Service   │
│   Postman    │     │   (Express + Nginx) │     │  (JWT tokens)   │
└──────────────┘     └────────┬───────────┘     └─────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Transaction Service │
                    │  (validate/enrich)  │
                    └─────────┬──────────┘
                              │ XADD
                    ┌─────────▼──────────┐
                    │   Redis Streams     │
                    │   txn:incoming      │
                    └──┬──────────────┬──┘
                       │              │
              ┌────────▼───┐  ┌───────▼────────┐
              │ Graph Sync  │  │   Detection    │
              │  Service    │  │    Worker      │
              │ (Neo4j sync)│  │ (12 rules +   │
              └──────┬──────┘  │  graph queries)│
                     │         └───────┬────────┘
              ┌──────▼──────┐         │ XADD
              │   Neo4j     │  ┌──────▼────────┐
              │  (Graph DB) │  │ txn:scored     │
              └─────────────┘  └──────┬────────┘
                                      │
                              ┌───────▼────────┐
                              │  Alert Service  │
                              │ (Slack/email +  │
                              │  blocklist +    │
                              │  dashboard API) │
                              └────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone & Configure
```bash
git clone https://github.com/your-team/fraud-detection-engine.git
cd fraud-detection-engine
cp .env.example .env
```

### 2. Start Infrastructure
```bash
docker-compose up -d
```

This starts:
| Service | URL |
|---------|-----|
| Neo4j Browser | http://localhost:7474 |
| Redis | localhost:6379 |
| Jenkins | http://localhost:8080 |

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Neo4j
```bash
npm run seed
```

### 5. Setup Redis Streams
```bash
node scripts/setup-redis.js
```

### 6. Start Services
```bash
# Start all services (in separate terminals):
npm run start:auth          # Port 3001
npm run start:gateway       # Port 3000
npm run start:transaction   # Port 3002
npm run start:graph-sync    # Port 3003
npm run start:detection     # Port 3004
npm run start:alerts        # Port 3005
```

### 7. Verify
```bash
# Health checks
curl http://localhost:3000/health    # API Gateway
curl http://localhost:3001/health    # Auth Service

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 📁 Project Structure

```
fraud-detection-engine/
├── docker-compose.yml          # Neo4j + Redis + Jenkins
├── Jenkinsfile                 # CI/CD pipeline
├── package.json                # Workspace root
├── .env.example                # Environment template
├── scripts/
│   ├── seed-neo4j.js           # Graph database seeder
│   └── setup-redis.js          # Stream & key initialization
└── services/
    ├── api-gateway/            # Express reverse proxy (port 3000)
    ├── auth-service/           # JWT authentication (port 3001)
    ├── transaction-service/    # Transaction ingestion (port 3002)
    ├── graph-sync-service/     # Redis → Neo4j sync (port 3003)
    ├── detection-worker/       # Fraud rule engine (port 3004)
    └── alert-service/          # Alerts + dashboard (port 3005)
```

---

## 🔐 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Auth Service | `admin` | `admin123` |
| Neo4j | `neo4j` | `fraud_detection_dev` |

---

## 🧪 Testing
```bash
npm test          # Run all service tests
npm run lint      # Lint all services
```

---

## 📊 Phase Roadmap

| Phase | Weeks | Focus | Status |
|-------|-------|-------|--------|
| **Phase 1** | 1–2 | Foundation & Setup | ✅ Current |
| **Phase 2** | 3–4 | Core Services & Data Flow | ⏳ Next |
| **Phase 3** | 5–6 | Intelligence & Detection | 🔜 |
| **Phase 4** | 7–8 | Production & Delivery | 🔜 |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 20 + Express.js
- **Graph DB:** Neo4j 5 (Cypher, APOC)
- **Cache/Streams:** Redis 7 (Streams, Sets, Counters)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **CI/CD:** Jenkins (Declarative Pipeline)
- **Containers:** Docker + Docker Compose
- **Testing:** Jest + Supertest
- **Notifications:** Slack Webhooks + Nodemailer

---

## 👥 Team

| Role | Responsibilities |
|------|-----------------|
| **Tech Lead** | Architecture, auth middleware, Jenkins, deployment |
| **Driver** | Service implementation, Neo4j queries, Docker |
| **Reviewer** | Validation, testing, documentation, code review |

---

## 📄 License

MIT
