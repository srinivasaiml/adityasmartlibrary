const express = require('express');
const router = express.Router();
const {
    getAllSeats,
    updateSeatStatusByAdmin,
    reserveSeat,
    cancelReservation,
    occupySeatByQR,
    vacateSeatByQR,
} = require('../controllers/seatController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllSeats);
router.route('/:seatId/status').put(protect, admin, updateSeatStatusByAdmin);
router.route('/:seatId/reserve').post(protect, reserveSeat);
router.route('/:seatId/cancel-reservation').post(protect, cancelReservation);

// QR based actions (student needs to be 'protect'ed)
router.route('/qr/occupy').post(protect, occupySeatByQR);
router.route('/qr/vacate').post(protect, vacateSeatByQR);


module.exports = router;