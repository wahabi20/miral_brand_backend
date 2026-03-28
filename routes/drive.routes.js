const router = require('express').Router();
const ctrl = require('../controllers/drive.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/upload', auth, upload.single('file'), ctrl.upload);
router.delete('/:fileId', auth, ctrl.delete);

module.exports = router;
