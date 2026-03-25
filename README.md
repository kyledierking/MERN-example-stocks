# MERN Stock Application

A full-stack MERN application for user authentication and stock data viewing.

## Features

- User signup and login with JWT authentication
- Password hashing with bcrypt
- Protected routes requiring authentication
- Stock data search and viewing
- Responsive UI with React

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- bcrypt

**Frontend:**
- React
- React Router
- Axios
- Context API for state management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB running locally or a MongoDB connection string

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/mern-stocks
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5001
FINNHUB_URL=https://finnhub.io/api/v1
FINNHUB_API_KEY=<API-KEY>
```

4. Start the backend:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info (protected)

### Stocks
- `GET /api/stocks/:symbol` - Get stock data by symbol and caches (protected)
- `GET /api/stocks` - Get all cached stocks (protected)

## Usage

1. Sign up with your email and password
2. Login to your account
3. Use the search bar to look up stock symbols (e.g., AAPL, GOOGL)
4. View stock opening price

## Notes

- Stock data is retrieved from finnhub.io, a finnhub API key is required
- The JWT secret in `.env` should be changed for production
- MongoDB connection string should be updated for cloud deployments
