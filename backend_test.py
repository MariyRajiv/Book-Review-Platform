#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class BookReviewPlatformTester:
    def __init__(self, base_url="https://pageturner-68.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"testuser{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        self.test_book = {
            "title": "Test Book for API Testing",
            "author": "Test Author",
            "description": "This is a comprehensive test book description for API testing purposes.",
            "genre": "Fiction",
            "published_year": 2023
        }

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def make_request(self, method, endpoint, expected_status, data=None, description=""):
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                error_detail = ""
                try:
                    error_data = response.json()
                    error_detail = error_data.get('detail', str(error_data))
                except:
                    error_detail = response.text[:200]
                
                return False, {
                    "status_code": response.status_code,
                    "error": error_detail
                }

        except requests.exceptions.Timeout:
            return False, {"error": "Request timeout"}
        except requests.exceptions.ConnectionError:
            return False, {"error": "Connection error"}
        except Exception as e:
            return False, {"error": str(e)}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.make_request('GET', '', 200)
        self.log_test("Root API Endpoint", success, 
                     "" if success else response.get('error', ''), 200, 
                     response.get('status_code') if not success else 200)
        return success

    def test_user_signup(self):
        """Test user registration"""
        success, response = self.make_request('POST', 'auth/signup', 200, self.test_user)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.log_test("User Signup", True)
            return True
        else:
            error_msg = response.get('error', 'No access token in response')
            self.log_test("User Signup", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        success, response = self.make_request('POST', 'auth/login', 200, login_data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log_test("User Login", True)
            return True
        else:
            error_msg = response.get('error', 'Login failed')
            self.log_test("User Login", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', 'auth/me', 200)
        
        if success and 'id' in response:
            self.log_test("Get Current User", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get user info')
            self.log_test("Get Current User", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_create_book(self):
        """Test creating a book"""
        success, response = self.make_request('POST', 'books', 200, self.test_book)
        
        if success and 'id' in response:
            self.book_id = response['id']
            self.log_test("Create Book", True)
            return True, response['id']
        else:
            error_msg = response.get('error', 'Failed to create book')
            self.log_test("Create Book", False, error_msg, 200, 
                         response.get('status_code'))
            return False, None

    def test_get_books(self):
        """Test getting books list"""
        success, response = self.make_request('GET', 'books', 200)
        
        if success and isinstance(response, list):
            self.log_test("Get Books List", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get books')
            self.log_test("Get Books List", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_get_book_by_id(self, book_id):
        """Test getting a specific book"""
        success, response = self.make_request('GET', f'books/{book_id}', 200)
        
        if success and 'id' in response:
            self.log_test("Get Book by ID", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get book')
            self.log_test("Get Book by ID", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_search_books(self):
        """Test book search functionality"""
        success, response = self.make_request('GET', 'books?search=Test', 200)
        
        if success and isinstance(response, list):
            self.log_test("Search Books", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to search books')
            self.log_test("Search Books", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_filter_books_by_genre(self):
        """Test filtering books by genre"""
        success, response = self.make_request('GET', 'books?genre=Fiction', 200)
        
        if success and isinstance(response, list):
            self.log_test("Filter Books by Genre", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to filter books')
            self.log_test("Filter Books by Genre", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_get_genres(self):
        """Test getting available genres"""
        success, response = self.make_request('GET', 'genres', 200)
        
        if success and 'genres' in response:
            self.log_test("Get Genres", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get genres')
            self.log_test("Get Genres", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_create_review(self, book_id):
        """Test creating a book review"""
        review_data = {
            "book_id": book_id,
            "rating": 5,
            "review_text": "This is an excellent test book! Highly recommended for API testing purposes."
        }
        
        success, response = self.make_request('POST', 'reviews', 200, review_data)
        
        if success and 'id' in response:
            self.review_id = response['id']
            self.log_test("Create Review", True)
            return True, response['id']
        else:
            error_msg = response.get('error', 'Failed to create review')
            self.log_test("Create Review", False, error_msg, 200, 
                         response.get('status_code'))
            return False, None

    def test_get_book_reviews(self, book_id):
        """Test getting reviews for a book"""
        success, response = self.make_request('GET', f'books/{book_id}/reviews', 200)
        
        if success and isinstance(response, list):
            self.log_test("Get Book Reviews", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get reviews')
            self.log_test("Get Book Reviews", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_update_review(self, review_id):
        """Test updating a review"""
        update_data = {
            "rating": 4,
            "review_text": "Updated review text for testing purposes."
        }
        
        success, response = self.make_request('PUT', f'reviews/{review_id}', 200, update_data)
        
        if success:
            self.log_test("Update Review", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to update review')
            self.log_test("Update Review", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_get_book_stats(self, book_id):
        """Test getting book statistics"""
        success, response = self.make_request('GET', f'books/{book_id}/stats', 200)
        
        if success and 'total_reviews' in response:
            self.log_test("Get Book Statistics", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to get book stats')
            self.log_test("Get Book Statistics", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_ai_recommendations(self):
        """Test AI recommendations"""
        print("\n🤖 Testing AI Recommendations (this may take a few seconds)...")
        success, response = self.make_request('GET', 'ai/recommendations', 200)
        
        if success and 'recommendations' in response:
            recommendations = response['recommendations']
            if isinstance(recommendations, list):
                self.log_test("AI Recommendations", True)
                print(f"   📚 Received {len(recommendations)} recommendations")
                return True
            else:
                self.log_test("AI Recommendations", False, "Invalid recommendations format")
                return False
        else:
            error_msg = response.get('error', 'Failed to get AI recommendations')
            self.log_test("AI Recommendations", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_update_book(self, book_id):
        """Test updating a book"""
        update_data = {
            "title": "Updated Test Book Title",
            "description": "Updated description for testing purposes."
        }
        
        success, response = self.make_request('PUT', f'books/{book_id}', 200, update_data)
        
        if success:
            self.log_test("Update Book", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to update book')
            self.log_test("Update Book", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_delete_review(self, review_id):
        """Test deleting a review"""
        success, response = self.make_request('DELETE', f'reviews/{review_id}', 200)
        
        if success:
            self.log_test("Delete Review", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to delete review')
            self.log_test("Delete Review", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def test_delete_book(self, book_id):
        """Test deleting a book"""
        success, response = self.make_request('DELETE', f'books/{book_id}', 200)
        
        if success:
            self.log_test("Delete Book", True)
            return True
        else:
            error_msg = response.get('error', 'Failed to delete book')
            self.log_test("Delete Book", False, error_msg, 200, 
                         response.get('status_code'))
            return False

    def run_comprehensive_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)

        # Test basic connectivity
        if not self.test_root_endpoint():
            print("❌ Cannot connect to API. Stopping tests.")
            return False

        # Authentication tests
        print("\n🔐 Testing Authentication...")
        if not self.test_user_signup():
            print("❌ Signup failed. Stopping tests.")
            return False

        if not self.test_user_login():
            print("❌ Login failed. Stopping tests.")
            return False

        if not self.test_get_current_user():
            print("❌ Get current user failed.")

        # Book management tests
        print("\n📚 Testing Book Management...")
        book_created, book_id = self.test_create_book()
        if not book_created:
            print("❌ Book creation failed. Skipping related tests.")
            return False

        self.test_get_books()
        self.test_get_book_by_id(book_id)
        self.test_search_books()
        self.test_filter_books_by_genre()
        self.test_get_genres()
        self.test_update_book(book_id)

        # Review system tests
        print("\n⭐ Testing Review System...")
        review_created, review_id = self.test_create_review(book_id)
        if review_created:
            self.test_get_book_reviews(book_id)
            self.test_update_review(review_id)
            self.test_get_book_stats(book_id)
            self.test_delete_review(review_id)

        # AI features tests
        print("\n🤖 Testing AI Features...")
        self.test_ai_recommendations()

        # Cleanup
        print("\n🧹 Cleanup...")
        self.test_delete_book(book_id)

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = BookReviewPlatformTester()
    
    try:
        success = tester.run_comprehensive_tests()
        tester.print_summary()
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        tester.print_summary()
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        tester.print_summary()
        return 1

if __name__ == "__main__":
    sys.exit(main())