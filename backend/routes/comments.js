const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// @route   GET api/comments/book/:bookId
// @desc    Get comments for a book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const comments = await Comment.find({ bookId: req.params.bookId })
      .populate('userId', 'username firstName lastName photoUrl')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/comments
// @desc    Add comment to book
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, text, rating } = req.body;

    const comment = new Comment({
      userId: req.user.id,
      bookId,
      text,
      rating
    });

    await comment.save();
    await comment.populate('userId', 'username firstName lastName photoUrl');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user owns comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    comment.text = req.body.text || comment.text;
    if (req.body.rating) {
      comment.rating = req.body.rating;
    }

    await comment.save();
    await comment.populate('userId', 'username firstName lastName photoUrl');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user owns comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.deleteOne();
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/comments/:id/like
// @desc    Like/unlike comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if already liked
    const likedIndex = comment.likes.indexOf(req.user.id);

    if (likedIndex === -1) {
      // Like comment
      comment.likes.push(req.user.id);
    } else {
      // Unlike comment
      comment.likes.splice(likedIndex, 1);
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;