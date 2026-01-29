/**
 * Normalizes image URLs for local and production environments.
 * @param {string} imagePath - The path or URL to the image.
 * @returns {string} - The fully qualified image URL or a placeholder.
 */
export const getNormalizedImageUrl = (imagePath) => {
    if (!imagePath) {
        return 'https://placehold.co/400x400?text=Product+Image';
    }

    // If it's already a full URL (external or placeholder), return it
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Get base URL from environment and remove trailing /api if present
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
    // Remove /api and ANY trailing slashes to get a clean base URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    // Ensure imagePath starts with / and remove any duplicate slashes
    let normalizedPath = imagePath.trim();
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }
    // Remove any double slashes that might have been formed
    normalizedPath = normalizedPath.replace(/\/+/g, '/');

    return `${baseUrl}${normalizedPath}`;
};
