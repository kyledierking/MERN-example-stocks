# Server API Unit Tests

This directory contains comprehensive unit tests for the MERN Stock Server API. The test suite covers authentication routes, stock routes, middleware, and data models.

## Test Coverage

- **Auth Routes** (20 tests): Sign up, login, and user profile endpoints
- **Stock Routes** (25 tests): Stock retrieval, caching, and FinnHub integration
- **Auth Middleware** (6 tests): Token validation and authentication
- **User Model** (13 tests): Password hashing, comparison, and validation

**Total: 64 tests**

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Configuration

- **Framework**: Jest
- **Testing HTTP**: Supertest
- **Database**: MongoDB Memory Server (in-memory)
- **Config File**: `jest.config.js`
- **Setup File**: `tests/setup.js`

## Project Structure

```
tests/
├── setup.js                          # Global test configuration
├── api.test.js                       # General API tests (health check)
├── middleware/
│   └── authMiddleware.test.js        # Auth middleware tests
├── routes/
│   ├── authRoutes.test.js            # Authentication endpoint tests
│   └── stockRoutes.test.js           # Stock endpoint tests
└── models/
    └── User.test.js                  # User model tests
```

## Test Categories

### API Health Check
- Tests the `/api/health` endpoint
- Verifies CORS configuration

### Auth Routes
- **Signup**: User creation, validation, duplicate handling
- **Login**: Credential validation, token generation
- **Profile**: Protected user profile retrieval

### Stock Routes
- **Get Stock**: Fetch individual stocks with caching
- **Get All Stocks**: Retrieve cached stocks
- **Caching**: 15-minute cache logic
- **FinnHub Integration**: External API calls and error handling

### Auth Middleware
- Token validation
- Expired token handling
- Missing/invalid token errors
- Request enrichment (req.user)

### User Model
- Password hashing and verification
- Email validation and normalization
- Unique email constraints
- Field requirements
- Password comparison methods

## Key Testing Features

### Database Isolation
- Each test gets a fresh in-memory MongoDB
- Database is cleaned after each test
- No test data pollution

### Mocked External Services
- FinnHub API is mocked in stock route tests
- Allows testing without external dependencies
- Enables error scenario testing

### Protected Routes
- All protected endpoints are tested with valid/invalid tokens
- JWT token generation and validation verified
- Auth middleware integration tested

## Running Specific Tests

```bash
# Test a single file
npm test -- authRoutes.test.js

# Test a specific describe block
npm test -- --testNamePattern="Auth Routes"

# Test a specific test case
npm test -- --testNamePattern="should login with valid credentials"
```

## Notes

- Tests use `mongodb-memory-server` for a lightweight test database
- JWT_SECRET is set to 'test-secret-key' in test environment
- Console errors in tests are intentional (testing error conditions)
- All external API calls are mocked to avoid rate limits

## Adding New Tests

When adding new API endpoints:

1. Create a test file in the appropriate directory
2. Import the app from `../index.js` (or `../../index.js` depending on depth)
3. Use `request(app)` from supertest for HTTP testing
4. Create a new user and token for protected routes
5. Clean up after tests (automatic via setup.js)

Example:
```javascript
const request = require('supertest');
const app = require('../../index.js');

describe('New Route', () => {
  it('should handle requests', async () => {
    const response = await request(app)
      .get('/api/new-route')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
});
```
