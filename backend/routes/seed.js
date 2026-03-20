const express = require('express');
const router = express.Router();
const { Book } = require('../models');
const booksData = require('../data/books.json');

// @route   POST api/seed/books
// @desc    Seed books into database (only for development/initial setup)
// @access  Private (можно добавить секретный ключ для защиты)
router.post('/books', async (req, res) => {
  try {
    // Проверяем секретный ключ (дополнительная защита)
    const secretKey = req.headers['x-seed-key'];
    if (secretKey !== process.env.SEED_SECRET_KEY) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Проверяем, есть ли уже книги
    const existingBooks = await Book.count();
    if (existingBooks > 0) {
      return res.status(400).json({ 
        msg: 'Books already exist', 
        count: existingBooks 
      });
    }

    // Загружаем книги
    const books = await Book.bulkCreate(booksData);
    
    res.json({ 
      msg: 'Books seeded successfully', 
      count: books.length 
    });
  } catch (err) {
    console.error('Error seeding books:', err);
    res.status(500).json({ 
      msg: 'Error seeding books', 
      error: err.message 
    });
  }
});

// @route   GET api/seed/status
// @desc    Check if books are already seeded
// @access  Private
router.get('/status', async (req, res) => {
  try {
    const count = await Book.count();
    res.json({ 
      booksExist: count > 0,
      count 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error checking status' });
  }
});

// @route   DELETE api/seed/books
// @desc    Delete all books (reset)
// @access  Private
router.delete('/books', async (req, res) => {
  try {
    const secretKey = req.headers['x-seed-key'];
    if (secretKey !== process.env.SEED_SECRET_KEY) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    await Book.destroy({ where: {}, truncate: true });
    res.json({ msg: 'All books deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting books' });
  }
});

module.exports = router;