const cron = require('node-cron');
const { ethers } = require('ethers');
const { provider, wallet, policyRegistry, premiumPool, triggerOracle } = require('../config/blockchain');
const {
  generateCurrencyDeviation,
  generateRegulatoryBan,
  generateCivilUnrestIndex,
} = require('./dataSimulator');

const ORACLE_ENABLED = process.env.ORACLE_ENABLED === 'true';
const ORACLE_INTERVAL = process.env.ORACLE_INTERVAL || '*/5 * * * *'; // Default 5 minutes
const GAS_LIMIT = parseInt(process.env.ORACLE_GAS_LIMIT) || 500000; // Increased for potential role grant

let isOracleEnabled = ORACLE_ENABLED;
let cronTask = null;
let adminRoleGranted = false;

async function ensureAdminRole() {
  if (adminRoleGranted) return true;
  try {
    const ADMIN_ROLE = await triggerOracle.ADMIN_ROLE();
    const hasRole = await triggerOracle.hasRole(ADMIN_ROLE, wallet.address);
    if (!hasRole) {
      console.log(`[Oracle] Granting ADMIN_ROLE to ${wallet.address}...`);
      const tx = await triggerOracle.grantRole(ADMIN_ROLE, wallet.address, { gasLimit: GAS_LIMIT });
      await tx.wait();
      console.log('[Oracle] ADMIN_ROLE granted.');
    }
    adminRoleGranted = true;
    return true;
  } catch (err) {
    console.error('[Oracle] Failed to grant ADMIN_ROLE:', err.message);
    return false;
  }
}

async function getActivePolicies() {
  const count = await policyRegistry.getPolicyCount();
  const active = [];
  for (let i = 1; i <= Number(count); i++) {
    try {
      const policy = await policyRegistry.getPolicy(i);
      if (policy.active && !policy.paidOut) {
        active.push(policy);
      }
    } catch (e) { /* ignore */ }
  }
  return active;
}

async function executePayout(policyId, investor, amount, triggerType) {
  try {
    //Ensuring ADMIN role is there to stop post trigger errors.
    const hasRole = await ensureAdminRole();
    if (!hasRole) {
      console.error(`[Oracle] Cannot proceed without ADMIN_ROLE for policy ${policyId}`);
      return;
    }

    //Submitting Trigger
    const tx1 = await triggerOracle.submitTrigger(policyId, triggerType, 0, { gasLimit: GAS_LIMIT });
    await tx1.wait();

    //Executing payout
    const tx2 = await premiumPool.executePayout(investor, amount, policyId, triggerType, { gasLimit: GAS_LIMIT });
    await tx2.wait();

    console.log(`[Oracle] Payout successful for policy ${policyId}`);
  } catch (err) {
    console.error(`[Oracle] Payout failed for policy ${policyId}:`, err.message);
    if (err.receipt) {
      console.error('Receipt status:', err.receipt.status);
    }
  }
}

async function checkTriggers() {
  const policies = await getActivePolicies();
  if (policies.length === 0) return;

  const currencyDev = generateCurrencyDeviation();
  const regulatoryBan = generateRegulatoryBan();
  const unrestIndex = generateCivilUnrestIndex();

  console.log(`[Oracle] Deviation: ${currencyDev.toFixed(2)}% | Ban: ${regulatoryBan} | Unrest: ${unrestIndex.toFixed(2)}`);

  for (const policy of policies) {
    const thresholdBps = Number(policy.triggerThresholdBps);
    const thresholdPercent = thresholdBps / 100;
    let shouldPayout = false;
    const triggerType = policy.triggerType;

    if (triggerType === 'CURRENCY_DEV' && currencyDev > thresholdPercent) {
      shouldPayout = true;
    } else if (triggerType === 'REGULATORY_BAN' && regulatoryBan) {
      shouldPayout = true;
    } else if (triggerType === 'CIVIL_UNREST' && unrestIndex > thresholdPercent) {
      shouldPayout = true;
    }

    if (shouldPayout) {
      await executePayout(policy.id, policy.investor, policy.coverageAmount, triggerType);
    }
  }
}

function runOracle() {
  if (!isOracleEnabled) {
    console.log('[Oracle] Disabled.');
    return;
  }
  console.log('[Oracle] Job started.');
  checkTriggers().catch(err => console.error('[Oracle] Job error:', err.message));
}

// ... startOracle, stopOracle, toggleOracle, getStatus remain unchanged