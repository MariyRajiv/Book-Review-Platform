import Review from '../models/Review.js';
import Book from '../models/Book.js';
import mongoose from 'mongoose';


exports.createReview = async (req, res) => {
  try {
    const { book_id, rating, review_text } = req.body;
    if (!book_id || rating === undefined) 
      return res.status(400).json({ detail: 'book_id and rating required' });

    if (!mongoose.Types.ObjectId.isValid(book_id)) 
      return res.status(400).json({ detail: 'Invalid book id' });

    const book = await Book.findById(book_id);
    if (!book) return res.status(404).json({ detail: 'Book not found' });

    // Check if user already reviewed
    const existing = await Review.findOne({ 
      book: book._id, 
      user: new mongoose.Types.ObjectId(req.user.id) 
    });
    if (existing) 
      return res.status(400).json({ detail: 'You have already reviewed this book. Edit your review instead.' });

    const review = new Review({
      book: book._id,
      user: new mongoose.Types.ObjectId(req.user.id),
      user_name: req.user.name,
      rating,
      review_text
    });

    await review.save();

    return res.status(201).json({
      id: String(review._id),
      book_id: String(review.book),
      user_id: String(review.user),
      user_name: review.user_name,
      rating: review.rating,
      review_text: review.review_text,
      created_at: review.created_at
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ detail: 'Invalid review id' });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ detail: 'Review not found' });
    if (String(review.user) !== String(req.user.id)) 
      return res.status(403).json({ detail: 'Not allowed' });

    const { rating, review_text } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (review_text !== undefined) review.review_text = review_text;
    review.updated_at = new Date();

    await review.save();
    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ detail: 'Invalid review id' });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ detail: 'Review not found' });
    if (String(review.user) !== String(req.user.id)) 
      return res.status(403).json({ detail: 'Not allowed' });

    await review.remove();
    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};
