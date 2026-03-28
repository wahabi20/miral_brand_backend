const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', ctrl.create);
router.get('/stats', auth, ctrl.getStats);
router.get('/', auth, ctrl.getAll);
router.patch('/:id/status', auth, ctrl.updateStatus);

module.exports = router;
