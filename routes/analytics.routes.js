const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/analytics.controller');

router.post('/visit', ctrl.recordVisit);
router.get('/stats', auth, ctrl.getStats);

module.exports = router;
