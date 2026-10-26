# Express Book Review API

A Node.js/Express API for the IBM back-end final project. It supports book listing/search, registration/login, and authenticated review create/update/delete operations.

## Run locally

```powershell
cd final_project
npm install
npm start
```

The API listens on `http://localhost:5000` by default.

## Public routes

- `GET /` — all books
- `GET /isbn/:isbn` — book by course identifier (1–10)
- `GET /author/:author` — author search, case-insensitive
- `GET /title/:title` — title search, case-insensitive
- `GET /review/:isbn` — book reviews
- `POST /register` — JSON `{ "username": "...", "password": "..." }`
- `POST /customer/login` — JSON login; returns JWT and sets a session cookie

## Authenticated review routes

- `PUT /customer/auth/review/:isbn?review=TEXT` — add/update the logged-in user's review
- `DELETE /customer/auth/review/:isbn` — delete the logged-in user's review

The review routes accept either the login session cookie or `Authorization: Bearer <token>`.

## Axios client

With the server running, try:

```powershell
node general.js all
node general.js isbn 1
node general.js author "Chinua Achebe"
node general.js title "Things Fall Apart"
node general.js review 1
```

## Evidence files

Run `./collect-evidence.ps1` from this folder after starting the server. It sends real cURL requests and saves outputs under `evidence/`. The registration and login requests run in sequence so the review requests can reuse the session cookie.
