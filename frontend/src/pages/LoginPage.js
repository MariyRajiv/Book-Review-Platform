import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Welcome back! Login successful.');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1652940113952-71e4eeca0539" 
          alt="Reading background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-flex items-center space-x-2 mb-6 group">
            <i className="fas fa-book text-3xl text-teal-600 group-hover:scale-110 transition-transform"></i>
            <span className="text-2xl font-bold font-serif text-slate-800 dark:text-white">PageTurner</span>
          </Link>
          <div className="absolute top-0 right-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-testid="theme-toggle-btn"
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg text-gray-600 dark:text-gray-300`}></i>
            </button>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold font-serif text-slate-800 dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              Sign in to continue your reading journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  data-testid="email-input"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  data-testid="password-input"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium mt-6"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account yet?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
                  data-testid="signup-link"
                >
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/landing" 
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                data-testid="back-to-landing-link"
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Landing
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-4 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
          <CardContent className="p-4">
            <p className="text-sm text-teal-700 dark:text-teal-300 text-center">
              <i className="fas fa-info-circle mr-1"></i>
              New here? Create an account to get started with personalized book recommendations!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;