const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');

// GET /api/about/info
router.get('/info', aboutController.getAboutInfo);

module.exports = router;
