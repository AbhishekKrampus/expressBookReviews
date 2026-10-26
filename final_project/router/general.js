const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const publicUsers = express.Router();
const API_BASE_URL = process.env.BOOK_REVIEW_API_URL || `http://localhost:${process.env.PORT || 5000}`;

// Register a new user.
publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || !String(username).trim() || !String(password).trim()) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists.' });
  }
  users.push({ username: String(username).trim(), password: String(password) });
  return res.status(201).json({ message: 'User registered successfully.' });
});

// Retrieve all books.
publicUsers.get('/', (req, res) => res.status(200).json(books));

// Retrieve a book by identifier (the course dataset uses keys 1-10).
publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  return res.status(200).json(book);
});

// Search by author (case-insensitive partial match).
publicUsers.get('/author/:author', (req, res) => {
  const authorQuery = decodeURIComponent(req.params.author).toLocaleLowerCase();
  const matches = Object.values(books).filter((book) =>
    book.author.toLocaleLowerCase().includes(authorQuery)
  );
  if (!matches.length) return res.status(404).json({ message: 'No books found for this author.' });
  return res.status(200).json(matches);
});

// Search by title (case-insensitive partial match).
publicUsers.get('/title/:title', (req, res) => {
  const titleQuery = decodeURIComponent(req.params.title).toLocaleLowerCase();
  const matches = Object.values(books).filter((book) =>
    book.title.toLocaleLowerCase().includes(titleQuery)
  );
  if (!matches.length) return res.status(404).json({ message: 'No books found for this title.' });
  return res.status(200).json(matches);
});

// Retrieve reviews for a book.
publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  return res.status(200).json({ reviews: book.reviews });
});

/*
 * Axios Promise/async-await helpers for the course's asynchronous-code criterion.
 * These call this API's public endpoints; run the server before invoking them.
 */
async function getAllBooks() {
  const response = await axios.get(`${API_BASE_URL}/`);
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await axios.get(`${API_BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

async function getBookReview(isbn) {
  const response = await axios.get(`${API_BASE_URL}/review/${encodeURIComponent(isbn)}`);
  return response.data;
}

module.exports.general = publicUsers;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
module.exports.getBookReview = getBookReview;
