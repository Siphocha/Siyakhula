const { toggleOracle, getOracleStatus } = require('../controllers/adminController');
//getting imports.

router.post('/oracle/toggle', authenticate, authorize('admin'), toggleOracle);
router.get('/oracle/status', authenticate, authorize('admin'), getOracleStatus);