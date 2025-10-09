# Book Review Platform

A platform for users to discover, review, and share their thoughts on books.

## Features and Functionality

*   **User Authentication:** Secure signup and login functionality using bcrypt and JWT.
    *   Located in `backend/controllers/authController.js`
    *   Routes defined in `backend/routes/auth.js`
*   **Book Management:** Create, read, update, and delete books.
    *   Controller logic in `backend/controllers/bookController.js`
    *   Data model defined in `backend/models/Book.js`
    *   Routes defined in `backend/routes/books.js`
*   **Review System:** Users can submit reviews with ratings for books. Each user can submit only one review per book.
    *   Controller logic in `backend/controllers/reviewController.js`
    *   Data model defined in `backend/models/Review.js`
    *   Routes defined in `backend/routes/reviews.js`
*   **Book Listing and Filtering:** Browse books with search, genre filters, and sorting options.
    *   Implemented in `backend/controllers/bookController.js`
*   **Genre Listing:** Fetch distinct book genres from the database.
    *   Implemented in `backend/controllers/bookController.js`
*   **Book Statistics:** View rating distributions and sentiment analysis for individual books.
    *   Implemented in `backend/controllers/bookController.js`
*   **User Profile:** View books added and reviews written by the user.
    *   Accessed through frontend `ProfilePage.js`
*   **Theme Toggle:** Users can switch between light and dark themes.
    *   Managed in `frontend/src/App.js` and `frontend/src/components/ui`
*   **Protected Routes:** Authentication middleware restricts access to certain routes.
    *   Implemented in `backend/middleware/auth.js`
*   **Frontend UI Components:** Utilizes Radix UI primitives for a consistent and accessible user interface.
    *   Located in `frontend/src/components/ui`
*   **Toaster Notifications:** Displays user-friendly notifications for successful actions and errors using `sonner`.
    *   Implemented in `frontend/src/App.js`
*   **Backend Health Check:** An API endpoint `/api/health` to check the backend status.
    *   Implemented in `backend/server.js`

## Technology Stack

*   **Backend:**
    *   Node.js
    *   Express.js
    *   Mongoose
    *   MongoDB
    *   bcryptjs
    *   jsonwebtoken
    *   dotenv
    *   cors
    *   helmet
    *   morgan
*   **Frontend:**
    *   React
    *   React Router
    *   Axios
    *   Tailwind CSS
    *   Radix UI
    *   sonner
    *   recharts

## Prerequisites

*   Node.js (version 18 or higher)
*   npm or yarn
*   MongoDB

## Installation Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MariyRajiv/Book-Review-Platform.git
    cd Book-Review-Platform
    ```

2.  **Backend Setup:**

    ```bash
    cd backend
    npm install # or yarn install
    ```

3.  **Configure Environment Variables:**

    *   Create a `.env` file in the `backend` directory.
    *   Add the following variables, replacing the values with your actual configurations:

        ```
        PORT=5000 # Or any other available port
        MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.mongodb.net/<your_database>?retryWrites=true&w=majority&appName=Cluster0 # Replace with your MongoDB connection string
        JWT_SECRET=your_secret_key # Replace with a strong, random secret key
        JWT_EXPIRES_IN=7d # Token expiration time (e.g., 7d for 7 days)
        CORS_ORIGIN=* #or specify your frontend url for production
        ```

4.  **Start the Backend Server:**

    ```bash
    npm run start # or yarn start
    ```

5.  **Frontend Setup:**

    ```bash
    cd ../frontend
    npm install # or yarn install
    ```

6.  **Start the Frontend Development Server:**

    ```bash
    npm run start # or yarn start
    ```

## Usage Guide

1.  **Access the Application:**

    *   Open your web browser and navigate to the address where the frontend development server is running (typically `http://localhost:3000`).

2.  **User Authentication:**

    *   **Signup:** Create a new account by providing your name, email, and password.
    *   **Login:** Sign in with your registered email and password.

3.  **Browse Books:**

    *   View a list of books on the home page.
    *   Use the search bar and genre filters to narrow down your results.
    *   Sort books based on various criteria (e.g., title, rating, publication year).

4.  **Add a Book:**

    *   Click the "Add Book" button.
    *   Fill out the book details form and submit. (Requires authentication).

5.  **View Book Details:**

    *   Click on a book to view its details, reviews, and statistics.

6.  **Write a Review:**

    *   On the book details page, submit your review with a rating. (Requires authentication).

7.  **Edit/Delete a Book or Review:**

    *   Only the user who added the book or wrote the review can edit or delete it.

8.  **User Profile:**

    *   Access the profile page to view your added books and written reviews.

9.  **Switch Theme:**

    *   Click the theme toggle button (sun/moon icon) to switch between light and dark themes.

## API Documentation

The backend exposes the following API endpoints:

*   **Authentication:**
    *   `POST /api/auth/signup`: Register a new user.  Requires `name`, `email`, and `password` in the request body. Returns `access_token` and user details.
    *   `POST /api/auth/login`: Authenticate an existing user. Requires `email` and `password` in the request body. Returns `access_token` and user details.
    *   `GET /api/auth/me`: Get the currently authenticated user's information.  Requires a valid `Authorization` header with a Bearer token.  Returns user details.
*   **Books:**
    *   `GET /api/books`: List books with optional filters (pagination, search, genre, sorting). Query parameters are `page`, `limit`, `search`, `genre`, `sort_by`, and `sort_order`. Returns an array of book objects.
    *   `GET /api/books/genres`: Get a list of available book genres. Returns an object with a `genres` array.
    *   `POST /api/books`: Create a new book. Requires authentication (Bearer token).  Requires `title`, `author`, `description`, `genre`, and `published_year` in the request body. Returns the created book object.
    *   `GET /api/books/:id`: Get details of a specific book. Returns a book object.
    *   `PUT /api/books/:id`: Update a book. Requires authentication (Bearer token) and the book must be added by the current user. Requires `title`, `author`, `description`, `genre`, and `published_year` in the request body.  Returns the updated book object.
    *   `DELETE /api/books/:id`: Delete a book. Requires authentication (Bearer token) and the book must be added by the current user.  Returns a success message.
    *   `GET /api/books/:id/reviews`: Get all reviews for a specific book. Returns an array of review objects.
    *   `GET /api/books/:id/stats`: Get statistics for a specific book (rating distribution, sentiment analysis).  Returns an object with statistics.
*   **Reviews:**
    *   `POST /api/reviews`: Create a new review. Requires authentication (Bearer token). Requires `book_id`, `rating`, and `review_text` in the request body.  Returns the created review object.
    *   `PUT /api/reviews/:id`: Update a review. Requires authentication (Bearer token) and the review must be written by the current user. Requires `rating` and `review_text` in the request body.  Returns a success message.
    *   `DELETE /api/reviews/:id`: Delete a review. Requires authentication (Bearer token) and the review must be written by the current user.  Returns a success message.
*   **Health Check:**
    *   `GET /api/health`: Checks the health of the backend.

## Contributing Guidelines

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive commit messages.
4.  Test your changes thoroughly.
5.  Submit a pull request to the `main` branch.

## License Information

This project has no specified license.

## Contact/Support Information

For questions, bug reports, or feature requests, please create an issue on the GitHub repository.
