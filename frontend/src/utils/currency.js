export const EXCHANGE_RATE = 25000; // 1 USD = 25,000 VND

export const formatPrice = (price, language = 'en') => {
    if (language === 'vi') {
        const vndPrice = price * EXCHANGE_RATE;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(vndPrice);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
};
