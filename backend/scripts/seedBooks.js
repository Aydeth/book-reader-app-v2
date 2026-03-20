const sequelize = require('../config/database');
const Book = require('../models/Book');
const booksData = require('../data/books.json');

const seedBooks = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    // Clear existing books
    await Book.destroy({ where: {}, truncate: true });
    
    // Insert new books
    await Book.bulkCreate(booksData);
    
    console.log('Books seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding books:', err);
    process.exit(1);
  }
};

seedBooks();