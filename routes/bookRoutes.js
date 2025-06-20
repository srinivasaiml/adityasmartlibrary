const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllBooks).post(protect, admin, addBook); // All logged-in can view, admin adds
router.route('/:id').get(protect, getBookById).put(protect, admin, updateBook).delete(protect, admin, deleteBook);

module.exports = router;