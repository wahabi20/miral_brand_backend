const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', ctrl.getAll);
router.get('/categories', ctrl.getCategories);
router.get('/:id', ctrl.getById);

router.post('/', auth, upload.array('images', 10), ctrl.create);
router.put('/:id', auth, upload.array('images', 10), ctrl.update);
router.delete('/:id', auth, ctrl.delete);

module.exports = router;
