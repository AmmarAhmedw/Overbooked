const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Error connecting to database:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  issuedBooks: [
    {
      bookName: String,
      cover: String,
      pdf: Buffer
    },
  ],
  numberOfIssuedBooks: Number,
  signedIn: Boolean,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
