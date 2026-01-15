import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        // Ensure headers object exists
        if (!config.headers) {
            config.headers = {} as any;
        }

        if (token) {
            // Handle Axios 1.x AxiosHeaders object
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                // Fallback for older versions or plain objects
                (config.headers as any).Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling 401
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Clear local storage and redirect to login
//             // localStorage.removeItem('token');
//             // window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export default api;
