const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    seatId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['study-carrels', 'e-resource', 'reading-room', 'gd-rooms'],
    },
    roomId: { type: String }, // For 'gd-rooms'
    icon: { type: String, default: 'fas fa-square' },
    status: {
        type: String,
        enum: ['available', 'occupied', 'pending-reservation', 'in-use', 'maintenance'],
        default: 'available',
    },
    occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    occupiedByUsername: { type: String, default: null },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reservationEndTime: { type: Date, default: null },
    lastStatusChange: { type: Date, default: Date.now },
});

SeatSchema.pre('save', function(next) {
    this.lastStatusChange = Date.now();
    next();
});

module.exports = mongoose.model('Seat', SeatSchema);