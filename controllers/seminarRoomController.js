// controllers/seminarRoomController.js

const mongoose = require('mongoose');
const SeminarRoom = require('../models/SeminarRoom');
const logActivity = require('../utils/activityLogger');

exports.getAllSeminarRooms = async (req, res) => {
    try {
        // --- START OF DEFINITIVE DIAGNOSTIC ---

        console.log("========================================");
        console.log("[Controller] Starting 'getAllSeminarRooms' diagnostic...");

        // 1. Log the database Mongoose is connected to.
        const dbName = mongoose.connection.name;
        console.log(`[Diagnostic] Mongoose is connected to database: >>> ${dbName} <<<`);

        // 2. Perform the standard Mongoose query.
        const mongooseRooms = await SeminarRoom.find({}).sort({ name: 1 });
        console.log(`[Diagnostic] The Mongoose Model 'SeminarRoom.find()' returned: ${mongooseRooms.length} documents.`);

        // 3. Perform a RAW query, bypassing the Mongoose model completely.
        const rawCollection = mongoose.connection.db.collection('seminarrooms');
        const rawRooms = await rawCollection.find({}).toArray();
      
        // --- END OF DIAGNOSTIC ---

        // We will send the result of the RAW query to the frontend to ensure it works.
        res.json(rawRooms);

    } catch (error) {
        console.error('[Controller] Get Seminar Rooms Error:', error);
        res.status(500).json({ message: 'Server Error fetching seminar rooms.' });
    }
};


// --- The rest of your controller functions remain the same ---

exports.reserveSeminarRoom = async (req, res) => {
    const { workshopName, departmentName, date, startTime, endTime } = req.body;
    const adminUser = req.user;
    try {
        const room = await SeminarRoom.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ message: 'Seminar room not found.' });
        if (room.status === 'reserved') return res.status(400).json({ message: 'This room is already reserved.' });
        room.status = 'reserved';
        room.reservationDetails = { workshopName, departmentName, date, startTime, endTime, bookedBy: adminUser.name || adminUser.username, bookedAt: new Date() };
        const updatedRoom = await room.save();
        await logActivity(adminUser._id, adminUser.username, 'SEMINAR_ROOM_BOOKED', 'SeminarRoom', room.roomId, `Booked room '${room.name}' for workshop '${workshopName}'`);
        res.json({ success: true, room: updatedRoom });
    } catch (error) {
        console.error('Reserve Seminar Room Error:', error);
        res.status(500).json({ message: 'Server Error reserving room.' });
    }
};

exports.cancelSeminarReservation = async (req, res) => {
    const adminUser = req.user;
    try {
        const room = await SeminarRoom.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ message: 'Seminar room not found.' });
        if (room.status === 'available') return res.status(400).json({ message: 'This room is not currently reserved.' });
        const details = room.reservationDetails;
        room.status = 'available';
        room.reservationDetails = undefined;
        const updatedRoom = await room.save();
        await logActivity(adminUser._id, adminUser.username, 'SEMINAR_RESERVATION_CANCELLED', 'SeminarRoom', room.roomId, `Cancelled reservation for room '${room.name}' (Workshop: ${details.workshopName})`);
        res.json({ success: true, room: updatedRoom });
    } catch (error) {
        console.error('Cancel Seminar Reservation Error:', error);
        res.status(500).json({ message: 'Server Error cancelling reservation.' });
    }
};