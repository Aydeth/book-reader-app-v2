const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  likes: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  timestamps: true
});

// Relationships
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.belongsTo(Book, { as: 'book', foreignKey: 'bookId' });

module.exports = Comment;