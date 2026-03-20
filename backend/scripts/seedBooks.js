const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const booksData = require('../data/books.json');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Clear existing books
    await Book.deleteMany({});
    
    // Insert new books
    await Book.insertMany(booksData);
    
    console.log('Books seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding books:', err);
    process.exit(1);
  });