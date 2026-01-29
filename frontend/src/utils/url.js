// Auto-detect production URLs
const isProduction = import.meta.env.PROD;
const productionBackendURL = 'https://thanks-shop.onrender.com';
const developmentBackendURL = 'http://localhost:5000';

// Get the base URL for the API (without /api suffix)
export const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    return isProduction ? productionBackendURL : developmentBackendURL;
};

// Get the full API URL
export const getAPIURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    return isProduction ? `${productionBackendURL}/api` : `${developmentBackendURL}/api`;
};

// Get the socket URL
export const getSocketURL = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
    return isProduction ? productionBackendURL : developmentBackendURL;
};

// Helper to construct image URL
export const getImageURL = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=Product+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBaseURL()}${imagePath}`;
};
