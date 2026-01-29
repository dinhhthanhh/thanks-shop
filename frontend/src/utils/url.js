// Get the base URL for the API (without /api suffix)
export const getBaseURL = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace('/api', '');
};

// Get the full API URL
export const getAPIURL = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Get the socket URL
export const getSocketURL = () => {
    return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

// Helper to construct image URL
export const getImageURL = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x400?text=Product+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `${getBaseURL()}${imagePath}`;
};
