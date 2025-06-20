const Book = require('../models/Book');
const logActivity = require('../utils/activityLogger');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({})
            .populate('checkedOutBy', 'username name')
            .populate('reservedBy', 'username name')
            .sort({ title: 1 });
        res.json(books);
    } catch (error) {
        console.error('Get All Books Error:', error);
        res.status(500).json({ message: 'Server Error fetching books.' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('checkedOutBy', 'username name').populate('reservedBy', 'username name');
        if (!book) return res.status(404).json({ message: 'Book not found.' });
        res.json(book);
    } catch (error) {
        console.error('Get Book By ID Error:', error);
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Book not found (invalid ID format).' });
        res.status(500).json({ message: 'Server Error fetching book.' });
    }
};

exports.addBook = async (req, res) => {
    const { title, author, isbn, rack, status, quantity = 1 } = req.body;
    const adminUser = req.user;
    try {
        if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be at least 1.' });
        
        const booksAdded = [];
        for (let i = 0; i < quantity; i++) {
            // For multiple copies, ISBN needs to be unique or handled if not strictly unique per physical copy.
            // This example makes ISBN unique per copy if quantity > 1 and ISBN is provided.
            let uniqueIsbn = isbn;
            if (quantity > 1 && isbn) {
                uniqueIsbn = `${isbn}-copy${Date.now()}${i}`; // Simple uniqueness for demo
            } else if (quantity === 1 && isbn) {
                 const existingBookWithISBN = await Book.findOne({ isbn: uniqueIsbn });
                 if (existingBookWithISBN) {
                     return res.status(400).json({ message: `Book with ISBN ${uniqueIsbn} already exists.` });
                 }
            }

            const newBook = new Book({ title, author, isbn: uniqueIsbn, rack, status: status || 'available' });
            const savedBook = await newBook.save();
            booksAdded.push(savedBook);
            await logActivity(adminUser._id, adminUser.username, 'BOOK_ADDED', 'Book', savedBook._id.toString(), `Added book: ${savedBook.title} (ISBN: ${savedBook.isbn || 'N/A'})`);
        }
        
        if (booksAdded.length === 1) {
            res.status(201).json({ book: booksAdded[0], message: 'Book added successfully.' });
        } else {
            res.status(201).json({ books: booksAdded, message: `${quantity} copies of the book added successfully.` });
        }
    } catch (error) {
        console.error('Add Book Error:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
             return res.status(400).json({ message: `Error: ISBN must be unique. The ISBN '${error.keyValue.isbn}' is already in use.` });
        }
        res.status(500).json({ message: 'Server Error adding book.' });
    }
};

exports.updateBook = async (req, res) => {
    const { title, author, isbn, rack, status } = req.body; // Student shouldn't be able to set checkedOutBy/reservedBy directly here
    const adminUser = req.user;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found.' });

        if (isbn && isbn !== book.isbn) {
            const existingBookWithISBN = await Book.findOne({ isbn });
            if (existingBookWithISBN) return res.status(400).json({ message: `Book with ISBN ${isbn} already exists.` });
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.isbn = isbn !== undefined ? isbn : book.isbn;
        book.rack = rack || book.rack;
        
        const oldStatus = book.status;
        book.status = status || book.status;

        // Clear related fields if status changes to available
        if (book.status === 'available' && oldStatus !== 'available') {
            book.checkedOutBy = null;
            book.reservedBy = null;
            book.reservationExpiry = null;
        }
        // Note: Changing status to 'checked-out' or 'reserved' via this admin update
        // won't automatically link a user. That's a separate flow.
        // Admin is primarily managing book details and overall status like maintenance.

        const updatedBook = await book.save();
        await logActivity(adminUser._id, adminUser.username, 'BOOK_UPDATED', 'Book', updatedBook._id.toString(), `Updated book: ${updatedBook.title}. Status: ${oldStatus} -> ${updatedBook.status}`);
        res.json(updatedBook);
    } catch (error) {
        console.error('Update Book Error:', error);
         if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
             return res.status(400).json({ message: `Error: ISBN must be unique. The ISBN '${error.keyValue.isbn}' is already in use.` });
        }
        res.status(500).json({ message: 'Server Error updating book.' });
    }
};
exports.deleteBook = async (req, res) => {
    const adminUser = req.user;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }
        if (book.status === 'checked-out' || book.status === 'reserved') {
            return res.status(400).json({ message: `Cannot delete book. It is currently ${book.status}.` });
        }
        const deletedTitle = book.title;
        await book.deleteOne(); // <--- Corrected line
        await logActivity(adminUser._id, adminUser.username, 'BOOK_DELETED', 'Book', req.params.id, `Deleted book: ${deletedTitle}`);
        res.json({ message: 'Book removed successfully.', success: true });
    } catch (error) {
        console.error('Delete Book Error:', error);
        res.status(500).json({ message: 'Server Error deleting book.' });
    }
};