import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getStock } from '../api';
import './StockSearch.css';

const StockSearch = () => {
  const { token } = useContext(AuthContext);
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await getStock(symbol);
      setStock(response.data);
      setSymbol('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock data');
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="stock-search">Please log in to view stock data.</div>;
  }

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {stock && (
        <div className="stock-info">
          {stock.logoUrl && <img src={stock.logoUrl} alt={stock.name} />}
          <div className="stock-details">
            <h3>{stock.name}</h3>
            <p>Symbol: {stock.symbol}</p>
            <p>Opening Price: ${stock.price}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
