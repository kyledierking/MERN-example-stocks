import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  if (process.env.NODE_ENV !== 'test') {
    mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-stocks')
      .then(() => console.log('MongoDB connected'))
      .catch((err) => console.log('MongoDB connection error:', err));
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stocks', stockRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  return app;
};

const app = createApp();

const PORT = process.env.PORT || 5000;

// Heroku fix to serve the build react app
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
