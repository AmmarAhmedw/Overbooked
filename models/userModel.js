const mongoose = require('mongoose');
require("dotenv").config();

mongoose.connect("mongodb+srv://wolfie:TA_%24tn%40k2NLSAWi@cluster0.fiadc.mongodb.net/Overbooked?retryWrites=true&w=majority")
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Error connecting to database:', err));


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    issuedBooks: [{
        bookName: String,
    }],
    numberOfIssuedBooks: Number,
    signedIn: Boolean
});

const User = new mongoose.model("User", userSchema);

module.exports = User;