const express = require('express');
const router = express.Router();
const { ReadingProgress, Book, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET api/progress
// @desc    Get user's reading progress for all books
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progress = await ReadingProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Book,
        as: 'book'
      }],
      order: [['lastReadAt', 'DESC']]
    });

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/progress/:bookId
// @desc    Get reading progress for a specific book
// @access  Private
router.get('/:bookId', auth, async (req, res) => {
  try {
    let progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.bookId
      }
    });

    if (!progress) {
      const book = await Book.findByPk(req.params.bookId);
      progress = {
        userId: req.user.id,
        bookId: req.params.bookId,
        currentPage: 0,
        totalPages: book ? book.pages : 0,
        status: 'want_to_read',
        progress: 0,
        notes: [],
        bookmarks: []
      };
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/:bookId
// @desc    Update reading progress
// @access  Private
router.post('/:bookId', auth, async (req, res) => {
  try {
    const { currentPage, status, progress: progressValue } = req.body;

    let readingProgress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.bookId
      }
    });

    if (!readingProgress) {
      const book = await Book.findByPk(req.params.bookId);
      readingProgress = await ReadingProgress.create({
        userId: req.user.id,
        bookId: req.params.bookId,
        totalPages: book ? book.pages : 0
      });
    }

    if (currentPage !== undefined) {
      readingProgress.currentPage = currentPage;
      if (readingProgress.totalPages) {
        readingProgress.progress = Math.round((currentPage / readingProgress.totalPages) * 100);
      }
    }

    if (status) {
      readingProgress.status = status;
      
      // If completed, update user stats
      if (status === 'completed') {
        const user = await User.findByPk(req.user.id);
        const stats = user.readingStats || { booksRead: 0, pagesRead: 0, readingTime: 0 };
        stats.booksRead = (stats.booksRead || 0) + 1;
        if (readingProgress.totalPages) {
          stats.pagesRead = (stats.pagesRead || 0) + readingProgress.totalPages;
        }
        user.readingStats = stats;
        await user.save();
      }
    }

    if (progressValue !== undefined) {
      readingProgress.progress = progressValue;
    }

    readingProgress.lastReadAt = new Date();
    await readingProgress.save();

    res.json(readingProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/:bookId/bookmark
// @desc    Add bookmark
// @access  Private
router.post('/:bookId/bookmark', auth, async (req, res) => {
  try {
    const { page, note } = req.body;

    const progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.bookId
      }
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    const bookmarks = progress.bookmarks || [];
    bookmarks.push({ page, note, createdAt: new Date() });
    progress.bookmarks = bookmarks;
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/progress/:bookId/bookmark/:bookmarkId
// @desc    Remove bookmark
// @access  Private
router.delete('/:bookId/bookmark/:bookmarkId', auth, async (req, res) => {
  try {
    const progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.bookId
      }
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    const bookmarks = progress.bookmarks || [];
    const bookmarkIndex = bookmarks.findIndex(
      bm => bm._id && bm._id.toString() === req.params.bookmarkId
    );

    if (bookmarkIndex !== -1) {
      bookmarks.splice(bookmarkIndex, 1);
      progress.bookmarks = bookmarks;
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/:bookId/note
// @desc    Add note
// @access  Private
router.post('/:bookId/note', auth, async (req, res) => {
  try {
    const { page, text } = req.body;

    const progress = await ReadingProgress.findOne({
      where: {
        userId: req.user.id,
        bookId: req.params.bookId
      }
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    const notes = progress.notes || [];
    notes.push({ page, text, createdAt: new Date() });
    progress.notes = notes;
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;