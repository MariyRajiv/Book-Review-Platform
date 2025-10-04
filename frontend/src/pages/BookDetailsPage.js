import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: '', review_text: '' });
  const [editingReview, setEditingReview] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchBookDetails();
    fetchReviews();
    fetchStats();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/books/${id}`);
      setBook(response.data);
    } catch (error) {
      toast.error('Failed to fetch book details');
      navigate('/');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/books/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/books/${id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!newReview.rating || !newReview.review_text.trim()) {
      toast.error('Please provide both rating and review text');
      return;
    }

    setReviewLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/reviews`, {
        book_id: id,
        rating: parseInt(newReview.rating),
        review_text: newReview.review_text.trim()
      });

      toast.success('Review submitted successfully!');
      setNewReview({ rating: '', review_text: '' });
      fetchReviews();
      fetchBookDetails();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = async (reviewId, updatedData) => {
    try {
      await axios.put(`${BACKEND_URL}/api/reviews/${reviewId}`, updatedData);
      toast.success('Review updated successfully!');
      setEditingReview(null);
      fetchReviews();
      fetchBookDetails();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      fetchReviews();
      fetchBookDetails();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Are you sure you want to delete this book? This will also delete all reviews.')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/books/${id}`);
      toast.success('Book deleted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`fas fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const prepareRatingData = () => {
    if (!stats?.rating_distribution) return [];
    
    return Object.entries(stats.rating_distribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating !== '1' ? 's' : ''}`,
      count
    }));
  };

  const prepareSentimentData = () => {
    if (!stats?.sentiment_distribution) return [];
    
    const colors = { positive: '#22c55e', negative: '#ef4444', neutral: '#6b7280' };
    
    return Object.entries(stats.sentiment_distribution).map(([sentiment, count]) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: count,
      fill: colors[sentiment]
    }));
  };

  const userReview = reviews.find(review => review.user_id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 group">
                <i className="fas fa-book text-2xl text-teal-600 group-hover:scale-110 transition-transform"></i>
                <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-white">PageTurner</h1>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors font-medium">
                  <i className="fas fa-home mr-1"></i>
                  Home
                </Link>
                <Link to="/add-book" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors font-medium">
                  <i className="fas fa-plus mr-1"></i>
                  Add Book
                </Link>
                <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors font-medium">
                  <i className="fas fa-user mr-1"></i>
                  Profile
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:block">
                Welcome, {user?.name}!
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                data-testid="theme-toggle-btn"
              >
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-gray-600 dark:text-gray-300`}></i>
              </button>
              <Button variant="ghost" onClick={logout} data-testid="logout-btn">
                <i className="fas fa-sign-out-alt mr-1"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
          data-testid="back-btn"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Books
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Book Details */}
            <Card className="mb-8" data-testid="book-details-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary">{book?.genre}</Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(book?.average_rating || 0)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {book?.average_rating?.toFixed(1)} ({book?.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white mb-2">
                      {book?.title}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      by {book?.author} • Published in {book?.published_year}
                    </CardDescription>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      <i className="fas fa-user mr-1"></i>
                      Added by {book?.added_by_name} on {new Date(book?.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {book?.added_by === user?.id && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/edit-book/${id}`)}
                        data-testid="edit-book-btn"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteBook}
                        data-testid="delete-book-btn"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  {book?.description}
                </p>
              </CardContent>
            </Card>

            {/* Add Review Form */}
            {!userReview && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Write a Review</CardTitle>
                  <CardDescription>
                    Share your thoughts about this book with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Rating
                      </label>
                      <Select 
                        value={newReview.rating} 
                        onValueChange={(value) => setNewReview({...newReview, rating: value})}
                      >
                        <SelectTrigger data-testid="rating-select">
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                          <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                          <SelectItem value="1">⭐ (1 star)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Review
                      </label>
                      <Textarea
                        value={newReview.review_text}
                        onChange={(e) => setNewReview({...newReview, review_text: e.target.value})}
                        placeholder="Write your review here..."
                        rows={4}
                        data-testid="review-textarea"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={reviewLoading}
                      data-testid="submit-review-btn"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Submit Review
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-comments text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Be the first to share your thoughts about this book!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-slate-800 dark:text-white">
                                {review.user_name}
                              </h4>
                              {review.sentiment && (
                                <Badge variant="secondary" className={`text-xs ${getSentimentColor(review.sentiment)}`}>
                                  {review.sentiment}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {review.user_id === user?.id && (
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingReview(review)}
                                data-testid={`edit-review-btn-${review.id}`}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteReview(review.id)}
                                data-testid={`delete-review-btn-${review.id}`}
                              >
                                <i className="fas fa-trash text-red-500"></i>
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {editingReview?.id === review.id ? (
                          <EditReviewForm
                            review={review}
                            onSave={(updatedData) => handleEditReview(review.id, updatedData)}
                            onCancel={() => setEditingReview(null)}
                          />
                        ) : (
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Statistics */}
            {stats && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <i className="fas fa-chart-bar mr-2 text-teal-600"></i>
                    Book Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Rating Distribution */}
                    <div>
                      <h4 className="font-medium mb-3">Rating Distribution</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={prepareRatingData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#14b8a6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Sentiment Distribution */}
                    {stats.sentiment_distribution && Object.values(stats.sentiment_distribution).some(count => count > 0) && (
                      <div>
                        <h4 className="font-medium mb-3">Sentiment Analysis</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={prepareSentimentData()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({name, value}) => `${name}: ${value}`}
                            >
                              {prepareSentimentData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {stats.total_reviews}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Reviews
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {book?.average_rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Average Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong className="text-sm text-gray-600 dark:text-gray-400">Genre:</strong>
                  <p className="font-medium">{book?.genre}</p>
                </div>
                <div>
                  <strong className="text-sm text-gray-600 dark:text-gray-400">Published:</strong>
                  <p className="font-medium">{book?.published_year}</p>
                </div>
                <div>
                  <strong className="text-sm text-gray-600 dark:text-gray-400">Added by:</strong>
                  <p className="font-medium">{book?.added_by_name}</p>
                </div>
                <div>
                  <strong className="text-sm text-gray-600 dark:text-gray-400">Date Added:</strong>
                  <p className="font-medium">{new Date(book?.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Review Form Component
const EditReviewForm = ({ review, onSave, onCancel }) => {
  const [rating, setRating] = useState(review.rating.toString());
  const [reviewText, setReviewText] = useState(review.review_text);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        rating: parseInt(rating),
        review_text: reviewText.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger>
            <SelectValue placeholder="Select a rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
            <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
            <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
            <SelectItem value="1">⭐ (1 star)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
      />
      
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default BookDetailsPage;