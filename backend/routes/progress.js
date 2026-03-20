const express = require('express');
const router = express.Router();
const ReadingProgress = require('../models/ReadingProgress');
const auth = require('../middleware/auth');

// @route   GET api/progress
// @desc    Get user's reading progress for all books
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progress = await ReadingProgress.find({ userId: req.user.id })
      .populate('bookId')
      .sort({ lastReadAt: -1 });

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
      userId: req.user.id,
      bookId: req.params.bookId
    });

    if (!progress) {
      progress = new ReadingProgress({
        userId: req.user.id,
        bookId: req.params.bookId
      });
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
      userId: req.user.id,
      bookId: req.params.bookId
    });

    if (!readingProgress) {
      readingProgress = new ReadingProgress({
        userId: req.user.id,
        bookId: req.params.bookId
      });
    }

    if (currentPage !== undefined) {
      readingProgress.currentPage = currentPage;
      readingProgress.progress = Math.round((currentPage / readingProgress.totalPages) * 100);
    }

    if (status) {
      readingProgress.status = status;
      
      // If completed, update user stats
      if (status === 'completed') {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { 'readingStats.booksRead': 1 }
        });
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
      userId: req.user.id,
      bookId: req.params.bookId
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    progress.bookmarks.push({ page, note });
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
      userId: req.user.id,
      bookId: req.params.bookId
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    progress.bookmarks = progress.bookmarks.filter(
      bookmark => bookmark._id.toString() !== req.params.bookmarkId
    );
    
    await progress.save();
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
      userId: req.user.id,
      bookId: req.params.bookId
    });

    if (!progress) {
      return res.status(404).json({ msg: 'Reading progress not found' });
    }

    progress.notes.push({ page, text });
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;