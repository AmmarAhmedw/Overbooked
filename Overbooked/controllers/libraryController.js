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

// GET - library homepage
exports.getLibrary = function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            if (foundUser.signedIn === false) {
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

// POST - sign out from the library
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
// POST - issue a book from the library
exports.postIssueBook = function (req, res) {
    User.findOne({ _id: req.params.userID }, async function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            let hasBook = false;

            // Check if the user has already issued the book
            foundUser.issuedBooks.forEach(async function (object) {
                if (object.bookName === req.body.bookName) {
                    hasBook = true;
                }
            });

            if (!hasBook) {
             
                Library.findOne({ bookName: req.body.bookName }, async function (error, libraryBook) {
                    if (error) {
                        res.send(error);
                    } else {
                        // Update the available and issued counts in the library
                        libraryBook.available -= 1;
                        libraryBook.issued += 1;
                        await libraryBook.save();

                        // Add the book to the user's issuedBooks array, including cover and pdf info
                        foundUser.issuedBooks.push({
                            bookName: req.body.bookName,
                            cover: libraryBook.cover,
                            pdf: libraryBook.pdf
                        });
                        await foundUser.save();

                        // After issuing, redirect and pass the relevant book details to the view
                        res.redirect("/library/" + req.params.userID + "?bookName=" + req.body.bookName + "&cover=" + libraryBook.cover + "&pdf=" + libraryBook.pdf);
                    }
                });
            } else {
                res.redirect("/library/" + req.params.userID);
            }
        }
    });
}


// POST - return books to the library
exports.postReturnBook = function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            foundUser.issuedBooks.forEach(async function (object, index) {
                if (object.bookName === req.body.returnBookName) {
                    foundUser.issuedBooks.splice(index, 1);
                    await foundUser.save();
                }
            });
            Library.findOne({ bookName: req.body.returnBookName }, async function (err, foundBook) {
                if (err) {
                    res.send(err);
                } else {
                    foundBook.issued -= 1;
                    foundBook.available += 1;
                    await foundBook.save();
                }
            });
            res.redirect("/library/" + req.params.userID);
        }
    });
}

// GET - new books to the library
exports.getNewBook = async function (req, res) {
    User.findOne({ _id: req.params.userID }, function (err, foundUser) {
        if (err) {
            res.send(`Please login or register <a href="/">here</a> before accessing the library!`);
        } else {
            if (foundUser.signedIn === false) {
                res.render("login", { dangerMessage: "Please Sign In before adding a book to the library." });
            } else {
                res.render("newBook", { user: foundUser });
            }
        }
    });
}

// POST - add new books to the library (with PDF upload)
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
                    const pdfPath = req.file ? `/uploads/pdfs/${req.file.filename}` : null; 

                    const newBook = new Library({
                        bookName: req.body.newBookName,
                        issued: 0,
                        available: 5,
                        total: 5,
                        cover: req.body.newBookCover || "https://source.unsplash.com/random",
                        rating: req.body.newBookRating,
                        pdf: pdfPath,
                    });

                    await newBook.save();
                    res.redirect("/library/" + req.params.userID);
                }
            }
        });
    });
};

// POST - delete a book from the library
exports.postDeleteBook = function (req, res) {
    const { userID, bookID } = req.params;  // Use bookID instead of bookName

    // Remove the book from the library collection
    Library.findByIdAndDelete(bookID, async function (err, deletedBook) {  // Use bookID to find the book
        if (err) {
            res.send(err);
        } else {
            // If the book exists in the library, remove it from users' issuedBooks
            User.updateMany(
                { "issuedBooks.bookID": bookID },  // Match by bookID
                { $pull: { issuedBooks: { bookID: bookID } } },  // Pull bookID
                function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        // Redirect after successful deletion
                        res.redirect("/library/" + userID);
                    }
                }
            );
        }
    });
};

