import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [search, genre, sortBy, sortOrder, page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (search.trim()) params.append('search', search.trim());
      if (genre) params.append('genre', genre);

      const response = await axios.get(`${BACKEND_URL}/api/books?${params}`);
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/books/genres`);
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Failed to fetch genres');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleGenreChange = (value) => {
    setGenre(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    const [sortField, order] = value.split('-');
    setSortBy(sortField);
    setSortOrder(order);
    setPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300"></i>);
    }

    return stars;
  };

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
                  <i className="fas fa-home mr-1"></i>Home
                </Link>
                <Link to="/add-book" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors font-medium">
                  <i className="fas fa-plus mr-1"></i>Add Book
                </Link>
                <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors font-medium">
                  <i className="fas fa-user mr-1"></i>Profile
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:block">
                Welcome, {user?.name}!
              </span>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-gray-600 dark:text-gray-300`}></i>
              </button>
              <Button variant="ghost" onClick={logout}>
                <i className="fas fa-sign-out-alt mr-1"></i>Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title and Add Book Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-white mb-2">
              Discover Amazing Books
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Explore our community's book collection and find your next great read
            </p>
          </div>
          <Button onClick={() => navigate('/add-book')} size="lg" className="mt-4 md:mt-0">
            <i className="fas fa-plus mr-2"></i>Add New Book
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter Section */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Search books, authors, or descriptions..." value={search} onChange={handleSearch} className="h-11" />
                  <Select value={genre || 'all'} onValueChange={handleGenreChange}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Filter by genre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {genres.map((genreItem) => <SelectItem key={genreItem} value={genreItem}>{genreItem}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at-desc">Newest First</SelectItem>
                      <SelectItem value="created_at-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title A-Z</SelectItem>
                      <SelectItem value="title-desc">Title Z-A</SelectItem>
                      <SelectItem value="average_rating-desc">Highest Rated</SelectItem>
                      <SelectItem value="average_rating-asc">Lowest Rated</SelectItem>
                      <SelectItem value="published_year-desc">Recently Published</SelectItem>
                      <SelectItem value="published_year-asc">Older Publications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Books Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : books.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <i className="fas fa-book-open text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No books found</h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">{search || genre ? 'Try adjusting your search or filters.' : 'Be the first to add a book to the collection!'}</p>
                  {!search && !genre && <Button onClick={() => navigate('/add-book')}><i className="fas fa-plus mr-2"></i>Add First Book</Button>}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {books.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
                        <div className="flex items-center space-x-1">
                          {renderStars(book.average_rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({book.total_reviews})</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-serif group-hover:text-teal-600 transition-colors line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="text-base">by {book.author} • {book.published_year}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{book.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span><i className="fas fa-user mr-1"></i>Added by {book.added_by_name}</span>
                        <span><i className="fas fa-star mr-1 text-yellow-400"></i>{book.average_rating.toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>
                <i className="fas fa-chevron-left mr-1"></i>Previous
              </Button>
              <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-md border text-sm">Page {page}</span>
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={books.length < 5 || loading}>
                Next<i className="fas fa-chevron-right ml-1"></i>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/add-book')}>
                  <i className="fas fa-plus mr-2"></i>Add New Book
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                  <i className="fas fa-user mr-2"></i>View Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { setSearch(''); setGenre(''); setSortBy('created_at'); setSortOrder('desc'); setPage(1); }}>
                  <i className="fas fa-filter mr-2"></i>Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
