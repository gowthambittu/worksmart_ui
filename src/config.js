// config.js
const API_HOST = (process.env.REACT_APP_API_HOST || 'http://localhost:8080').replace(/\/$/, '');

export default API_HOST;
