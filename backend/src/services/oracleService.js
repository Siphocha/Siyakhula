const cron = require('node-cron');
const { ethers } = require('ethers');
const { provider, wallet, policyRegistry, premiumPool, triggerOracle } = require('../config/blockchain');
const {
  generateCurrencyDeviation,
  generateRegulatoryBan,
  generateCivilUnrestIndex,
} = require('./dataSimulator');

const ORACLE_ENABLED = process.env.ORACLE_ENABLED === 'true';
const ORACLE_INTERVAL = process.env.ORACLE_INTERVAL || '*/5 * * * *';
const GAS_LIMIT = parseInt(process.env.ORACLE_GAS_LIMIT) || 300000;

let isOracleEnabled = ORACLE_ENABLED;
let cronTask = null;

async function getActivePolicies() {
  const count = await policyRegistry.getPolicyCount();
  const active = [];
  for (let i = 1; i <= Number(count); i++) {
    try {
      const policy = await policyRegistry.getPolicy(i);
      if (policy.active && !policy.paidOut) {
        active.push(policy);
      }
    } catch (e) {
      // skip
    }
  }
  return active;
}

async function executePayout(policyId, investor, amount, triggerType) {
  try {
    const tx1 = await triggerOracle.submitTrigger(policyId, triggerType, 0, { gasLimit: GAS_LIMIT });
    await tx1.wait();
    const tx2 = await premiumPool.executePayout(investor, amount, policyId, triggerType, { gasLimit: GAS_LIMIT });
    await tx2.wait();
    console.log(`Payout triggered for policy ${policyId} (${triggerType}) to ${investor} for ${ethers.formatUnits(amount, 18)} RWFC`);
  } catch (err) {
    console.error(`Payout failed for policy ${policyId}:`, err.message);
  }
}

async function checkTriggers() {
  const policies = await getActivePolicies();
  if (policies.length === 0) return;

  const currencyDev = generateCurrencyDeviation();
  const regulatoryBan = generateRegulatoryBan();
  const unrestIndex = generateCivilUnrestIndex();

  console.log(`[Oracle] Currency deviation: ${currencyDev.toFixed(2)}% | Regulatory ban: ${regulatoryBan} | Unrest index: ${unrestIndex.toFixed(2)}`);

  for (const policy of policies) {
    const thresholdBps = Number(policy.triggerThresholdBps);
    const thresholdPercent = thresholdBps / 100;

    let shouldPayout = false;
    const triggerType = policy.triggerType;

    if (triggerType === 'CURRENCY_DEV' && currencyDev > thresholdPercent) {
      shouldPayout = true;
    } else if (triggerType === 'REGULATORY_BAN' && regulatoryBan === true) {
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
    console.log('[Oracle] Disabled, skipping run.');
    return;
  }
  console.log('[Oracle] Job started.');
  checkTriggers().catch(err => console.error('[Oracle] Job error:', err.message));
}

function startOracle() {
  if (cronTask) return;
  if (!ORACLE_ENABLED) {
    console.log('[Oracle] Disabled by environment.');
    return;
  }
  cronTask = cron.schedule(ORACLE_INTERVAL, runOracle);
  console.log(`[Oracle] Started with interval ${ORACLE_INTERVAL}`);
  runOracle();
}

function stopOracle() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[Oracle] Stopped.');
  }
}

function toggleOracle(enable) {
  isOracleEnabled = enable;
  if (enable) {
    if (!cronTask) startOracle();
  } else {
    stopOracle();
  }
  return isOracleEnabled;
}

function getStatus() {
  return { enabled: isOracleEnabled, running: !!cronTask };
}

module.exports = {
  startOracle,
  stopOracle,
  toggleOracle,
  getStatus,
};