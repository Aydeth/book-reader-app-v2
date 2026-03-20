const express = require('express');
const router = express.Router();
const { User, ReadingProgress, Book } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Get reading stats
    const stats = await ReadingProgress.findAll({
      where: { userId: req.user.id },
      attributes: ['status']
    });

    const statsSummary = {
      booksRead: stats.filter(s => s.status === 'completed').length,
      booksReading: stats.filter(s => s.status === 'reading').length,
      booksWantToRead: stats.filter(s => s.status === 'want_to_read').length
    };

    res.json({
      ...user.toJSON(),
      stats: statsSummary
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
    
    const user = await User.findByPk(req.user.id);
    user.bio = bio || user.bio;
    user.favoriteGenres = favoriteGenres || user.favoriteGenres;
    await user.save();

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
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id/books
// @desc    Get user's books (reading progress)
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const progress = await ReadingProgress.findAll({
      where: { userId: req.params.id },
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

module.exports = router;