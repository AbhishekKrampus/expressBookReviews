// Axios client for the Book Review API's asynchronous-code requirement.
// Start index.js in one terminal, then call this file from another terminal.
const axios = require('axios');

const BASE_URL = process.env.BOOK_REVIEW_API_URL || 'http://localhost:5000';

async function getAllBooks() {
  const { data } = await axios.get(`${BASE_URL}/`);
  return data;
}

async function getBooksByISBN(isbn) {
  const { data } = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
  return data;
}

async function getBooksByAuthor(author) {
  const { data } = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return data;
}

async function getBooksByTitle(title) {
  const { data } = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return data;
}

async function getBookReview(isbn) {
  const { data } = await axios.get(`${BASE_URL}/review/${encodeURIComponent(isbn)}`);
  return data;
}

module.exports = { getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle, getBookReview };

async function main() {
  const [action, ...args] = process.argv.slice(2);
  try {
    let result;
    switch ((action || 'all').toLowerCase()) {
      case 'all': result = await getAllBooks(); break;
      case 'isbn': result = await getBooksByISBN(args.join(' ')); break;
      case 'author': result = await getBooksByAuthor(args.join(' ')); break;
      case 'title': result = await getBooksByTitle(args.join(' ')); break;
      case 'review': result = await getBookReview(args.join(' ')); break;
      default:
        console.error('Usage: node general.js all | isbn <id> | author <name> | title <title> | review <id>');
        process.exitCode = 2;
        return;
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const status = error.response && error.response.status;
    console.error(`API request failed${status ? ` (HTTP ${status})` : ''}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
