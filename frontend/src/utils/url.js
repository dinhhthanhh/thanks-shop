// Format currency to VND
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format number with thousand separators
export const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

// Get normalized image URL
export const getNormalizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If it starts with /uploads, prepend the API URL
    if (imageUrl.startsWith('/uploads')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${imageUrl}`;
    }

    return imageUrl;
};
