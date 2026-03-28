const router = require('express').Router();
const ctrl = require('../controllers/category.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', ctrl.getAll);
router.post('/', auth, upload.single('categoryImage'), ctrl.create);
router.delete('/:id', auth, ctrl.delete);

module.exports = router;
