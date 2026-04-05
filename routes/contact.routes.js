const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', ctrl.send);
router.get('/', auth, ctrl.getAll);

module.exports = router;
