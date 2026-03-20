const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  photoUrl: String,
  bio: {
    type: String,
    default: ''
  },
  favoriteGenres: [String],
  readingStats: {
    booksRead: { type: Number, default: 0 },
    pagesRead: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 } // в минутах
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);