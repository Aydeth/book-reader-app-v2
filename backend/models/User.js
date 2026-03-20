const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  photoUrl: DataTypes.STRING,
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  favoriteGenres: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  readingStats: {
    type: DataTypes.JSONB,
    defaultValue: {
      booksRead: 0,
      pagesRead: 0,
      readingTime: 0
    }
  }
}, {
  timestamps: true
});

module.exports = User;