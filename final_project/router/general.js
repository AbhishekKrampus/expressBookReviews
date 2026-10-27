const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor[isbn] = books[isbn];
    }
  });

  if (Object.keys(booksByAuthor).length > 0) {
    return res.status(200).json({ booksByAuthor });
  } else {
    return res.status(404).json({ message: `No books found for author: ${author}` });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle[isbn] = books[isbn];
    }
  });

  if (Object.keys(booksByTitle).length > 0) {
    return res.status(200).json({ booksByTitle });
  } else {
    return res.status(404).json({ message: `No books found with title: ${title}` });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// ─── Task 10: Async/Await with Axios ──────────────────────────────────────────

// Get all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json({ source: "async/await + axios", data: response.data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json({ source: "async/await + axios", data: response.data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Get books by author using Promises with Axios
public_users.get('/async/author/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`${BASE_URL}/author/${author}`)
    .then((response) => {
      return res.status(200).json({ source: "promise + axios", data: response.data });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    });
});

// Get books by title using Promises with Axios
public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`${BASE_URL}/title/${title}`)
    .then((response) => {
      return res.status(200).json({ source: "promise + axios", data: response.data });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});

module.exports.general = public_users;
