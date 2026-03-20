const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  currentPage: {
    type: Number,
    default: 0
  },
  totalPages: Number,
  status: {
    type: String,
    enum: ['want_to_read', 'reading', 'completed', 'dropped'],
    default: 'want_to_read'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastReadAt: Date,
  notes: [{
    page: Number,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    page: Number,
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Составной уникальный индекс для пары пользователь-книга
readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);