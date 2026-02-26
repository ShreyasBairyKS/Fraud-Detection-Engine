// ─────────────────────────────────────────────────
// Redis Setup Script — Create Streams & Verify
// ─────────────────────────────────────────────────
// Run:  node scripts/setup-redis.js
// ─────────────────────────────────────────────────

require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function setup() {
  try {
    console.log('🔌 Connecting to Redis...');
    await redis.ping();
    console.log('✅ Redis connected!\n');

    // ── Create Streams ────────────────────────────────
    // Redis streams are auto-created on first XADD,
    // but we'll create initial entries so consumer groups work.

    console.log('📡 Creating streams...');

    // txn:incoming — enriched transactions ready for scoring
    try {
      await redis.xgroup('CREATE', 'txn:incoming', 'detection-workers', '0', 'MKSTREAM');
      console.log('   ✅ txn:incoming stream + detection-workers group created');
    } catch (e) {
      if (e.message.includes('BUSYGROUP')) {
        console.log('   ℹ️  txn:incoming stream + detection-workers group already exists');
      } else throw e;
    }

    // txn:scored — scored transactions ready for alerting
    try {
      await redis.xgroup('CREATE', 'txn:scored', 'alert-workers', '0', 'MKSTREAM');
      console.log('   ✅ txn:scored stream + alert-workers group created');
    } catch (e) {
      if (e.message.includes('BUSYGROUP')) {
        console.log('   ℹ️  txn:scored stream + alert-workers group already exists');
      } else throw e;
    }

    // ── Verify Keys ──────────────────────────────────
    console.log('\n📋 Verifying Redis state:');
    const streams = ['txn:incoming', 'txn:scored'];
    for (const s of streams) {
      const info = await redis.xinfo('STREAM', s);
      console.log(`   ${s}: length=${info[1]}, groups=${info[9] || 0}`);
    }

    // ── Set up sample blocklist keys ──────────────────
    console.log('\n🚫 Setting up blocklist keys...');
    await redis.sadd('blocklist:accounts', 'PLACEHOLDER');
    await redis.srem('blocklist:accounts', 'PLACEHOLDER');
    await redis.sadd('blocklist:ips', 'PLACEHOLDER');
    await redis.srem('blocklist:ips', 'PLACEHOLDER');
    console.log('   ✅ blocklist:accounts set created');
    console.log('   ✅ blocklist:ips set created');

    console.log('\n✅ Redis setup complete!');
    console.log('   Streams: txn:incoming, txn:scored');
    console.log('   Blocklists: blocklist:accounts, blocklist:ips');

  } catch (error) {
    console.error('❌ Redis setup failed:', error.message);
    throw error;
  } finally {
    redis.disconnect();
  }
}

setup();
