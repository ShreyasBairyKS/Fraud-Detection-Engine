// ─────────────────────────────────────────────────
// Neo4j Seed Script — Sample Fraud Detection Data
// ─────────────────────────────────────────────────
// Run:  npm run seed  (or)  node scripts/seed-neo4j.js
//
// Seeds: Accounts, Devices, IPs, Merchants
//        + relationships + a sample fraud ring
// ─────────────────────────────────────────────────

require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'fraud_detection_dev'
  )
);

async function seed() {
  const session = driver.session();

  try {
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // ── Constraints & Indexes ─────────────────────────
    console.log('📐 Creating constraints and indexes...');
    const constraints = [
      'CREATE CONSTRAINT account_id IF NOT EXISTS FOR (a:Account) REQUIRE a.accountId IS UNIQUE',
      'CREATE CONSTRAINT device_id IF NOT EXISTS FOR (d:Device) REQUIRE d.deviceId IS UNIQUE',
      'CREATE CONSTRAINT ip_address IF NOT EXISTS FOR (i:IP) REQUIRE i.address IS UNIQUE',
      'CREATE CONSTRAINT merchant_id IF NOT EXISTS FOR (m:Merchant) REQUIRE m.merchantId IS UNIQUE',
      'CREATE CONSTRAINT txn_id IF NOT EXISTS FOR (t:Transaction) REQUIRE t.transactionId IS UNIQUE',
    ];
    for (const c of constraints) {
      await session.run(c);
    }

    // ── Accounts ──────────────────────────────────────
    console.log('👤 Creating accounts...');
    const accounts = [
      { accountId: 'ACC-001', name: 'Alice Johnson', email: 'alice@example.com', riskLevel: 'LOW', createdAt: '2025-01-15T10:00:00Z' },
      { accountId: 'ACC-002', name: 'Bob Smith', email: 'bob@example.com', riskLevel: 'LOW', createdAt: '2025-03-20T14:30:00Z' },
      { accountId: 'ACC-003', name: 'Charlie Brown', email: 'charlie@example.com', riskLevel: 'MEDIUM', createdAt: '2025-06-01T09:15:00Z' },
      { accountId: 'ACC-004', name: 'Diana Prince', email: 'diana@example.com', riskLevel: 'LOW', createdAt: '2025-07-10T16:45:00Z' },
      { accountId: 'ACC-005', name: 'Eve Hacker', email: 'eve@darkweb.onion', riskLevel: 'HIGH', createdAt: '2026-01-05T02:00:00Z' },
      { accountId: 'ACC-006', name: 'Frank Fraud', email: 'frank@tempmail.com', riskLevel: 'HIGH', createdAt: '2026-02-01T03:30:00Z' },
      { accountId: 'ACC-007', name: 'Grace Hopper', email: 'grace@example.com', riskLevel: 'LOW', createdAt: '2024-11-20T11:00:00Z' },
      { accountId: 'ACC-008', name: 'Hank Mallory', email: 'hank@disposable.io', riskLevel: 'HIGH', createdAt: '2026-02-10T01:15:00Z' },
    ];
    for (const a of accounts) {
      await session.run(
        `CREATE (a:Account {accountId: $accountId, name: $name, email: $email, riskLevel: $riskLevel, createdAt: datetime($createdAt)})`,
        a
      );
    }

    // ── Devices ───────────────────────────────────────
    console.log('📱 Creating devices...');
    const devices = [
      { deviceId: 'DEV-001', fingerprint: 'fp-abc123', os: 'iOS 17', browser: 'Safari' },
      { deviceId: 'DEV-002', fingerprint: 'fp-def456', os: 'Android 14', browser: 'Chrome' },
      { deviceId: 'DEV-003', fingerprint: 'fp-ghi789', os: 'Windows 11', browser: 'Firefox' },
      { deviceId: 'DEV-004', fingerprint: 'fp-jkl012', os: 'Linux', browser: 'Tor Browser' },
      { deviceId: 'DEV-005', fingerprint: 'fp-mno345', os: 'macOS 14', browser: 'Chrome' },
      // Shared device (used by fraud ring)
      { deviceId: 'DEV-SHARED', fingerprint: 'fp-fraud-shared', os: 'Windows 10', browser: 'Chrome' },
    ];
    for (const d of devices) {
      await session.run(
        `CREATE (d:Device {deviceId: $deviceId, fingerprint: $fingerprint, os: $os, browser: $browser})`,
        d
      );
    }

    // ── IP Addresses ──────────────────────────────────
    console.log('🌐 Creating IP addresses...');
    const ips = [
      { address: '192.168.1.100', type: 'residential', country: 'US', isVPN: false, isTor: false, isDatacenter: false },
      { address: '10.0.0.55', type: 'residential', country: 'US', isVPN: false, isTor: false, isDatacenter: false },
      { address: '203.0.113.42', type: 'vpn', country: 'RO', isVPN: true, isTor: false, isDatacenter: false },
      { address: '198.51.100.77', type: 'tor_exit', country: 'DE', isVPN: false, isTor: true, isDatacenter: false },
      { address: '104.21.45.12', type: 'datacenter', country: 'US', isVPN: false, isTor: false, isDatacenter: true },
      // Shared IP (used by fraud ring)
      { address: '185.220.101.1', type: 'vpn', country: 'NL', isVPN: true, isTor: false, isDatacenter: true },
    ];
    for (const ip of ips) {
      await session.run(
        `CREATE (i:IP {address: $address, type: $type, country: $country, isVPN: $isVPN, isTor: $isTor, isDatacenter: $isDatacenter})`,
        ip
      );
    }

    // ── Merchants ─────────────────────────────────────
    console.log('🏪 Creating merchants...');
    const merchants = [
      { merchantId: 'MERCH-001', name: 'Amazon', category: 'ecommerce', riskScore: 5 },
      { merchantId: 'MERCH-002', name: 'Walmart', category: 'retail', riskScore: 3 },
      { merchantId: 'MERCH-003', name: 'CryptoExchange Pro', category: 'crypto', riskScore: 45 },
      { merchantId: 'MERCH-004', name: 'GiftCards4Less', category: 'gift_cards', riskScore: 60 },
      { merchantId: 'MERCH-005', name: 'Netflix', category: 'streaming', riskScore: 2 },
      { merchantId: 'MERCH-006', name: 'Offshore Casino Royale', category: 'gambling', riskScore: 75 },
    ];
    for (const m of merchants) {
      await session.run(
        `CREATE (m:Merchant {merchantId: $merchantId, name: $name, category: $category, riskScore: $riskScore})`,
        m
      );
    }

    // ── Relationships — Normal Users ──────────────────
    console.log('🔗 Creating normal user relationships...');

    // Alice uses DEV-001 from home IP
    await session.run(`MATCH (a:Account {accountId:'ACC-001'}), (d:Device {deviceId:'DEV-001'}) CREATE (a)-[:USED {since:'2025-01-15'}]->(d)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-001'}), (i:IP {address:'192.168.1.100'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2025-01-15', lastSeen:'2026-02-20'}]->(i)`);

    // Bob uses DEV-002 from home IP
    await session.run(`MATCH (a:Account {accountId:'ACC-002'}), (d:Device {deviceId:'DEV-002'}) CREATE (a)-[:USED {since:'2025-03-20'}]->(d)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-002'}), (i:IP {address:'10.0.0.55'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2025-03-20', lastSeen:'2026-02-18'}]->(i)`);

    // Grace uses DEV-005 from home IP
    await session.run(`MATCH (a:Account {accountId:'ACC-007'}), (d:Device {deviceId:'DEV-005'}) CREATE (a)-[:USED {since:'2024-11-20'}]->(d)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-007'}), (i:IP {address:'192.168.1.100'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2024-11-20', lastSeen:'2026-02-15'}]->(i)`);

    // ── Relationships — Fraud Ring ────────────────────
    console.log('🕸️  Creating fraud ring relationships...');

    // Eve, Frank, Hank all share DEV-SHARED and the VPN IP
    const fraudsters = ['ACC-005', 'ACC-006', 'ACC-008'];
    for (const accId of fraudsters) {
      await session.run(
        `MATCH (a:Account {accountId:$accId}), (d:Device {deviceId:'DEV-SHARED'}) CREATE (a)-[:USED {since:'2026-02-01'}]->(d)`,
        { accId }
      );
      await session.run(
        `MATCH (a:Account {accountId:$accId}), (i:IP {address:'185.220.101.1'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2026-02-01', lastSeen:'2026-02-25'}]->(i)`,
        { accId }
      );
    }

    // Eve also uses Tor
    await session.run(`MATCH (a:Account {accountId:'ACC-005'}), (i:IP {address:'198.51.100.77'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2026-01-05', lastSeen:'2026-02-20'}]->(i)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-005'}), (d:Device {deviceId:'DEV-004'}) CREATE (a)-[:USED {since:'2026-01-05'}]->(d)`);

    // Charlie (medium risk) uses VPN sometimes
    await session.run(`MATCH (a:Account {accountId:'ACC-003'}), (d:Device {deviceId:'DEV-003'}) CREATE (a)-[:USED {since:'2025-06-01'}]->(d)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-003'}), (i:IP {address:'203.0.113.42'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2025-06-01', lastSeen:'2026-02-22'}]->(i)`);

    // Diana — normal user
    await session.run(`MATCH (a:Account {accountId:'ACC-004'}), (d:Device {deviceId:'DEV-005'}) CREATE (a)-[:USED {since:'2025-07-10'}]->(d)`);
    await session.run(`MATCH (a:Account {accountId:'ACC-004'}), (i:IP {address:'10.0.0.55'}) CREATE (a)-[:CONNECTED_FROM {firstSeen:'2025-07-10', lastSeen:'2026-02-24'}]->(i)`);

    // ── Sample Transactions ───────────────────────────
    console.log('💳 Creating sample transactions...');
    const txns = [
      { transactionId: 'TXN-001', amount: 29.99, currency: 'USD', accountId: 'ACC-001', merchantId: 'MERCH-005', riskScore: 5, riskLevel: 'LOW', timestamp: '2026-02-20T10:30:00Z' },
      { transactionId: 'TXN-002', amount: 150.00, currency: 'USD', accountId: 'ACC-002', merchantId: 'MERCH-001', riskScore: 8, riskLevel: 'LOW', timestamp: '2026-02-20T11:00:00Z' },
      { transactionId: 'TXN-003', amount: 4999.99, currency: 'USD', accountId: 'ACC-005', merchantId: 'MERCH-003', riskScore: 87, riskLevel: 'HIGH', timestamp: '2026-02-21T02:15:00Z' },
      { transactionId: 'TXN-004', amount: 2500.00, currency: 'USD', accountId: 'ACC-006', merchantId: 'MERCH-004', riskScore: 92, riskLevel: 'HIGH', timestamp: '2026-02-21T02:17:00Z' },
      { transactionId: 'TXN-005', amount: 750.00, currency: 'EUR', accountId: 'ACC-003', merchantId: 'MERCH-006', riskScore: 55, riskLevel: 'MEDIUM', timestamp: '2026-02-22T14:00:00Z' },
      { transactionId: 'TXN-006', amount: 3200.00, currency: 'USD', accountId: 'ACC-008', merchantId: 'MERCH-003', riskScore: 89, riskLevel: 'HIGH', timestamp: '2026-02-22T03:45:00Z' },
    ];
    for (const t of txns) {
      await session.run(
        `CREATE (t:Transaction {transactionId: $transactionId, amount: $amount, currency: $currency, riskScore: $riskScore, riskLevel: $riskLevel, timestamp: datetime($timestamp)})`,
        t
      );
      // Link transaction → account
      await session.run(
        `MATCH (a:Account {accountId: $accountId}), (t:Transaction {transactionId: $transactionId}) CREATE (a)-[:MADE]->(t)`,
        t
      );
      // Link transaction → merchant
      await session.run(
        `MATCH (m:Merchant {merchantId: $merchantId}), (t:Transaction {transactionId: $transactionId}) CREATE (t)-[:AT]->(m)`,
        t
      );
    }

    // ── Summary ───────────────────────────────────────
    const result = await session.run(`
      MATCH (n) RETURN labels(n)[0] AS label, count(n) AS count
      ORDER BY count DESC
    `);
    console.log('\n📊 Seed Summary:');
    result.records.forEach(r => {
      console.log(`   ${r.get('label')}: ${r.get('count').toNumber()}`);
    });

    const relResult = await session.run(`
      MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count
      ORDER BY count DESC
    `);
    console.log('\n🔗 Relationships:');
    relResult.records.forEach(r => {
      console.log(`   ${r.get('type')}: ${r.get('count').toNumber()}`);
    });

    console.log('\n✅ Neo4j seeded successfully!');
    console.log('🌐 Open Neo4j Browser: http://localhost:7474');
    console.log('   Try: MATCH (n) RETURN n LIMIT 50');
    console.log('   Fraud ring: MATCH p=(a:Account)-[:USED]->(d:Device)<-[:USED]-(b:Account) WHERE a <> b RETURN p');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
