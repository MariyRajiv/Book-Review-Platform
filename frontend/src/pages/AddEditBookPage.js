import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';

const AddEditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    published_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [genres, setGenres] = useState([]);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const commonGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'Thriller', 'Biography', 'History', 'Self-Help', 'Business', 'Health',
    'Travel', 'Cooking', 'Art', 'Philosophy', 'Religion', 'Poetry',
    'Drama', 'Horror', 'Adventure', 'Crime', 'Contemporary', 'Classic'
  ];

  useEffect(() => {
    fetchGenres();
    if (isEditMode) {
      fetchBookDetails();
    }
  }, [id, isEditMode]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/genres`);
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Failed to fetch genres');
    }
  };

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/books/${id}`);
      const book = response.data;
      
      // Check if current user is the owner
      if (book.added_by !== user?.id) {
        toast.error('You can only edit your own books');
        navigate('/');
        return;
      }

      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre,
        published_year: book.published_year.toString()
      });
    } catch (error) {
      toast.error('Failed to fetch book details');
      navigate('/');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenreChange = (value) => {
    setFormData({
      ...formData,
      genre: value
    });
  };

  const validateForm = () => {
    const { title, author, description, genre, published_year } = formData;

    if (!title.trim()) {
      toast.error('Please enter a book title');
      return false;
    }

    if (!author.trim()) {
      toast.error('Please enter the author name');
      return false;
    }

    if (!description.trim()) {
      toast.error('Please enter a book description');
      return false;
    }

    if (!genre) {
      toast.error('Please select a genre');
      return false;
    }

    const year = parseInt(published_year);
    const currentYear = new Date().getFullYear();
    
    if (!published_year || isNaN(year) || year < 1000 || year > currentYear) {
      toast.error(`Please enter a valid publication year (1000-${currentYear})`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        genre: formData.genre,
        published_year: parseInt(formData.published_year)
      };

      if (isEditMode) {
        await axios.put(`${BACKEND_URL}/api/books/${id}`, bookData);
        toast.success('Book updated successfully!');
        navigate(`/book/${id}`);
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/books`, bookData);
        toast.success('Book added successfully!');
        navigate(`/book/${response.data.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'add'} book`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
                <span className="text-teal-600 font-medium">
                  <i className="fas fa-plus mr-1"></i>
                  {isEditMode ? 'Edit Book' : 'Add Book'}
                </span>
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
          onClick={() => navigate(isEditMode ? `/book/${id}` : '/')}
          className="mb-6"
          data-testid="back-btn"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          {isEditMode ? 'Back to Book' : 'Back to Home'}
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white">
                {isEditMode ? 'Edit Book' : 'Add New Book'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isEditMode 
                  ? 'Update the book details below' 
                  : 'Share a great book with the community'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Book Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter the book title"
                    required
                    data-testid="title-input"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm font-medium">
                    Author *
                  </Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter the author's name"
                    required
                    data-testid="author-input"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-sm font-medium">
                    Genre *
                  </Label>
                  <Select value={formData.genre} onValueChange={handleGenreChange}>
                    <SelectTrigger className="h-12" data-testid="genre-select">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show existing genres first */}
                      {genres.length > 0 && (
                        <>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                          <SelectItem value="separator" disabled>
                            ────────────────
                          </SelectItem>
                        </>
                      )}
                      
                      {/* Show common genres */}
                      {commonGenres
                        .filter(genre => !genres.includes(genre))
                        .map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published_year" className="text-sm font-medium">
                    Publication Year *
                  </Label>
                  <Input
                    id="published_year"
                    name="published_year"
                    type="number"
                    value={formData.published_year}
                    onChange={handleChange}
                    placeholder="e.g., 2023"
                    min="1000"
                    max={new Date().getFullYear()}
                    required
                    data-testid="year-input"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write a compelling description of the book..."
                    rows={6}
                    required
                    data-testid="description-textarea"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Describe what makes this book special. Include plot summary, themes, or why you recommend it.
                  </p>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 h-12 text-base font-medium"
                    data-testid="submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2"></div>
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEditMode ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                        {isEditMode ? 'Update Book' : 'Add Book'}
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate(isEditMode ? `/book/${id}` : '/')}
                    className="h-12 px-6"
                    disabled={loading}
                    data-testid="cancel-btn"
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Help Section */}
              <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Tips for a great book entry:
                </h4>
                <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
                  <li>• Use the exact title and author name as published</li>
                  <li>• Write a detailed description that helps others decide if they want to read it</li>
                  <li>• Choose the most appropriate genre for discoverability</li>
                  <li>• Double-check the publication year for accuracy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddEditBookPage;