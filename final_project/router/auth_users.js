const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if a username already exists
const doesExist = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Store username in session
  req.session.username = username;

  return res.status(200).json({ message: "Login successful." });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  if (!req.session || !req.session.username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  const username = req.session.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update the user's review
  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session || !req.session.username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  const username = req.session.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Review not found for this user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.doesExist = doesExist;
module.exports.users = users;
