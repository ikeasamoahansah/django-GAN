import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // REQUIRED
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

// Add JWT token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
              refresh: refreshToken
            });
            
            const { access } = response.data;
            localStorage.setItem('authToken', access);
            
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
);

export default api;