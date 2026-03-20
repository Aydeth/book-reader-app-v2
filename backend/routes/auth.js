const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');

// @route   POST api/auth/telegram
// @desc    Authenticate user with Telegram data
// @access  Public
router.post('/telegram', async (req, res) => {
  try {
    const { id, first_name, last_name, username, photo_url } = req.body;

    // Check if user exists
    let user = await User.findOne({ where: { telegramId: id.toString() } });

    if (!user) {
      // Create new user
      user = await User.create({
        telegramId: id.toString(),
        username: username || `user_${id}`,
        firstName: first_name,
        lastName: last_name,
        photoUrl: photo_url
      });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        telegramId: user.telegramId
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/verify
// @desc    Verify token and get user
// @access  Private
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;