const express = require('express');
const Stock = require('../models/Stock');
const authMiddleware = require('../middleware/authMiddleware');
const finnhubService = require('../services/finnhubService');

const router = express.Router();

// Get stock by symbol (protected route)
router.get('/:symbol', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    let stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

    // If stock not found in DB, or last lookup was more than 15 minutes ago, get new stock data
    if (!stock || new Date() - stock.lastUpdated > 15 * 60 * 1000) {
      if (!stock) {
        let companyProfile = null;

        try {
          companyProfile = await finnhubService.getCompanyProfile(symbol.toUpperCase());
          if (!companyProfile || !companyProfile.name) {
            return res.status(404).json({ message: 'Stock not found' });
          }
        } catch (error) {
          console.error('Error fetching company profile:', error);
          return res.status(404).json({ message: 'Stock not found' });
        }

        stock = new Stock({
          symbol: symbol.toUpperCase(),
          name: companyProfile.name || `${symbol.toUpperCase()} Company`,
          logoUrl: companyProfile.logo || '',
          price: 0, // Will be updated with quote data
        });
      }

      let quote = null;

      try {
        quote = await finnhubService.getStockQuote(symbol.toUpperCase());
        if (!quote || quote.o === undefined) {
          return res.status(404).json({ message: 'Stock quote not found' });
        }
      } catch (error) {
        console.error('Error fetching stock quote:', error);
        return res.status(500).json({ message: 'Failed to fetch stock data' });
      }

      stock.price = quote.o; // Update price with opening price from quote
      stock.lastUpdated = new Date();

      await stock.save(); // Save or update stock in DB
    }

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all cached stocks (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
