import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${hostname}:8000`;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
export { API_BASE_URL };
