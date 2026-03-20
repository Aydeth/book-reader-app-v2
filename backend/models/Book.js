const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: String,
  coverUrl: String,
  fileUrl: String,
  fileFormat: {
    type: String,
    enum: ['epub', 'html', 'txt', 'pdf'],
    default: 'html'
  },
  genres: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  publishedYear: Number,
  publisher: String,
  pages: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);