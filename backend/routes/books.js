const express = require('express');
const router = express.Router();
const { Book, ReadingProgress, Comment } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET api/books
// @desc    Get all books with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: books } = await Book.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalBooks: count
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
    let whereClause = {};

    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { author: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (genre) {
      whereClause.genres = { [Op.contains]: [genre] };
    }

    const books = await Book.findAll({
      where: whereClause,
      limit: 20
    });

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
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/books/:id/content
// @desc    Get book content
// @access  Private
router.get('/:id/content', auth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Update reading progress
    let progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.id
      }
    });

    if (!progress) {
      progress = await ReadingProgress.create({
        userId: req.user.id,
        bookId: req.params.id,
        totalPages: book.pages,
        status: 'reading'
      });
    } else {
      progress.lastReadAt = new Date();
      progress.status = 'reading';
      await progress.save();
    }

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
    const book = await Book.findByPk(req.params.id);

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