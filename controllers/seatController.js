const Seat = require('../models/Seat');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

const RESERVATION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const clearExpiredReservations = async () => {
    const now = new Date();
    try {
        const expiredSeats = await Seat.find({
            status: 'pending-reservation',
            reservationEndTime: { $lt: now },
        });
        for (const seat of expiredSeats) {
            const reservedByUsername = seat.reservedBy ? (await User.findById(seat.reservedBy))?.username : 'Unknown';
            seat.status = 'available';
            seat.reservedBy = null;
            seat.reservationEndTime = null;
            await seat.save();
            await logActivity(null, 'System', 'RESERVATION_EXPIRED', 'Seat', seat.seatId, `Reservation for seat ${seat.name} by ${reservedByUsername} expired.`);
        }
    } catch (error) {
        console.error("Error clearing expired reservations:", error);
    }
};

exports.getAllSeats = async (req, res) => {
    try {
        await clearExpiredReservations();
        const seats = await Seat.find({})
            .populate('occupiedBy', 'username name')
            .populate('reservedBy', 'username name')
            .sort({ category: 1, name: 1 });
        res.json(seats);
    } catch (error) {
        console.error('Get All Seats Error:', error);
        res.status(500).json({ message: 'Server Error fetching seats.' });
    }
};

exports.updateSeatStatusByAdmin = async (req, res) => {
    const { status, occupiedByUsername } = req.body;
    const adminUser = req.user;
    try {
        const seat = await Seat.findOne({ seatId: req.params.seatId });
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });

        const oldStatus = seat.status;
        const oldOccupant = seat.occupiedByUsername || (seat.reservedBy ? 'Reserved' : 'None');

        seat.status = status;
        if (status === 'available') {
            seat.occupiedBy = null; seat.occupiedByUsername = null;
            seat.reservedBy = null; seat.reservationEndTime = null;
        } else if (status === 'occupied') {
            seat.occupiedByUsername = occupiedByUsername || 'Admin Assigned';
            if (occupiedByUsername) {
                const studentUser = await User.findOne({ username: occupiedByUsername });
                seat.occupiedBy = studentUser ? studentUser._id : null;
            } else {
                seat.occupiedBy = null;
            }
            seat.reservedBy = null; seat.reservationEndTime = null;
        } else if (status === 'maintenance') {
            seat.occupiedBy = null; seat.occupiedByUsername = null;
            seat.reservedBy = null; seat.reservationEndTime = null;
        } else {
            return res.status(400).json({ message: 'Invalid status for admin update.' });
        }
        const updatedSeat = await seat.save();
        await logActivity(adminUser._id, adminUser.username, 'ADMIN_SEAT_STATUS_UPDATE', 'Seat', seat.seatId, `Seat ${seat.name} status: ${oldStatus} (by ${oldOccupant}) -> ${status} (by ${seat.occupiedByUsername || 'N/A'}).`);
        res.json(updatedSeat);
    } catch (error) {
        console.error('Admin Update Seat Status Error:', error);
        res.status(500).json({ message: 'Server Error updating seat status.' });
    }
};

exports.reserveSeat = async (req, res) => {
    const studentUser = req.user;
    if (studentUser.role !== 'student') return res.status(403).json({ message: 'Only students can reserve seats.' });
    try {
        await clearExpiredReservations();
        const existingInteraction = await Seat.findOne({
            $or: [
                { reservedBy: studentUser._id, status: 'pending-reservation', reservationEndTime: { $gt: new Date() } },
                { occupiedBy: studentUser._id, status: 'in-use' }
            ]
        });
        if (existingInteraction) return res.status(400).json({ message: `You already have an active seat interaction (${existingInteraction.name} - ${existingInteraction.status}). Please cancel or vacate first.` });

        const seat = await Seat.findOne({ seatId: req.params.seatId });
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        if (seat.status !== 'available') return res.status(400).json({ message: `Seat ${seat.name} is not available (status: ${seat.status}).` });

        seat.status = 'pending-reservation';
        seat.reservedBy = studentUser._id;
        seat.reservationEndTime = new Date(Date.now() + RESERVATION_DURATION_MS);
        const updatedSeat = await seat.save();
        await logActivity(studentUser._id, studentUser.username, 'SEAT_RESERVED', 'Seat', seat.seatId, `Reserved seat ${seat.name} until ${seat.reservationEndTime.toLocaleTimeString()}.`);
        
        const populatedSeat = await Seat.findById(updatedSeat._id).populate('reservedBy', 'username name'); // For frontend
        res.json(populatedSeat);
    } catch (error) {
        console.error('Reserve Seat Error:', error);
        res.status(500).json({ message: 'Server Error reserving seat.' });
    }
};

exports.cancelReservation = async (req, res) => {
    const studentUser = req.user;
    if (studentUser.role !== 'student') return res.status(403).json({ message: 'Only students can cancel reservations.' });
    try {
        const seat = await Seat.findOne({ seatId: req.params.seatId });
        if (!seat) return res.status(404).json({ message: 'Seat not found.' });
        if (seat.status !== 'pending-reservation' || !seat.reservedBy || seat.reservedBy.toString() !== studentUser._id.toString()) {
            return res.status(400).json({ message: 'This seat is not reserved by you or is not pending reservation.' });
        }
        seat.status = 'available';
        seat.reservedBy = null;
        seat.reservationEndTime = null;
        const updatedSeat = await seat.save();
        await logActivity(studentUser._id, studentUser.username, 'RESERVATION_CANCELLED', 'Seat', seat.seatId, `Cancelled reservation for seat ${seat.name}.`);
        res.json(updatedSeat);
    } catch (error) {
        console.error('Cancel Reservation Error:', error);
        res.status(500).json({ message: 'Server Error cancelling reservation.' });
    }
};

// --- Placeholder for future QR-based actions ---
exports.occupySeatByQR = async (req, res) => {
    const studentUser = req.user;
    const { seatIdFromQR } = req.body; // Assuming QR code contains the seatId

    try {
        await clearExpiredReservations();
        const seat = await Seat.findOne({ seatId: seatIdFromQR });
        if (!seat) return res.status(404).json({ message: 'Seat from QR not found.' });

        // Case 1: Student has this seat reserved
        if (seat.status === 'pending-reservation' && seat.reservedBy && seat.reservedBy.toString() === studentUser._id.toString()) {
            seat.status = 'in-use';
            seat.occupiedBy = studentUser._id;
            seat.occupiedByUsername = studentUser.username;
            seat.reservedBy = null; // Clear reservation fields
            seat.reservationEndTime = null;
            const updatedSeat = await seat.save();
            await logActivity(studentUser._id, studentUser.username, 'SEAT_OCCUPIED_VIA_QR_FROM_RESERVATION', 'Seat', seat.seatId, `Occupied reserved seat ${seat.name} via QR.`);
            return res.json({ seat: updatedSeat, message: `Seat ${seat.name} occupied successfully.` });
        }
        // Case 2: Seat is available, and student has no other active seat
        else if (seat.status === 'available') {
            const existingInteraction = await Seat.findOne({ $or: [ { reservedBy: studentUser._id, status: 'pending-reservation'}, { occupiedBy: studentUser._id, status: 'in-use'} ]});
            if (existingInteraction) return res.status(400).json({ message: 'You already have an active seat. Vacate or cancel first.'});
            
            seat.status = 'in-use';
            seat.occupiedBy = studentUser._id;
            seat.occupiedByUsername = studentUser.username;
            const updatedSeat = await seat.save();
            await logActivity(studentUser._id, studentUser.username, 'SEAT_OCCUPIED_VIA_QR_DIRECTLY', 'Seat', seat.seatId, `Occupied available seat ${seat.name} via QR.`);
            return res.json({ seat: updatedSeat, message: `Seat ${seat.name} occupied successfully.` });
        }
        // Case 3: Seat is not available or not reservable by this student
        else {
            return res.status(400).json({ message: `Seat ${seat.name} cannot be occupied (Status: ${seat.status}).` });
        }
    } catch (error) {
        console.error("Occupy Seat by QR Error:", error);
        res.status(500).json({ message: "Server error occupying seat." });
    }
};

exports.vacateSeatByQR = async (req, res) => {
     const studentUser = req.user;
    const { seatIdFromQR } = req.body;

    try {
        const seat = await Seat.findOne({ seatId: seatIdFromQR });
        if (!seat) return res.status(404).json({ message: 'Seat from QR not found.' });

        if (seat.status === 'in-use' && seat.occupiedBy && seat.occupiedBy.toString() === studentUser._id.toString()) {
            seat.status = 'available';
            seat.occupiedBy = null;
            seat.occupiedByUsername = null;
            const updatedSeat = await seat.save();
            await logActivity(studentUser._id, studentUser.username, 'SEAT_VACATED_VIA_QR', 'Seat', seat.seatId, `Vacated seat ${seat.name} via QR.`);
            return res.json({ seat: updatedSeat, message: `Seat ${seat.name} vacated successfully.` });
        } else {
            return res.status(400).json({ message: `Seat ${seat.name} is not currently occupied by you.` });
        }
    } catch (error) {
        console.error("Vacate Seat by QR Error:", error);
        res.status(500).json({ message: "Server error vacating seat." });
    }
};