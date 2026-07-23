const { toggleOracle: toggleOracleService, getStatus } = require('../services/oracleService');

exports.toggleOracle = (req, res) => {
  console.log('🔁 Toggle oracle called, body:', req.body);
  const { enabled } = req.body;
  if (enabled === undefined) {
    return res.status(400).json({ error: 'enabled flag required' });
  }
  const newStatus = toggleOracleService(enabled);
  res.json({ enabled: newStatus });
};

exports.getOracleStatus = (req, res) => {
  res.json(getStatus());
};