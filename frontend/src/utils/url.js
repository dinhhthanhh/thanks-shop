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
export const getImageURL = (imagePath, product = null) => {
    // If no imagePath provided, try to get from product object (backward compatibility)
    if (!imagePath && product) {
        // Try new images array first
        if (product.images && product.images.length > 0) {
            imagePath = product.images[0];
        }
        // Fallback to old image field
        else if (product.image) {
            imagePath = product.image;
        }
    }

    // If still no image, return placeholder (using imgbb.com which is more reliable)
    if (!imagePath) {
        return 'https://i.ibb.co/9ZQ5YQ3/placeholder-product.png';
    }

    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Otherwise, prepend backend URL
    return `${getBaseURL()}${imagePath}`;
};
