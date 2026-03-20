const User = require('./User');
const Book = require('./Book');
const Comment = require('./Comment');
const ReadingProgress = require('./ReadingProgress');

// Define associations
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(ReadingProgress, { foreignKey: 'userId', as: 'readingProgress' });

Book.hasMany(Comment, { foreignKey: 'bookId', as: 'comments' });
Book.hasMany(ReadingProgress, { foreignKey: 'bookId', as: 'readingProgress' });

Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

ReadingProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReadingProgress.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  User,
  Book,
  Comment,
  ReadingProgress
};