const express = require('express');

const router = express.Router();
module.exports = router;

router.use('/api', require('./api/api'));
router.use('/', require('./public/public'));
