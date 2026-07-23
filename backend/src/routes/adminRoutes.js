const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { toggleOracle, getOracleStatus } = require('../controllers/adminController');

//please help debug!
router.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

//router.post('/oracle/toggle', authenticate, authorize('admin'), toggleOracle);
//router.get('/oracle/status', authenticate, authorize('admin'), getOracleStatus);

module.exports = router;