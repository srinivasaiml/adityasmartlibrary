const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logActivity = require('../utils/activityLogger');

dotenv.config();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

exports.registerUser = async (req, res) => {
    const { name, username, password, role } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User ID already exists' });
        }
        const user = await User.create({ name, username, password, role: role || 'student' });
        if (user) {
            await logActivity(user._id, user.username, 'USER_REGISTERED', 'User', user._id.toString(), `User ${user.username} registered as ${user.role}.`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role),
                message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} registered successfully.`
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password, isAdminLogin } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials - User not found.' });
        }
        if (isAdminLogin && user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied. Not an admin account.' });
        }
        // Optional: if !isAdminLogin and user.role === 'admin', deny access or handle as per specific rules.

        if (await user.matchPassword(password)) {
            await logActivity(user._id, user.username, 'USER_LOGGED_IN', 'User', user._id.toString(), `User ${user.username} logged in.`);
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials - Password incorrect.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};