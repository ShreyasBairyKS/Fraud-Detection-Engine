// ─────────────────────────────────────────────────
// Detection Worker — Rule Interface (Phase 3 skeleton)
// ─────────────────────────────────────────────────
// Each rule module exports: { name, description, weight, evaluate(txn) }
// evaluate() returns { triggered: boolean, score: number, details: string }
// ─────────────────────────────────────────────────

/**
 * @typedef {Object} RuleResult
 * @property {boolean} triggered - Whether the rule was triggered
 * @property {number}  score     - Points to add to raw score (0–50)
 * @property {string}  details   - Human-readable explanation
 */

/**
 * @typedef {Object} FraudRule
 * @property {string}   name        - Rule identifier (e.g., 'high_amount')
 * @property {string}   description - What the rule detects
 * @property {number}   weight      - Relative importance (1–5)
 * @property {function} evaluate    - async (txn, context) => RuleResult
 */

// Rules to implement in Phase 3:
const RULE_MANIFEST = [
  // ── Amount-Based ──
  { name: 'high_amount',       description: 'Transaction exceeds $3000 threshold' },
  { name: 'round_amount',      description: 'Suspiciously round amount ($1000, $2500...)' },

  // ── Account-Based ──
  { name: 'new_account',       description: 'Account created within last 7 days' },
  { name: 'high_risk_account', description: 'Account already flagged as HIGH risk' },

  // ── IP-Based ──
  { name: 'foreign_ip',        description: 'IP country differs from account country' },
  { name: 'vpn_detected',      description: 'Transaction from VPN IP address' },
  { name: 'tor_detected',      description: 'Transaction from Tor exit node' },
  { name: 'datacenter_ip',     description: 'Transaction from datacenter IP' },

  // ── Velocity-Based (Redis) ──
  { name: 'velocity_txn',      description: '10+ transactions in last hour' },
  { name: 'velocity_amount',   description: '$10,000+ total in last hour' },

  // ── Graph-Based (Neo4j) ──
  { name: 'shared_device',     description: 'Device used by 3+ different accounts' },
  { name: 'shared_ip',         description: 'IP used by 5+ different accounts' },
  { name: 'graph_ring',        description: 'Account is part of a fraud ring (graph cycle)' },
];

module.exports = { RULE_MANIFEST };
