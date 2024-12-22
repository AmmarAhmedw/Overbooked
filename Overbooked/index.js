const express = require('express');
const ejs = require('ejs');
const app = express();
const path = require('path');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static("public"));

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Include your routes
app.use("/", require(path.join(__dirname, "./routes/routes.js")));

module.exports = app;
