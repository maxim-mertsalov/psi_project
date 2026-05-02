import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8080',
});

api.interceptors.request.use((config) => {
  let sessionId = localStorage.getItem('smartbuy-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('smartbuy-session-id', sessionId);
  }
  config.headers['X-Session-Id'] = sessionId;

  const token = localStorage.getItem('smartbuy-auth-token');
  if (token) {
    config.headers['X-Auth-Token'] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong';

    if (error.response) {
      message = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      message = 'No response from server. Check CORS or if backend is running.';
    } else {
      message = error.message;
    }

    console.error(`[API Error]:`, message);
    return Promise.reject(new Error(message));
  }
);

export default api;