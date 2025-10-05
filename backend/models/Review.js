import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review_text: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
}, { collection: 'reviews' });

module.exports = mongoose.model('Review', ReviewSchema);
