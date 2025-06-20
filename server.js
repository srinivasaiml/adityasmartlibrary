const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const seatRoutes = require('./routes/seatRoutes');
const activityRoutes = require('./routes/activityRoutes');
const seminarRoomRoutes = require('./routes/seminarRoomRoutes');
dotenv.config();
connectDB();

const app = express();

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

app.get('/api', (req, res) => { // Basic API health check
    res.send('Smart Library API is running...');
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/seminar-rooms', seminarRoomRoutes);
// Basic Error Handling Middleware (optional, can be more sophisticated)
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(500).send('Something broke on the server!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0',() => console.log(`Server running on http://localhost:${PORT}`));