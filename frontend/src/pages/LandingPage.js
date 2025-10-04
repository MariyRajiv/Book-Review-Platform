import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useTheme } from '../App';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-book text-3xl text-teal-600"></i>
            <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-white">PageTurner</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-testid="theme-toggle-btn"
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg text-gray-600 dark:text-gray-300`}></i>
            </button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              data-testid="login-nav-btn"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              data-testid="signup-nav-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold font-serif text-slate-800 dark:text-white mb-6">
            Discover Your Next
            <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent"> Great Read</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Share your thoughts, discover amazing books, and connect with fellow readers in our vibrant community. 
            Get AI-powered recommendations tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-4"
              data-testid="hero-signup-btn"
            >
              <i className="fas fa-rocket mr-2"></i>
              Start Reading Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-4"
              data-testid="hero-login-btn"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <img 
            src="https://images.unsplash.com/photo-1587029552319-93525c70c754" 
            alt="Person reading outdoors"
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif text-slate-800 dark:text-white mb-4">
            Why Choose PageTurner?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Experience reading like never before with our innovative features designed for book lovers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <i className="fas fa-brain text-2xl text-teal-600"></i>
              </div>
              <CardTitle className="text-xl mb-2">AI-Powered Recommendations</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Get personalized book suggestions based on your reading history and preferences using advanced AI technology.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-2xl text-orange-600"></i>
              </div>
              <CardTitle className="text-xl mb-2">Vibrant Community</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Connect with fellow book lovers, share reviews, and discover hidden gems through community recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-bar text-2xl text-purple-600"></i>
              </div>
              <CardTitle className="text-xl mb-2">Smart Analytics</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Track your reading progress, analyze review sentiments, and explore detailed statistics about books and ratings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Library Image Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1547057981-d08930168f03" 
              alt="Colorful bookstore"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold font-serif text-slate-800 dark:text-white">
              Explore Endless Possibilities
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              From classic literature to contemporary fiction, from scientific discoveries to fantasy adventures - 
              our platform helps you navigate through thousands of books with ease.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="fas fa-check-circle text-teal-600"></i>
                <span className="text-slate-600 dark:text-slate-300">Advanced search and filtering</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-check-circle text-teal-600"></i>
                <span className="text-slate-600 dark:text-slate-300">Detailed book statistics and reviews</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-check-circle text-teal-600"></i>
                <span className="text-slate-600 dark:text-slate-300">Personalized reading lists</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-orange-600 py-16 mt-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold font-serif text-white mb-6">
            Ready to Begin Your Reading Adventure?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who have discovered their next favorite book through our platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/signup')}
            className="bg-white text-teal-700 hover:bg-gray-100 text-lg px-8 py-4"
            data-testid="cta-signup-btn"
          >
            <i className="fas fa-book-reader mr-2"></i>
            Join PageTurner Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-book text-2xl text-teal-400"></i>
            <h3 className="text-xl font-bold font-serif">PageTurner</h3>
          </div>
          <p className="text-slate-400">
            Connecting readers worldwide through the power of books and community.
          </p>
          <p className="text-slate-500 text-sm mt-4">
            © 2025 PageTurner. Made with ❤️ for book lovers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;