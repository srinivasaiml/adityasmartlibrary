const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Seat = require('../models/Seat');
const Book = require('../models/Book');
const User = require('../models/User');
const SeminarRoom = require('../models/SeminarRoom');

// This makes sure it finds the .env file in the project root
dotenv.config({ path: __dirname + '/../../.env' }); 

// --- Full Data to be Seeded ---

const seatsToSeed = [
    // Study Carrels (SC) - Aim for around 20
    { seatId: 'SC-01', name: 'Study Carrel 01', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-02', name: 'Study Carrel 02', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-03', name: 'Study Carrel 03', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-04', name: 'Study Carrel 04', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-05', name: 'Study Carrel 05', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-06', name: 'Study Carrel 06', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-07', name: 'Study Carrel 07', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-08', name: 'Study Carrel 08', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-09', name: 'Study Carrel 09', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-10', name: 'Study Carrel 10', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-11', name: 'Study Carrel 11', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-12', name: 'Study Carrel 12', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-13', name: 'Study Carrel 13', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-14', name: 'Study Carrel 14', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-15', name: 'Study Carrel 15', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-16', name: 'Study Carrel 16', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-17', name: 'Study Carrel 17', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-18', name: 'Study Carrel 18', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-19', name: 'Study Carrel 19', category: 'study-carrels', icon: 'fas fa-person-booth' },
    { seatId: 'SC-20', name: 'Study Carrel 20', category: 'study-carrels', icon: 'fas fa-person-booth' },

    // E-Resource (ER) - Aim for around 15
    { seatId: 'ER-01', name: 'E-Resource PC 01', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-02', name: 'E-Resource PC 02', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-03', name: 'E-Resource PC 03', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-04', name: 'E-Resource PC 04', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-05', name: 'E-Resource PC 05', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-06', name: 'E-Resource PC 06', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-07', name: 'E-Resource PC 07', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-08', name: 'E-Resource PC 08', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-09', name: 'E-Resource PC 09', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-10', name: 'E-Resource PC 10', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-11', name: 'E-Resource PC 11', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-12', name: 'E-Resource PC 12', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-13', name: 'E-Resource PC 13', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-14', name: 'E-Resource PC 14', category: 'e-resource', icon: 'fas fa-desktop' },
    { seatId: 'ER-15', name: 'E-Resource PC 15', category: 'e-resource', icon: 'fas fa-desktop' },

    // Reading Room (RR) - Aim for around 15
    { seatId: 'RR-01', name: 'Reading Seat 01', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-02', name: 'Reading Seat 02', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-03', name: 'Reading Seat 03', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-04', name: 'Reading Seat 04', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-05', name: 'Reading Seat 05', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-06', name: 'Reading Seat 06', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-07', name: 'Reading Seat 07', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-08', name: 'Reading Seat 08', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-09', name: 'Reading Seat 09', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-10', name: 'Reading Seat 10', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-11', name: 'Reading Seat 11', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-12', name: 'Reading Seat 12', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-13', name: 'Reading Seat 13', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-14', name: 'Reading Seat 14', category: 'reading-room', icon: 'fas fa-book-reader' },
    { seatId: 'RR-15', name: 'Reading Seat 15', category: 'reading-room', icon: 'fas fa-book-reader' },

    // Group Discussion Rooms (GD) - Aim for 20 seats (e.g., 5 rooms of 4 seats each)
    // Room GD1
    { seatId: 'GD1-S1', name: 'GD Room 1 - Seat 1', category: 'gd-rooms', roomId: 'GD1', icon: 'fas fa-users' },
    { seatId: 'GD1-S2', name: 'GD Room 1 - Seat 2', category: 'gd-rooms', roomId: 'GD1', icon: 'fas fa-users' },
    { seatId: 'GD1-S3', name: 'GD Room 1 - Seat 3', category: 'gd-rooms', roomId: 'GD1', icon: 'fas fa-users' },
    { seatId: 'GD1-S4', name: 'GD Room 1 - Seat 4', category: 'gd-rooms', roomId: 'GD1', icon: 'fas fa-users' },
    // Room GD2
    { seatId: 'GD2-S1', name: 'GD Room 2 - Seat 1', category: 'gd-rooms', roomId: 'GD2', icon: 'fas fa-users' },
    { seatId: 'GD2-S2', name: 'GD Room 2 - Seat 2', category: 'gd-rooms', roomId: 'GD2', icon: 'fas fa-users' },
    { seatId: 'GD2-S3', name: 'GD Room 2 - Seat 3', category: 'gd-rooms', roomId: 'GD2', icon: 'fas fa-users' },
    { seatId: 'GD2-S4', name: 'GD Room 2 - Seat 4', category: 'gd-rooms', roomId: 'GD2', icon: 'fas fa-users' },
    // Room GD3
    { seatId: 'GD3-S1', name: 'GD Room 3 - Seat 1', category: 'gd-rooms', roomId: 'GD3', icon: 'fas fa-users' },
    { seatId: 'GD3-S2', name: 'GD Room 3 - Seat 2', category: 'gd-rooms', roomId: 'GD3', icon: 'fas fa-users' },
    { seatId: 'GD3-S3', name: 'GD Room 3 - Seat 3', category: 'gd-rooms', roomId: 'GD3', icon: 'fas fa-users' },
    { seatId: 'GD3-S4', name: 'GD Room 3 - Seat 4', category: 'gd-rooms', roomId: 'GD3', icon: 'fas fa-users' },
    // Room GD4
    { seatId: 'GD4-S1', name: 'GD Room 4 - Seat 1', category: 'gd-rooms', roomId: 'GD4', icon: 'fas fa-users' },
    { seatId: 'GD4-S2', name: 'GD Room 4 - Seat 2', category: 'gd-rooms', roomId: 'GD4', icon: 'fas fa-users' },
    { seatId: 'GD4-S3', name: 'GD Room 4 - Seat 3', category: 'gd-rooms', roomId: 'GD4', icon: 'fas fa-users' },
    { seatId: 'GD4-S4', name: 'GD Room 4 - Seat 4', category: 'gd-rooms', roomId: 'GD4', icon: 'fas fa-users' },
    // Room GD5
    { seatId: 'GD5-S1', name: 'GD Room 5 - Seat 1', category: 'gd-rooms', roomId: 'GD5', icon: 'fas fa-users' },
    { seatId: 'GD5-S2', name: 'GD Room 5 - Seat 2', category: 'gd-rooms', roomId: 'GD5', icon: 'fas fa-users' },
    { seatId: 'GD5-S3', name: 'GD Room 5 - Seat 3', category: 'gd-rooms', roomId: 'GD5', icon: 'fas fa-users' },
    { seatId: 'GD5-S4', name: 'GD Room 5 - Seat 4', category: 'gd-rooms', roomId: 'GD5', icon: 'fas fa-users' },
];

const booksToSeed = [
    // Original Books
    { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', isbn: '978-0345391803', rack: 'SF-A1', status: 'available' },
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '978-0132350884', rack: 'PG-M1', status: 'available' },
    { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0062316097', rack: 'HI-H1', status: 'checked-out' },
    { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', rack: 'SH-C1', status: 'available' },

    // --- Added Books ---

    // Programming & Tech
    { title: 'The Pragmatic Programmer: From Journeyman to Master', author: 'Andrew Hunt', isbn: '978-0201616224', rack: 'PG-H2', status: 'available' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', rack: 'PG-K1', status: 'checked-out' },
    
    // Science Fiction & Fantasy
    { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441013593', rack: 'SF-H1', status: 'checked-out' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0345339683', rack: 'FA-T1', status: 'available' },
    { title: 'A Game of Thrones', author: 'George R.R. Martin', isbn: '978-0553593716', rack: 'FA-M1', status: 'available' },

    // Classic & Dystopian Literature
    { title: '1984', author: 'George Orwell', isbn: '978-0451524935', rack: 'DY-O1', status: 'available' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', rack: 'CL-L1', status: 'checked-out' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', rack: 'CL-F1', status: 'available' },
    { title: 'Brave New World', author: 'Aldous Huxley', isbn: '978-0060850524', rack: 'DY-H1', status: 'available' },
    
    // Non-Fiction & Psychology
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0374533557', rack: 'PS-K1', status: 'available' },
    { title: 'Educated: A Memoir', author: 'Tara Westover', isbn: '978-0399590504', rack: 'BI-W1', status: 'checked-out' },
    { title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0307887894', rack: 'BU-R1', status: 'available' },
];

const seminarRoomsToSeed = [
    { 
        roomId: 'SR1', 
        name: 'Seminar Room 1', 
        status: 'available', 
        capacity: 50, 
        icon: 'fa-landmark' 
    },
    { 
        roomId: 'SR2', 
        name: 'Seminar Room 2', 
        status: 'available', 
        capacity: 30, 
        icon: 'fa-building-columns' 
    },
    {
        roomId: 'SR3',
        name: 'Seminar Room 3',
        status: 'reserved',
        capacity: 40,
        icon: 'fa-school',
        reservationDetails: {
            workshopName: "Default Workshop: AI in Education",
            departmentName: "Computer Science Dept.",
            date: "2024-09-20",
            startTime: "10:00",
            endTime: "12:30",
            bookedBy: "System (Seeder)",
            bookedAt: new Date()
        }
    }
];

const adminUserToSeed = {
    name: 'Default Admin',
    username: 'admin',
    password: 'password',
    role: 'admin'
};

const seedDatabase = async () => {
    await connectDB();
    try {
        console.log('Clearing existing data...');
        await Seat.deleteMany();
        await Book.deleteMany();
        await SeminarRoom.deleteMany();
        await User.deleteMany({ role: 'admin', username: 'admin' });

        console.log('Seeding Seats...');
        await Seat.insertMany(seatsToSeed);
        console.log('Seats seeded.');

        console.log('Seeding Books...');
        await Book.insertMany(booksToSeed);
        console.log('Books seeded.');
        
        console.log('Seeding Seminar Rooms...');
        await SeminarRoom.insertMany(seminarRoomsToSeed);
        console.log('Seminar Rooms seeded.');

        const existingAdmin = await User.findOne({ username: adminUserToSeed.username });
        if (!existingAdmin) {
            console.log('Seeding Default Admin User...');
            await User.create(adminUserToSeed);
            console.log('Default Admin User seeded.');
        } else {
            console.log('Default Admin User already exists.');
        }

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedDatabase();