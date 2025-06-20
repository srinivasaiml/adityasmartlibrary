const express = require('express');
const router = express.Router();
const {
    getAllSeminarRooms,
    reserveSeminarRoom,
    cancelSeminarReservation,
} = require('../controllers/seminarRoomController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in this file are protected for admin users
router.use(protect, admin);

router.route('/').get(getAllSeminarRooms);
router.route('/:roomId/reserve').post(reserveSeminarRoom);
router.route('/:roomId/cancel').post(cancelSeminarReservation);

module.exports = router;