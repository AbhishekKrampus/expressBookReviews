const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regdUsers = express.Router();
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'access';

// True when the username is already registered.
const isValid = (username) => users.some((user) => user.username === username);

// True when the given username/password pair matches a registered account.
const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

regdUsers.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  req.session.authorization = { accessToken, username };
  req.session.username = username;
  return res.status(200).json({ message: 'Login successful.', accessToken });
});

// Add a review or replace the current user's review for a book.
regdUsers.put('/auth/review/:isbn', (req, res) => {
  const username = (req.user && req.user.username) || (req.session && req.session.username);
  const isbn = req.params.isbn;
  const review = (req.body && req.body.review) || req.query.review;

  if (!username) return res.status(401).json({ message: 'User not authenticated.' });
  if (!review || !String(review).trim()) {
    return res.status(400).json({ message: 'Please provide a review.' });
  }
  if (!books[isbn]) return res.status(404).json({ message: 'Book not found.' });

  const alreadyReviewed = Object.prototype.hasOwnProperty.call(books[isbn].reviews, username);
  books[isbn].reviews[username] = String(review).trim();
  return res.status(200).json({
    message: alreadyReviewed ? 'Review modified successfully.' : 'Review added successfully.',
    reviews: books[isbn].reviews
  });
});

regdUsers.delete('/auth/review/:isbn', (req, res) => {
  const username = (req.user && req.user.username) || (req.session && req.session.username);
  const isbn = req.params.isbn;
  if (!username) return res.status(401).json({ message: 'User not authenticated.' });
  if (!books[isbn]) return res.status(404).json({ message: 'Book not found.' });
  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({ message: 'Review not found for this user and book.' });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: 'Review deleted successfully.', reviews: books[isbn].reviews });
});

module.exports.authenticated = regdUsers;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
