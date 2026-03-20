const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  coverUrl: DataTypes.STRING,
  fileUrl: DataTypes.STRING,
  fileFormat: {
    type: DataTypes.ENUM('epub', 'html', 'txt', 'pdf'),
    defaultValue: 'html'
  },
  genres: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  publishedYear: DataTypes.INTEGER,
  publisher: DataTypes.STRING,
  pages: DataTypes.INTEGER
}, {
  timestamps: true
});

module.exports = Book;