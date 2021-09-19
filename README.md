# 📚 Bookshelfly
Bookshelfy is an open-source, remote library access application. Users can access their issues from anywhere, anytime! Being a full stack application, users can register, login and even add their own books to the library as well!

# 📷 Screenshots

# 🥳 Features
- ✅ New users can register for Bookshelfy
- ✅ Allows users to login and logout
- ✅ Allows users to browse the public library
- ✅ Users can issue books from the library
- ✅ Users can add books to their bookshelf
- ✅ Allows users to return their issued books
- ✅ Update the number of available and issued books in the library for transparency
- ✅ Users shouldn't be able to view other's bookshelves
- ✅ Creates a custom route for each user associated with their userID
- ✅ Doesn't allow to access library without signing in
- ✅ Doesn't allow adding same books twice to the library
- ✅ Doesn't allow to submit new book without all information

# 🎥 Demo

# 🧐 What's the stack?
- Frontend: Basic HTML, CSS & JavaScript. I have used jQuery & Bootstrap for keeping the library simple and responsive.
- Backend: Node.js & Express.js for creating new routes, handling GET and POST requests, and performing CRUD operations on databases.
- Database: I have used MongoDB Atlas for remote database, and Mongoose for modelling the application data.
- Two schemas & collections, one for data of users, and another for public library.
- Deployed on Heroku! - https://try-bookshelfly.herokuapp.com

# 🤔 How to use this?
- You can access all cool features of Bookshelfly here: https://try-bookshelfly.herokuapp.com
- For running the app locally on your system, follow these steps: 
  -  Clone the project repository: `git clone https://github.com/guptasajal411/bookshelfly.git`
  -  Move to the project directory: `cd booshelfly`
  -  Install dependencies for Bookshelfly with NPM: `npm install`
  -  Create a new `.env` file in the project folder for credentials to the MongoDB Atlas database, with variables: `usernameMongoDB` & `password`
  -  Run `npm start` to kickstart the application
  -  Go to `localhost:3000` to access Bookshelfly! 🥳
