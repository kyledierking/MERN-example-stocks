import axios from 'axios';

const API = axios.create();

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getStock = (symbol) => API.get(`/api/stocks/${symbol}`);
export const getAllStocks = () => API.get('/api/stocks');

export default API;
