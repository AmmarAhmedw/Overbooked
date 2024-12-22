const multer = require('multer');
const path = require('path');
const Library = require("../models/libraryModel.js");
const User = require("../models/userModel.js");

// Multer setup for PDF upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pdfs'); // Folder to store PDF files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensures unique filenames
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept PDF files
    } else {
        cb(new Error('Not a PDF file!'), false); // Reject non-PDF files
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET
// library homepage
exports.getLibrary = function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            if (foundUser.signedIn == false) {
                res.render("login", { dangerMessage: "Please Sign In before accessing the library." });
            } else {
                Library.find({}, function (err, foundBooks) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.render("library", {
                            user: foundUser,
                            books: foundBooks.reverse()
                        });
                    }
                });
            }
        }
    });
}

// POST
// sign out from the library
exports.postSignout = function (req, res) {
    User.findOne({ _id: req.params.userID }, async function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            foundUser.signedIn = false;
            await foundUser.save();
            res.redirect("/");
        }
    });
}

// POST
// issue a book from the library
exports.postIssueBook = function (req, res) {
    User.findOne({ _id: req.params.userID }, async function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            var hasBook = false;
            foundUser.issuedBooks.forEach(async function (object) {
                if (object.bookName === req.body.bookName) {
                    hasBook = true;
                }
            });
            if (!hasBook) {
                foundUser.issuedBooks.push({
                    bookName: req.body.bookName
                });
                await foundUser.save();
                Library.findOne({ bookName: req.body.bookName }, async function (error, libraryBook) {
                    if (error) {
                        res.send(err);
                    } else {
                        libraryBook.available = libraryBook.available - 1;
                        libraryBook.issued = libraryBook.issued + 1;
                        await libraryBook.save();
                        res.redirect("/library/" + req.params.userID);
                    }
                });
            } else {
                res.redirect("/library/" + req.params.userID);
            }
        }
    });
}

// POST
// return books to the library
exports.postReturnBook = function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            foundUser.issuedBooks.forEach(async function (object, index) {
                if (object.bookName == req.body.returnBookName) {
                    foundUser.issuedBooks.splice(index, 1);
                    await foundUser.save();
                }
            });
            Library.findOne({ bookName: req.body.returnBookName }, async function (err, foundBook) {
                if (err) {
                    res.send(err);
                } else {
                    foundBook.issued = foundBook.issued - 1;
                    foundBook.available = foundBook.available + 1;
                    await foundBook.save();
                }
            });
            res.redirect("/library/" + req.params.userID);
        }
    });
}

// GET
// add new books to the library
exports.getNewBook = async function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(`Please login or register <a href="/">here</a> before accessing the library!`);
        } else {
            if (foundUser.signedIn == false) {
                res.render("login", { dangerMessage: "Please Sign In before adding a book to the library." });
            } else {
                res.render("newBook", { user: foundUser });
            }
        }
    });
}

// POST
// POST
// add new books to the library (with PDF upload)
exports.postNewBook = function (req, res) {
    upload.single('newBookPDF')(req, res, function (err) {
        if (err) {
            // Handle the error
            return res.send(`Error uploading file: ${err.message}`);
        }

        // Once the file is uploaded, handle the database logic
        Library.findOne({ bookName: req.body.newBookName }, async function (err, foundBook) {
            if (err) {
                res.send(err);
            } else {
                if (foundBook) {
                    res.send(`Sorry, that book already exists in the library, please try with another book.`);
                } else {
                    const pdfPath = req.file ? `/uploads/pdfs/${req.file.filename}` : null; // Get PDF path if uploaded

                    const newBook = new Library({
                        bookName: req.body.newBookName,
                        issued: 0,
                        available: 50,
                        total: 50,
                        cover: req.body.newBookCover || "https://source.unsplash.com/random",
                        rating: req.body.newBookRating,
                        pdf: pdfPath, // Save PDF path to the database
                    });

                    await newBook.save();
                    res.redirect("/library/" + req.params.userID);
                }
            }
        });
    });
};
