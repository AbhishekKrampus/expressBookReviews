const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'access';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// Protected customer routes require a valid login session/JWT.
app.use('/customer/auth/*', (req, res, next) => {
  const header = req.get('Authorization') || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const sessionToken = req.session && req.session.authorization && req.session.authorization.accessToken;
  const token = bearerToken || sessionToken;

  if (!token) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    req.user = decoded;
    if (req.session && decoded.username) {
      req.session.username = decoded.username;
    }
    return next();
  });
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Book Review API listening on port ${PORT}`));
