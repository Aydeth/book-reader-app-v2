const express = require('express');
const router = express.Router();
const { Comment, User, Book } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET api/comments/book/:bookId
// @desc    Get comments for a book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { bookId: req.params.bookId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl']
      }],
      order: [['createdAt', 'DESC']]
    });

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

    const comment = await Comment.create({
      userId: req.user.id,
      bookId,
      text,
      rating
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl']
      }]
    });

    res.json(commentWithUser);
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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user owns comment
    if (comment.userId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    comment.text = req.body.text || comment.text;
    if (req.body.rating) {
      comment.rating = req.body.rating;
    }

    await comment.save();

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl']
      }]
    });

    res.json(updatedComment);
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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user owns comment
    if (comment.userId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.destroy();
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
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    const likes = comment.likes || [];
    const likedIndex = likes.indexOf(req.user.id);

    if (likedIndex === -1) {
      // Like comment
      likes.push(req.user.id);
    } else {
      // Unlike comment
      likes.splice(likedIndex, 1);
    }

    comment.likes = likes;
    await comment.save();

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'photoUrl']
      }]
    });

    res.json(updatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;