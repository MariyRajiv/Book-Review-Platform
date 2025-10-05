
# Book Review Backend (Node.js + Express)

This backend is built to match the uploaded React frontend and satisfy the assignment requirements:
- Node.js + Express
- MongoDB (Mongoose)
- JWT authentication
- bcrypt password hashing
- RESTful APIs for Books and Reviews
- Pagination, search, genres, stats endpoints expected by the frontend

## Quick start

1. Copy the folder to your machine or unzip `backend_node.zip`.
2. Create a `.env` file (use `.env.example` as reference) with at least:

```
PORT=5000
MONGODB_URI=<your mongo connection string>
JWT_SECRET=<a long random secret>
CORS_ORIGIN=http://localhost:3000
```

3. Install dependencies and run:

```bash
cd backend_node
npm install
npm run dev   # requires nodemon
# or
npm start
```

4. In the frontend project, set `REACT_APP_BACKEND_URL` to your backend URL (e.g. `http://localhost:5000`).

## Implemented endpoints (matching frontend expectations)

Authentication:
- POST /api/auth/signup  -> body: { name, email, password } -> returns { access_token, user }
- POST /api/auth/login   -> body: { email, password } -> returns { access_token, user }
- GET  /api/auth/me      -> header Authorization: Bearer <token> -> returns user object

Books:
- GET  /api/books? page=&limit=&search=&genre=&sort_by=&sort_order=   -> returns array of books (each has id, added_by, added_by_name, average_rating, total_reviews)
- GET  /api/genres      -> returns { genres: [...] }
- POST /api/books       -> protected; body: { title, author, description, genre, published_year } -> returns created book
- GET  /api/books/:id   -> book details (with average_rating & total_reviews)
- GET  /api/books/:id/reviews  -> returns array of reviews for book
- GET  /api/books/:id/stats    -> returns rating distribution, average_rating, total_reviews, sentiment_distribution
- PUT  /api/books/:id   -> protected; only book owner can update
- DELETE /api/books/:id -> protected; only book owner can delete (also deletes reviews)

Reviews:
- POST /api/reviews     -> protected; body: { book_id, rating, review_text } -> creates a review (one review per user per book)
- PUT  /api/reviews/:id -> protected; only owner can update; body: { rating, review_text }
- DELETE /api/reviews/:id -> protected; only owner can delete

## Notes
- Responses are shaped to match the frontend i.e. `id` field is used (string), rather than `_id`.
- Stats endpoint includes a simple sentiment distribution derived from ratings (positive=4-5, neutral=3, negative=1-2).

If you want, I can:
- Run a quick automated check of the frontend calls against these routes.
- Deploy this backend to Render/Heroku for you and update the frontend env.

