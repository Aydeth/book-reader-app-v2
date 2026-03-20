const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ReadingProgress = require('../models/ReadingProgress');
const auth = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Get reading stats
    const stats = await ReadingProgress.aggregate([
      { $match: { userId: req.user.id } },
      { $group: {
        _id: null,
        booksRead: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        booksReading: { $sum: { $cond: [{ $eq: ['$status', 'reading'] }, 1, 0] } },
        booksWantToRead: { $sum: { $cond: [{ $eq: ['$status', 'want_to_read'] }, 1, 0] } }
      }}
    ]);

    res.json({
      ...user.toObject(),
      stats: stats[0] || { booksRead: 0, booksReading: 0, booksWantToRead: 0 }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, favoriteGenres } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bio, favoriteGenres } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id/books
// @desc    Get user's books (reading progress)
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const progress = await ReadingProgress.find({ userId: req.params.id })
      .populate('bookId')
      .sort({ lastReadAt: -1 });

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;