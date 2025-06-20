const Activity = require('../models/Activity');

exports.getAllActivities = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    try {
        const totalActivities = await Activity.countDocuments();
        const activities = await Activity.find({})
            .populate('user', 'username name role')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            activities,
            page,
            pages: Math.ceil(totalActivities / limit),
            totalActivities,
        });
    } catch (error) {
        console.error('Get All Activities Error:', error);
        res.status(500).json({ message: 'Server Error fetching activities.' });
    }
};

exports.getMyActivities = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    try {
        const activities = await Activity.find({ user: req.user._id })
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(activities); // Frontend expects direct array for student's log
    } catch (error) {
         console.error('Get My Activities Error:', error);
        res.status(500).json({ message: 'Server Error fetching your activities.' });
    }
};

