import { useState } from 'react';
import { getImageURL } from '../../utils/url';

const ImageCarousel = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const currentImage = images[currentIndex];
    const imageUrl = getImageURL(currentImage);

    return (
        <div className="relative w-full">
            {/* Main image container with blur background */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-900">
                {/* Blurred background */}
                <div
                    className="absolute inset-0 blur-2xl opacity-50"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Main image with object-fit contain */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={`Product image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain relative z-10"
                    />
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-20"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-20"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail dots */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {images.map((img, index) => {
                        const thumbUrl = getImageURL(img);

                        return (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${index === currentIndex
                                    ? 'border-primary-600 ring-2 ring-primary-300'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                aria-label={`Go to image ${index + 1}`}
                            >
                                <img
                                    src={thumbUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-20">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
