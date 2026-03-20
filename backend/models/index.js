const User = require('./User');
const Book = require('./Book');
const Comment = require('./Comment');
const ReadingProgress = require('./ReadingProgress');

// Define associations - используем уникальные алиасы
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(ReadingProgress, { foreignKey: 'userId', as: 'readingProgress' });

Book.hasMany(Comment, { foreignKey: 'bookId', as: 'comments' });
Book.hasMany(ReadingProgress, { foreignKey: 'bookId', as: 'readingProgress' });

Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' }); // Изменено с 'user' на 'author'
Comment.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

ReadingProgress.belongsTo(User, { foreignKey: 'userId', as: 'reader' }); // Изменено с 'user' на 'reader'
ReadingProgress.belongsTo(Book, { foreignKey: 'bookId', as: 'bookDetails' }); // Изменено с 'book' на 'bookDetails'

module.exports = {
  User,
  Book,
  Comment,
  ReadingProgress
};