const express = require('express');
let books = require("./booksdb.js");
let doesExist = require("./auth_users.js").doesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (doesExist(username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Function to get all books (Task 10)
function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop (Using async/await)
public_users.get('/', async function (req, res) {
  try {
    const booksList = await getBooks();
    res.status(200).json(booksList);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving books." });
  }
});

// Function to get book by ISBN (Task 11)
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found.");
    }
  });
}

// Get book details based on ISBN (Using async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// Function to get books by author (Task 12)
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(
      book => book.author.toLowerCase() === author.toLowerCase()
    );
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author.");
    }
  });
}

// Get book details based on author (Using async/await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// Function to get books by title (Task 13)
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(
      book => book.title.toLowerCase() === title.toLowerCase()
    );
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title.");
    }
  });
}

// Get book details based on title (Using async/await)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for this ISBN." });
  }
});

module.exports.general = public_users;
