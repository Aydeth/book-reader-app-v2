const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const ReadingProgress = require('../models/ReadingProgress');
const auth = require('../middleware/auth');

// @route   GET api/books
// @desc    Get all books with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/books/search
// @desc    Search books
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, genre } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ];
    }

    if (genre) {
      filter.genres = genre;
    }

    const books = await Book.find(filter).limit(20);
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/books/:id/content
// @desc    Get book content
// @access  Private
router.get('/:id/content', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Update reading progress
    let progress = await ReadingProgress.findOne({
      userId: req.user.id,
      bookId: req.params.id
    });

    if (!progress) {
      progress = new ReadingProgress({
        userId: req.user.id,
        bookId: req.params.id,
        totalPages: book.pages
      });
    }

    progress.lastReadAt = new Date();
    progress.status = 'reading';
    await progress.save();

    res.json({ content: book.fileUrl, format: book.fileFormat });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/books/:id/rate
// @desc    Rate a book
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Update book rating
    const newRatingCount = book.ratingCount + 1;
    const newRating = ((book.rating * book.ratingCount) + rating) / newRatingCount;

    book.rating = newRating;
    book.ratingCount = newRatingCount;
    await book.save();

    res.json({ rating: book.rating, ratingCount: book.ratingCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;