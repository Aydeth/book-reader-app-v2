const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

const ReadingProgress = sequelize.define('ReadingProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  currentPage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPages: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM('want_to_read', 'reading', 'completed', 'dropped'),
    defaultValue: 'want_to_read'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  lastReadAt: DataTypes.DATE,
  notes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  bookmarks: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true,
  // Добавляем уникальный составной индекс здесь
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

// Relationships
ReadingProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });
ReadingProgress.belongsTo(Book, { as: 'book', foreignKey: 'bookId' });

module.exports = ReadingProgress;