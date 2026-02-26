# Phase 2 — Core Services & Data Flow
### Weeks 3–4 | Team Tracker

> **Goal:** Transactions flow end-to-end through the system.  
> POST transaction → Validate → Enrich → Redis Stream → Neo4j Graph  
> **Update this file** after completing each task. Change `[ ]` to `[x]` and add your name + date.

---

## How to Use This File

```
1. Pick an unclaimed task
2. Add your name next to it so others know you're on it
3. When done: change [ ] to [x], add completion date
4. Commit this file with your code changes
5. If blocked, add a ⚠️ note under the task
```

---

## Pre-Requisites (Before Starting Phase 2)

- [ ] Everyone has `develop` branch pulled with Phase 1 code
- [ ] `cp .env.example .env` done on all machines
- [ ] `docker-compose up -d` running (Neo4j + Redis + Jenkins)
- [ ] `npm install` at root (installs all workspaces)
- [ ] `npm run seed` — Neo4j seeded with sample data
- [ ] `node scripts/setup-redis.js` — Redis streams created
- [ ] Verify: `curl http://localhost:3001/health` returns healthy
- [ ] Verify: Neo4j Browser at http://localhost:7474 shows nodes

---

## Week 3 — Transaction Service

### Branch: `feature/transaction-service`

All work goes in `services/transaction-service/`

---

### 3.1 — Project Structure Setup
> Restructure the skeleton into proper layered architecture

- [ ] Create `src/routes/transaction.routes.js` — extract routes from `app.js`
- [ ] Create `src/controllers/transaction.controller.js` — request handling
- [ ] Create `src/services/transaction.service.js` — core business logic
- [ ] Create `src/config/redis.js` — Redis connection singleton
- [ ] Create `src/config/neo4j.js` — Neo4j driver singleton
- [ ] Update `src/app.js` to use the new route file
- [ ] Verify: service starts without errors on port 3002

**Files to create:**
```
services/transaction-service/src/
├── config/
│   ├── redis.js
│   └── neo4j.js
├── routes/
│   └── transaction.routes.js
├── controllers/
│   └── transaction.controller.js
├── services/
│   └── transaction.service.js
├── validators/
│   └── transaction.validator.js
├── enrichment/
│   ├── account.enrichment.js
│   ├── merchant.enrichment.js
│   ├── ip.enrichment.js
│   └── velocity.enrichment.js
├── publishers/
│   └── redis-stream.publisher.js
├── app.js
└── index.js
```

---

### 3.2 — Request Validation
> Reject malformed transactions before any processing

- [ ] Create `src/validators/transaction.validator.js` using Joi
- [ ] Validate these required fields:
  ```
  accountId   — string, pattern: ACC-XXX, required
  amount      — number, positive, max 100000, required
  currency    — string, 3 chars, uppercase, default 'USD'
  merchantId  — string, pattern: MERCH-XXX, required
  deviceId    — string, required
  ipAddress   — string, valid IP format, required
  metadata    — object, optional
  ```
- [ ] Return 400 with clear error messages on validation failure
- [ ] Test with: missing fields, negative amount, invalid IP, amount > 100k

---

### 3.3 — Neo4j & Redis Config
> Shared connection setup (reused by enrichment + publisher)

- [ ] `src/config/neo4j.js` — create driver using `.env` values:
  ```js
  // Use: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD from .env
  // Export: driver instance + getSession() helper
  ```
- [ ] `src/config/redis.js` — create ioredis client using `.env` values:
  ```js
  // Use: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD from .env
  // Export: redis client instance
  ```
- [ ] Verify: both connect successfully on service start

---

### 3.4 — Account Enrichment
> Look up account info from Neo4j and attach to transaction

- [ ] Create `src/enrichment/account.enrichment.js`
- [ ] Query: `MATCH (a:Account {accountId: $accountId}) RETURN a`
- [ ] Attach to transaction:
  - `accountName` — from node
  - `accountRiskLevel` — LOW/MEDIUM/HIGH
  - `accountAge` — days since `createdAt`
  - `isNewAccount` — true if created within last 7 days
- [ ] Handle case: account not found → set `accountRiskLevel: 'UNKNOWN'`

---

### 3.5 — Merchant Enrichment
> Look up merchant info from Neo4j

- [ ] Create `src/enrichment/merchant.enrichment.js`
- [ ] Query: `MATCH (m:Merchant {merchantId: $merchantId}) RETURN m`
- [ ] Attach to transaction:
  - `merchantName`
  - `merchantCategory` — ecommerce, crypto, gambling, etc.
  - `merchantRiskScore` — 0–100 from the merchant node
- [ ] Handle case: merchant not found → set `merchantRiskScore: 50`

---

### 3.6 — IP Enrichment
> Look up IP reputation from Neo4j

- [ ] Create `src/enrichment/ip.enrichment.js`
- [ ] Query: `MATCH (i:IP {address: $ipAddress}) RETURN i`
- [ ] Attach to transaction:
  - `ipCountry`
  - `ipType` — residential, vpn, tor_exit, datacenter
  - `isVPN` — boolean
  - `isTor` — boolean
  - `isDatacenter` — boolean
- [ ] Handle case: IP not found → set all flags to `false`, type to `'unknown'`

---

### 3.7 — Velocity Counters (Redis)
> Track transaction frequency and amounts per account

- [ ] Create `src/enrichment/velocity.enrichment.js`
- [ ] On each transaction, increment two Redis keys with 1-hour TTL:
  ```
  velocity:txn:{accountId}:hourly    → INCR + EXPIRE 3600
  velocity:amt:{accountId}:hourly    → INCRBYFLOAT amount + EXPIRE 3600
  ```
- [ ] Attach to transaction:
  - `velocityTxnCount` — number of txns this account made in last hour
  - `velocityAmountTotal` — total amount this account spent in last hour
- [ ] These feed the Phase 3 rules: `velocity_txn` and `velocity_amount`

---

### 3.8 — Redis Stream Publisher
> Publish the fully enriched transaction to the stream

- [ ] Create `src/publishers/redis-stream.publisher.js`
- [ ] Function: `publishTransaction(enrichedTxn)`
  ```js
  await redis.xadd('txn:incoming', '*', 'data', JSON.stringify(enrichedTxn));
  ```
- [ ] The enriched transaction should contain ALL fields:
  ```json
  {
    "transactionId": "uuid-generated",
    "accountId": "ACC-001",
    "amount": 29.99,
    "currency": "USD",
    "merchantId": "MERCH-005",
    "deviceId": "DEV-001",
    "ipAddress": "192.168.1.100",
    "timestamp": "2026-02-26T10:30:00.000Z",
    "accountName": "Alice Johnson",
    "accountRiskLevel": "LOW",
    "accountAge": 408,
    "isNewAccount": false,
    "merchantName": "Netflix",
    "merchantCategory": "streaming",
    "merchantRiskScore": 2,
    "ipCountry": "US",
    "ipType": "residential",
    "isVPN": false,
    "isTor": false,
    "isDatacenter": false,
    "velocityTxnCount": 1,
    "velocityAmountTotal": 29.99
  }
  ```
- [ ] Return the `transactionId` to the controller for the API response

---

### 3.9 — Wire It All Together
> Connect validate → enrich → publish in the controller

- [ ] In `transaction.controller.js`, the POST flow should be:
  1. Validate request body (validator middleware or inline)
  2. Generate `transactionId` using `uuid.v4()`
  3. Enrich: account → merchant → IP → velocity (can run in parallel with `Promise.all`)
  4. Publish enriched transaction to Redis Stream
  5. Respond `201` with `{ transactionId, riskData: { ... } }`
- [ ] Add `GET /transactions/:id` — lookup from Redis or return 404 (basic)
- [ ] Verify end-to-end:
  ```bash
  curl -X POST http://localhost:3002/transactions \
    -H "Content-Type: application/json" \
    -d '{"accountId":"ACC-001","amount":29.99,"currency":"USD","merchantId":"MERCH-005","deviceId":"DEV-001","ipAddress":"192.168.1.100"}'
  ```

---

### 3.10 — Unit Tests
> Test each layer independently

- [ ] `tests/transaction.validator.test.js`
  - Valid transaction passes
  - Missing `accountId` → 400
  - Negative amount → 400
  - Invalid IP → 400
  - Amount > 100000 → 400
- [ ] `tests/transaction.enrichment.test.js`
  - Mock Neo4j, verify correct queries called
  - Account found → correct fields attached
  - Account not found → defaults applied
  - IP with VPN → `isVPN: true`
- [ ] `tests/transaction.controller.test.js`
  - Mock all dependencies
  - Valid request → 201 + transactionId returned
  - Invalid request → 400
  - Neo4j down → graceful error handling
- [ ] All tests pass: `npm run test --workspace=services/transaction-service`

---

### 3.11 — Integration Test
> Test with real Neo4j + Redis (Docker must be running)

- [ ] `tests/integration/transaction.integration.test.js`
  - POST valid transaction → 201
  - Check Redis: `XRANGE txn:incoming - +` contains the event
  - Check Redis: velocity keys exist for the account
  - POST invalid transaction → 400 (no Redis event created)
- [ ] Verify: `redis-cli XRANGE txn:incoming - +` shows events after POSTing

---

### 3.12 — Week 3 PR & Demo

- [ ] All code committed to `feature/transaction-service`
- [ ] `npm run lint --workspace=services/transaction-service` — no errors
- [ ] `npm run test --workspace=services/transaction-service` — all pass
- [ ] PR created: `feature/transaction-service` → `develop`
- [ ] Everyone reviewed the PR
- [ ] Merged to `develop`
- [ ] **Demo:** POST a transaction, see the event in Redis Stream ✅

---
---

## Week 4 — Graph Sync Service

### Branch: `feature/graph-sync-service`

All work goes in `services/graph-sync-service/`

---

### 4.1 — Project Structure Setup
> Restructure the skeleton into proper architecture

- [ ] Create proper folder structure:
  ```
  services/graph-sync-service/src/
  ├── config/
  │   ├── redis.js
  │   └── neo4j.js
  ├── worker.js            ← Redis Stream consumer loop
  ├── extractors/
  │   └── entity-extractor.js
  ├── graph/
  │   ├── entity-writer.js       ← MERGE nodes
  │   ├── relationship-writer.js ← MERGE relationships
  │   └── transaction-writer.js  ← CREATE txn node + :AT
  └── index.js
  ```
- [ ] Update `src/index.js` to start both Express (health check) AND the worker

---

### 4.2 — Redis Stream Consumer
> Continuously read new events from `txn:incoming`

- [ ] Create `src/worker.js`
- [ ] Use consumer group pattern:
  ```js
  // Consumer group: 'graph-sync-workers' (already created by setup-redis.js)
  // Consumer name: 'worker-1'
  const results = await redis.xreadgroup(
    'GROUP', 'graph-sync-workers', 'worker-1',
    'COUNT', 10, 'BLOCK', 5000,
    'STREAMS', 'txn:incoming', '>'
  );
  ```
- [ ] Parse each message: `JSON.parse(fields.data)`
- [ ] After processing each message, acknowledge it:
  ```js
  await redis.xack('txn:incoming', 'graph-sync-workers', messageId);
  ```
- [ ] Run in a continuous loop with error handling (don't crash on one bad event)
- [ ] Add graceful shutdown on SIGTERM/SIGINT

---

### 4.3 — Entity Extractor
> Pull structured entities from the raw transaction event

- [ ] Create `src/extractors/entity-extractor.js`
- [ ] Input: enriched transaction JSON from Redis Stream
- [ ] Output:
  ```js
  {
    account: { accountId, name, email, riskLevel },
    device:  { deviceId },
    ip:      { address, country, type, isVPN, isTor, isDatacenter },
    merchant: { merchantId, name, category, riskScore },
    transaction: { transactionId, amount, currency, timestamp }
  }
  ```
- [ ] Handle missing fields gracefully (don't crash if optional field absent)

---

### 4.4 — Neo4j Entity Writer (Nodes)
> Create/update nodes using MERGE (idempotent)

- [ ] Create `src/graph/entity-writer.js`
- [ ] Account node:
  ```cypher
  MERGE (a:Account {accountId: $accountId})
  ON CREATE SET a.name = $name, a.createdAt = datetime()
  ON MATCH SET a.lastSeen = datetime()
  ```
- [ ] Device node:
  ```cypher
  MERGE (d:Device {deviceId: $deviceId})
  ON CREATE SET d.createdAt = datetime()
  ```
- [ ] IP node:
  ```cypher
  MERGE (i:IP {address: $address})
  ON CREATE SET i.country = $country, i.type = $type,
    i.isVPN = $isVPN, i.isTor = $isTor, i.isDatacenter = $isDatacenter
  ```
- [ ] All use `MERGE` — safe to replay, no duplicates

---

### 4.5 — Neo4j Relationship Writer
> Connect entities with relationships

- [ ] Create `src/graph/relationship-writer.js`
- [ ] Account → Device (`:USED`):
  ```cypher
  MATCH (a:Account {accountId: $accountId}), (d:Device {deviceId: $deviceId})
  MERGE (a)-[:USED]->(d)
  ```
- [ ] Account → IP (`:CONNECTED_FROM`):
  ```cypher
  MATCH (a:Account {accountId: $accountId}), (i:IP {address: $ipAddress})
  MERGE (a)-[:CONNECTED_FROM]->(i)
  ON CREATE SET r.firstSeen = datetime()
  ON MATCH SET r.lastSeen = datetime()
  ```
- [ ] All use `MERGE` — idempotent

---

### 4.6 — Neo4j Transaction Writer
> Create the transaction node and merchant link

- [ ] Create `src/graph/transaction-writer.js`
- [ ] Transaction node + link to Account:
  ```cypher
  MATCH (a:Account {accountId: $accountId})
  CREATE (t:Transaction {
    transactionId: $transactionId,
    amount: $amount,
    currency: $currency,
    timestamp: datetime($timestamp)
  })
  CREATE (a)-[:MADE]->(t)
  ```
- [ ] Transaction → Merchant (`:AT`):
  ```cypher
  MATCH (t:Transaction {transactionId: $transactionId}), (m:Merchant {merchantId: $merchantId})
  CREATE (t)-[:AT]->(m)
  ```
- [ ] Transactions use `CREATE` (not MERGE) since each txn is unique

---

### 4.7 — Idempotency Handling
> Ensure replaying the same event doesn't create duplicates

- [ ] Before writing a Transaction node, check if `transactionId` already exists:
  ```cypher
  MATCH (t:Transaction {transactionId: $transactionId}) RETURN t
  ```
  If found, skip the write and log a warning
- [ ] Entity nodes (Account, Device, IP) already use `MERGE` — naturally idempotent
- [ ] Relationships use `MERGE` — naturally idempotent
- [ ] Test: send the same event twice → no new nodes/relationships created

---

### 4.8 — Unit Tests

- [ ] `tests/entity-extractor.test.js`
  - Complete event → all entities extracted
  - Partial event → missing fields handled gracefully
  - Malformed JSON → error thrown cleanly
- [ ] `tests/entity-writer.test.js`
  - Mock Neo4j session, verify correct Cypher queries + params
  - Test MERGE behavior (create vs match paths)
- [ ] `tests/relationship-writer.test.js`
  - Mock Neo4j, verify correct relationship queries
- [ ] `tests/idempotency.test.js`
  - Send same event twice → verify no duplicate nodes
- [ ] All tests pass: `npm run test --workspace=services/graph-sync-service`

---

### 4.9 — Integration Test
> End-to-end: POST transaction → Graph Sync picks it up → Neo4j updated

- [ ] `tests/integration/graph-sync.integration.test.js`
  - POST a transaction to Transaction Service
  - Wait for Graph Sync worker to process (poll Neo4j)
  - Verify in Neo4j: new Transaction node exists
  - Verify: Account-[:MADE]->Transaction relationship exists
  - Verify: Account-[:USED]->Device relationship exists
  - Verify: Account-[:CONNECTED_FROM]->IP relationship exists
  - Verify: Transaction-[:AT]->Merchant relationship exists
- [ ] Manual verification: open http://localhost:7474 and run:
  ```cypher
  MATCH p=(a:Account)-[:MADE]->(t:Transaction)-[:AT]->(m:Merchant) RETURN p LIMIT 20
  ```

---

### 4.10 — Week 4 PR & Demo

- [ ] All code committed to `feature/graph-sync-service`
- [ ] `npm run lint --workspace=services/graph-sync-service` — no errors
- [ ] `npm run test --workspace=services/graph-sync-service` — all pass
- [ ] PR created: `feature/graph-sync-service` → `develop`
- [ ] Everyone reviewed the PR
- [ ] Merged to `develop`
- [ ] **Demo:** Post a transaction → view the graph in Neo4j Browser ✅

---
---

## Full End-to-End Verification (End of Phase 2)

When both services are merged to `develop`, verify the complete pipeline:

- [ ] Start all services:
  ```bash
  npm run start:auth          # port 3001
  npm run start:gateway       # port 3000
  npm run start:transaction   # port 3002
  npm run start:graph-sync    # port 3003
  ```
- [ ] Submit a normal transaction:
  ```bash
  curl -X POST http://localhost:3000/api/transactions \
    -H "Content-Type: application/json" \
    -d '{"accountId":"ACC-001","amount":29.99,"currency":"USD","merchantId":"MERCH-005","deviceId":"DEV-001","ipAddress":"192.168.1.100"}'
  ```
  Expected: 201 + transactionId
- [ ] Submit a suspicious transaction:
  ```bash
  curl -X POST http://localhost:3000/api/transactions \
    -H "Content-Type: application/json" \
    -d '{"accountId":"ACC-005","amount":4999.99,"currency":"USD","merchantId":"MERCH-003","deviceId":"DEV-SHARED","ipAddress":"185.220.101.1"}'
  ```
  Expected: 201 + enrichment shows `isVPN: true`, high merchant risk
- [ ] Verify Redis: `redis-cli XRANGE txn:incoming - +` shows both events
- [ ] Verify Neo4j: new Transaction nodes visible in browser
- [ ] Verify: fraud ring graph still intact (ACC-005, ACC-006, ACC-008 → DEV-SHARED)
- [ ] `npm test` at root — ALL service tests pass
- [ ] `npm run lint` at root — no lint errors

---

## Quick Reference

### Useful Commands
```bash
# Docker
docker-compose up -d              # start infra
docker-compose logs -f neo4j      # tail Neo4j logs
docker-compose logs -f redis      # tail Redis logs

# Redis CLI
docker exec -it fraud-redis redis-cli
> XRANGE txn:incoming - +         # see all stream events
> XLEN txn:incoming               # count stream events
> KEYS velocity:*                 # see velocity counters
> SMEMBERS blocklist:accounts     # see blocked accounts

# Neo4j Browser
# Open http://localhost:7474
# Login: neo4j / fraud_detection_dev
MATCH (n) RETURN n LIMIT 50
MATCH (a:Account)-[:MADE]->(t:Transaction) RETURN a, t
MATCH p=(a:Account)-[:USED]->(d:Device)<-[:USED]-(b:Account) WHERE a<>b RETURN p

# Testing
npm test                                                    # all services
npm run test --workspace=services/transaction-service       # one service
npm run lint                                                # lint all
```

### Seeded Test Data (from Phase 1)
```
Accounts:  ACC-001 (Alice, LOW), ACC-002 (Bob, LOW), ACC-003 (Charlie, MEDIUM)
           ACC-004 (Diana, LOW), ACC-005 (Eve, HIGH), ACC-006 (Frank, HIGH)
           ACC-007 (Grace, LOW), ACC-008 (Hank, HIGH)

Devices:   DEV-001 (iOS), DEV-002 (Android), DEV-003 (Windows), DEV-004 (Tor)
           DEV-005 (macOS), DEV-SHARED (fraud ring device)

IPs:       192.168.1.100 (residential US), 10.0.0.55 (residential US)
           203.0.113.42 (VPN Romania), 198.51.100.77 (Tor Germany)
           104.21.45.12 (datacenter US), 185.220.101.1 (VPN Netherlands — fraud ring)

Merchants: MERCH-001 (Amazon, risk:5), MERCH-002 (Walmart, risk:3)
           MERCH-003 (CryptoExchange, risk:45), MERCH-004 (GiftCards4Less, risk:60)
           MERCH-005 (Netflix, risk:2), MERCH-006 (Offshore Casino, risk:75)

Fraud Ring: ACC-005 + ACC-006 + ACC-008 → share DEV-SHARED + IP 185.220.101.1
```

---

*Last updated: 2026-02-26 — Phase 2 started*
