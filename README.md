

# 📚 Book Review Platform

A full-stack platform where users can **discover**, **review**, and **share** their thoughts on books. Built with **Node.js**, **MongoDB**, and **React**, it features authentication, book management, review system, and more.


## ✨ Features

* 🔐 **User Authentication** — Signup/Login with hashed passwords and JWT.
* 📚 **Book Management** — Add, edit, delete, and browse books.
* 📝 **Review System** — Submit one review per book with ratings.
* 🎯 **Filtering & Sorting** — Search books, filter by genre, and sort by title, year, or rating.
* 📊 **Book Statistics** — View rating distribution & sentiment analysis.
* 👤 **User Profile** — See your added books and written reviews.
* 🌗 **Theme Toggle** — Switch between light and dark mode.
* 🚫 **Protected Routes** — Access control using authentication middleware.
* 🔔 **Toaster Notifications** — Feedback for success and error actions.
* ⚙️ **Health Check** — API endpoint to check server status.

---

## 🛠️ Tech Stack

### 🔧 Backend

* **Node.js**, **Express.js**
* **MongoDB**, **Mongoose**
* **JWT**, **bcryptjs**
* **dotenv**, **helmet**, **cors**, **morgan**

### 🎨 Frontend

* **React**, **React Router**
* **Tailwind CSS**, **Radix UI**
* **Axios**, **Sonner**, **Recharts**

---

## 🚀 Getting Started

### ✅ Prerequisites

* [Node.js](https://nodejs.org/) (v18+)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [MongoDB](https://www.mongodb.com/)

---

### 📥 Installation

```bash
git clone https://github.com/MariyRajiv/Book-Review-Platform.git
cd Book-Review-Platform
```

#### 🔌 Backend Setup

```bash
cd backend
npm install # or yarn install
```

1. Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=* # or specify your frontend URL
```

2. Start the backend server:

```bash
npm run start # or yarn start
```

#### 💻 Frontend Setup

```bash
cd ../frontend
npm install # or yarn install
npm run start # or yarn start
```

---

## 💡 Usage Guide

1. Visit `http://localhost:3000`
2. **Signup/Login** to get started
3. **Browse Books** using search, filters, and sorting
4. **Add or View Book Details**
5. **Write/Manage Reviews** *(one per book)*
6. **Check Book Stats** including rating and sentiment analysis
7. View your **Profile** with added books and reviews
8. Toggle between **Light/Dark Mode**

---

## 📦 API Endpoints

### 🔐 Authentication

* `POST /api/auth/signup` – Register a user
* `POST /api/auth/login` – Login user
* `GET /api/auth/me` – Get authenticated user

### 📚 Books

* `GET /api/books` – List books (with filters)
* `GET /api/books/genres` – Get distinct genres
* `POST /api/books` – Add a book *(auth required)*
* `GET /api/books/:id` – Get book details
* `PUT /api/books/:id` – Update a book *(owner only)*
* `DELETE /api/books/:id` – Delete a book *(owner only)*
* `GET /api/books/:id/reviews` – Get all reviews for a book
* `GET /api/books/:id/stats` – Get stats (ratings & sentiment)

### 📝 Reviews

* `POST /api/reviews` – Add a review *(auth required)*
* `PUT /api/reviews/:id` – Update a review *(owner only)*
* `DELETE /api/reviews/:id` – Delete a review *(owner only)*

### 🛠️ Health Check

* `GET /api/health` – Backend status check

---

## 📁 Project Structure

```bash
Book-Review-Platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
├── README.md
└── package.json
```

---

## 🙌 Contributing

We welcome contributions!

1. 🍴 Fork the repository
2. 🛠 Create a feature branch
3. 💬 Commit descriptive messages
4. ✅ Test your changes
5. 📩 Open a Pull Request to `main`

---

