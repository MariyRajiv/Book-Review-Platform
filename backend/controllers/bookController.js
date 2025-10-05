import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Review from '../models/Review.js';

// Helper to map book object
function mapBook(book) {
  return {
    id: String(book._id),
    title: book.title,
    author: book.author,
    description: book.description,
    genre: book.genre,
    published_year: book.published_year,
    added_by: book.added_by ? String(book.added_by) : null,
    added_by_name: book.added_by_name || null,
    created_at: book.created_at,
    average_rating: book.average_rating !== undefined ? book.average_rating : 0,
    total_reviews: book.total_reviews !== undefined ? book.total_reviews : 0
  };
}

// List books
export const listBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '5'));
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const sort_by = req.query.sort_by || 'created_at';
    const sort_order = req.query.sort_order === 'asc' ? 1 : -1;

    const filter = {};
    if (search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (genre.trim() !== '') {
      filter.genre = genre.trim();
    }

    const skip = (page - 1) * limit;

    const books = await Book.find(filter)
      .sort({ [sort_by]: sort_order })
      .skip(skip)
      .limit(limit)
      .lean();

    const results = [];
    for (const b of books) {
      const stats = await Review.aggregate([
        { $match: { book: new mongoose.Types.ObjectId(b._id) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
      ]);
      const avg = stats[0] ? (stats[0].avg || 0) : 0;
      const total = stats[0] ? stats[0].total : 0;
      b.average_rating = avg;
      b.total_reviews = total;
      results.push(mapBook(b));
    }

    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Get genres
export const getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    const common = ['Fiction','Non-Fiction','Science Fiction','Fantasy','Mystery','Thriller','Biography','History','Self-Help','Business','Health'];
    const merged = Array.from(new Set([...genres.filter(Boolean), ...common]));
    return res.json({ genres: merged });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Create book
export const createBook = async (req, res) => {
  try {
    const { title, author, description, genre, published_year } = req.body;
    if (!title || !author) return res.status(400).json({ detail: 'Title and author are required' });

    const user = req.user;
    const book = new Book({
      title,
      author,
      description,
      genre,
      published_year,
      added_by: new mongoose.Types.ObjectId(user.id),
      added_by_name: user.name
    });

    await book.save();
    return res.status(201).json(mapBook(book.toObject()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Get single book
export const getBook = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid book id' });

    const book = await Book.findById(id).lean();
    if (!book) return res.status(404).json({ detail: 'Book not found' });

    const stats = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
    ]);
    book.average_rating = stats[0] ? (stats[0].avg || 0) : 0;
    book.total_reviews = stats[0] ? stats[0].total : 0;

    return res.json(mapBook(book));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Get book reviews
export const getBookReviews = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid book id' });

    const reviews = await Review.find({ book: id }).sort({ created_at: -1 }).lean();
    return res.json(reviews.map(r => ({
      id: String(r._id),
      user_id: String(r.user),
      user_name: r.user_name,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      updated_at: r.updated_at
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Get book stats
export const getBookStats = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid book id' });

    const agg = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const rating_distribution = { '1':0,'2':0,'3':0,'4':0,'5':0 };
    let total = 0, sum = 0;
    for (const row of agg) {
      rating_distribution[String(row._id)] = row.count;
      total += row.count;
      sum += row._id * row.count;
    }
    const average_rating = total ? (sum / total) : 0;

    const sentiment_distribution = {
      positive: (rating_distribution['4'] || 0) + (rating_distribution['5'] || 0),
      neutral: rating_distribution['3'] || 0,
      negative: (rating_distribution['1'] || 0) + (rating_distribution['2'] || 0)
    };

    return res.json({ rating_distribution, average_rating, total_reviews: total, sentiment_distribution });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Update book
export const updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid book id' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ detail: 'Book not found' });
    if (String(book.added_by) !== String(req.user.id)) return res.status(403).json({ detail: 'Not allowed' });

    const { title, author, description, genre, published_year } = req.body;
    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.genre = genre || book.genre;
    book.published_year = published_year || book.published_year;

    await book.save();
    return res.json(mapBook(book.toObject()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) 
        return res.status(400).json({ detail: 'Invalid book id' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ detail: 'Book not found' });
    if (String(book.added_by) !== String(req.user.id)) 
        return res.status(403).json({ detail: 'Not allowed' });

    await Review.deleteMany({ book: book._id });
    await book.deleteOne();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};
