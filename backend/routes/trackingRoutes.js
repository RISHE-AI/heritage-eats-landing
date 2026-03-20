const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// POST /api/tracking/track
router.post('/track', trackingController.trackOrder);

module.exports = router;
