const mongoose = require('mongoose');

const SeminarRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    capacity: { type: Number, default: 40 },
    icon: { type: String, default: 'fa-chalkboard-teacher' },
    status: {
        type: String,
        enum: ['available', 'reserved'],
        default: 'available',
    },
    reservationDetails: {
        workshopName: { type: String },
        departmentName: { type: String },
        date: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        bookedBy: { type: String },
        bookedAt: { type: Date },
    }
}, { 
    timestamps: true,
    collection: 'seminarrooms' // Explicitly set the collection name
});

module.exports = mongoose.model('SeminarRoom', SeminarRoomSchema);