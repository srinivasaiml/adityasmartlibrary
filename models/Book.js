const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, sparse: true },
    rack: { type: String, required: true },
    status: {
        type: String,
        enum: ['available', 'checked-out', 'reserved', 'maintenance'],
        default: 'available',
    },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reservationExpiry: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

BookSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Book', BookSchema);