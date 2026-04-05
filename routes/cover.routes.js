const router = require('express').Router();
const ctrl = require('../controllers/cover.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public
router.get('/', ctrl.getAll);

// Admin
router.get('/admin', auth, ctrl.getAllAdmin);
router.post('/', auth, upload.single('image'), ctrl.create);
router.put('/:id', auth, upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.delete);

module.exports = router;
