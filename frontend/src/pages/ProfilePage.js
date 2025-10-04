import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReviews: 0,
    averageRating: 0,
    genreDistribution: {},
    ratingDistribution: {}
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyBooks(),
        fetchMyReviews()
      ]);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBooks = async () => {
    try {
      // Fetch all books and filter by user
      const response = await axios.get(`${BACKEND_URL}/api/books?limit=100`);
      const userBooks = response.data.filter(book => book.added_by === user?.id);
      setMyBooks(userBooks);
    } catch (error) {
      console.error('Failed to fetch user books');
    }
  };

  const fetchMyReviews = async () => {
    try {
      // Fetch all books to get reviews for each
      const booksResponse = await axios.get(`${BACKEND_URL}/api/books?limit=100`);
      const allBooks = booksResponse.data;
      
      const userReviews = [];
      
      // Fetch reviews for each book and filter by user
      for (const book of allBooks) {
        try {
          const reviewsResponse = await axios.get(`${BACKEND_URL}/api/books/${book.id}/reviews`);
          const bookUserReviews = reviewsResponse.data.filter(review => review.user_id === user?.id);
          
          // Add book info to reviews
          bookUserReviews.forEach(review => {
            userReviews.push({
              ...review,
              book_title: book.title,
              book_author: book.author,
              book_genre: book.genre
            });
          });
        } catch (error) {
          console.error(`Failed to fetch reviews for book ${book.id}`);
        }
      }
      
      setMyReviews(userReviews);
      calculateStats(myBooks, userReviews);
    } catch (error) {
      console.error('Failed to fetch user reviews');
    }
  };

  const calculateStats = (books, reviews) => {
    const genreDistribution = {};
    const ratingDistribution = {};

    // Calculate genre distribution from user's books
    books.forEach(book => {
      genreDistribution[book.genre] = (genreDistribution[book.genre] || 0) + 1;
    });

    // Calculate rating distribution from user's reviews
    reviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    setStats({
      totalBooks: books.length,
      totalReviews: reviews.length,
      averageRating: averageRating,
      genreDistribution,
      ratingDistribution
    });
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book? This will also delete all reviews.')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/books/${bookId}`);
      toast.success('Book deleted successfully!');
      fetchUserData();
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

  const prepareGenreChartData = () => {
    const colors = [
      '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899'
    ];
    
    return Object.entries(stats.genreDistribution).map(([genre, count], index) => ({
      name: genre,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const prepareRatingChartData = () => {
    return Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating !== '1' ? 's' : ''}`,
      count
    }));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your profile...</p>
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
                <span className="text-teal-600 font-medium">
                  <i className="fas fa-user mr-1"></i>
                  Profile
                </span>
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
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-2xl text-teal-600"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif text-slate-800 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-600">{stats.totalBooks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Books Added</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-600">{stats.totalReviews}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reviews Written</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-600">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating Given</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-teal-600">
                  {Object.keys(stats.genreDistribution).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Genres Explored</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="books" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="books" data-testid="books-tab">
                  My Books ({stats.totalBooks})
                </TabsTrigger>
                <TabsTrigger value="reviews" data-testid="reviews-tab">
                  My Reviews ({stats.totalReviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="books" data-testid="books-content">
                {myBooks.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <i className="fas fa-book-open text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No books added yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Start building your library by adding your first book!
                      </p>
                      <Button onClick={() => navigate('/add-book')} data-testid="add-first-book-btn">
                        <i className="fas fa-plus mr-2"></i>
                        Add Your First Book
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {myBooks.map((book) => (
                      <Card key={book.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {book.genre}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {renderStars(book.average_rating)}
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                ({book.total_reviews})
                              </span>
                            </div>
                          </div>
                          <CardTitle 
                            className="text-xl font-serif hover:text-teal-600 transition-colors cursor-pointer line-clamp-2"
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            {book.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            by {book.author} • {book.published_year}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                            {book.description}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Added {new Date(book.created_at).toLocaleDateString()}
                            </span>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/edit-book/${book.id}`)}
                                data-testid={`edit-book-btn-${book.id}`}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteBook(book.id)}
                                data-testid={`delete-book-btn-${book.id}`}
                              >
                                <i className="fas fa-trash text-red-500"></i>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" data-testid="reviews-content">
                {myReviews.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <i className="fas fa-comments text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No reviews written yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Explore books and share your thoughts with the community!
                      </p>
                      <Button onClick={() => navigate('/')} data-testid="explore-books-btn">
                        <i className="fas fa-search mr-2"></i>
                        Explore Books
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {myReviews.map((review) => (
                      <Card key={review.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                                {review.sentiment && (
                                  <Badge variant="secondary" className={`text-xs ${getSentimentColor(review.sentiment)}`}>
                                    {review.sentiment}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle 
                                className="text-lg font-serif hover:text-teal-600 transition-colors cursor-pointer"
                                onClick={() => navigate(`/book/${review.book_id}`)}
                              >
                                {review.book_title}
                              </CardTitle>
                              <CardDescription>
                                by {review.book_author} • {review.book_genre}
                              </CardDescription>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {review.review_text}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with Charts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Genre Distribution */}
            {Object.keys(stats.genreDistribution).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Genre Distribution</CardTitle>
                  <CardDescription>Books you've added by genre</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={prepareGenreChartData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, value}) => `${name}: ${value}`}
                      >
                        {prepareGenreChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Rating Distribution */}
            {Object.keys(stats.ratingDistribution).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Rating Patterns</CardTitle>
                  <CardDescription>Distribution of ratings you've given</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={prepareRatingChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" fontSize={10} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/add-book')}
                  data-testid="quick-add-book-btn"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add New Book
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                  data-testid="quick-explore-books-btn"
                >
                  <i className="fas fa-search mr-2"></i>
                  Explore Books
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;