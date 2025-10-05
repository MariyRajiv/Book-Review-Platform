import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, default: '' },
  genre: { type: String, default: '' },
  published_year: { type: Number },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  added_by_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'books' });

const Book = mongoose.model('Book', BookSchema);

export default Book; 
