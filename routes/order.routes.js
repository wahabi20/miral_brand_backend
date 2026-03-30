const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', ctrl.create);
router.get('/stats', auth, ctrl.getStats);
router.get('/', auth, ctrl.getAll);
router.patch('/:id/status',  auth, ctrl.updateStatus);
router.put('/:id',           auth, ctrl.update);
router.delete('/:id',        auth, ctrl.softDelete);
router.patch('/:id/restore', auth, ctrl.restore);

module.exports = router;
