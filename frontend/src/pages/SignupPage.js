import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth, useTheme } from '../App';
import { toast } from 'sonner';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long.');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
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
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        toast.success('Account created successfully! Welcome to PageTurner.');
        navigate('/');
      } else {
        toast.error(result.error || 'Signup failed. Please try again.');
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
          src="https://images.unsplash.com/photo-1648905755287-b5c721ab36c9" 
          alt="Books background"
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
              Join PageTurner
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              Create your account and start discovering amazing books
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  data-testid="name-input"
                  className="h-12"
                />
              </div>

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
                  placeholder="Enter your email address"
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
                  placeholder="Create a strong password"
                  required
                  data-testid="password-input"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  data-testid="confirm-password-input"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium mt-6"
                disabled={loading}
                data-testid="signup-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
                  data-testid="login-link"
                >
                  Sign In
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

        {/* Terms Notice */}
        <Card className="mt-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
              <i className="fas fa-shield-alt mr-1"></i>
              By creating an account, you agree to our community guidelines and start your personalized reading journey.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;