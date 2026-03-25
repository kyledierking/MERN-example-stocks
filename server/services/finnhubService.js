import axios from 'axios';

const FinnHubClient = axios.create({
  baseURL: process.env.FINNHUB_URL || 'https://finnhub.io/api/v1',
  headers: {
    'X-Finnhub-Token': process.env.FINNHUB_API_KEY,
  },
});

const validateResponse = (response) => {
    if (!response || response.status !== 200) {
        switch (response ? response.status : null) {
            case 400:
                throw new Error('Bad Request: The server could not understand the request.');
            case 401:
                throw new Error('Unauthorized: Invalid API key or token.');
            case 403:
                throw new Error('Forbidden: You do not have permission to access this resource.');
            case 404:
                throw new Error('Not Found: The requested resource could not be found.');
            case 429:
                throw new Error('Too Many Requests: You have exceeded your API rate limit.');
            case 500:
                throw new Error('Internal Server Error: An error occurred on the server.');
            default:
                throw new Error(`FinnHub API error: ${response ? response.statusText : 'No response'}`);
        }
    }
    else {
        return response.data;
    }
};

const getStockQuote = async (symbol) => {
    try {
        const response = await FinnHubClient.get(`/quote?symbol=${symbol}`);
        return validateResponse(response);
    } catch (error) {
        console.error('Error fetching stock data from FinnHub:', error);
        throw error;
    }
};

const getCompanyProfile = async (symbol) => {
    try {
        const response = await FinnHubClient.get(`/stock/profile2?symbol=${symbol}`);
        return validateResponse(response);
    } catch (error) {
        console.error('Error fetching company profile from FinnHub:', error);
        throw error;
    }
};

export {
    getStockQuote,
    getCompanyProfile,
};