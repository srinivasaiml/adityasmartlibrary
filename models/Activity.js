const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    action: { type: String, required: true },
    resourceType: { type: String, enum: ['User', 'Seat', 'Book', 'System', 'SeminarRoom'] },
    resourceId: { type: String },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);