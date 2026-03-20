const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

module.exports = ReadingProgress;