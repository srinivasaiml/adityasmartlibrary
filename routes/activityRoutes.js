const express = require('express');
const router = express.Router();
const { getAllActivities, getMyActivities } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAllActivities);
router.route('/my').get(protect, getMyActivities);

module.exports = router;