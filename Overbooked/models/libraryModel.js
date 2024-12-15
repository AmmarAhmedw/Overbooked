const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Error connecting to database:', err));

// Define the schema
const librarySchema = new mongoose.Schema({
  bookName: String,
  issued: Number,
  available: Number,
  total: Number,
  cover: String,
  rating: Number,
});

// Create the model
const Library = mongoose.model('Library', librarySchema);

// Uncomment to create a new book in the library
const newBook = new Library({
    bookName: "Diary of a Wimpy Kid: The Long Haul",
    issued: 160,
    available: 40,
    total: 200,
    cover: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Diary_of_a_Wimpy_Kid_The_Long_Haul_book_cover.jpg/220px-Diary_of_a_Wimpy_Kid_The_Long_Haul_book_cover.jpg",
    rating: 5
});
newBook.save();
console.log("New book saved");

module.exports = Library;
