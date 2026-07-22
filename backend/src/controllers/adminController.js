const { toggleOracle, getStatus } = require('../services/oracleService');

exports.toggleOracle = (req, res) => {
  const { enabled } = req.body;
  if (enabled === undefined) {
    return res.status(400).json({ error: 'enabled flag required' });
  }
  const newStatus = toggleOracle(enabled);
  res.json({ enabled: newStatus });
};

exports.toggleOracle = (req, res) => {
  console.log('🔁 Toggle oracle called, body:', req.body);
  //debug helperr
};

exports.getOracleStatus = (req, res) => {
  res.json(getStatus());
};