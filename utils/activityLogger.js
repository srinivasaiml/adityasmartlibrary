const Activity = require('../models/Activity');

const logActivity = async (userId, username, action, resourceType, resourceId, details) => {
    try {
        await Activity.create({
            user: userId || null, // Allow null for system actions
            username: username || 'System',
            action,
            resourceType,
            resourceId,
            details,
        });
        console.log(`Activity Logged: User ${username || 'System'} - ${action} - ${details}`);
    } catch (error) {
        console.error('Error logging activity:', error.message);
    }
};

module.exports = logActivity;