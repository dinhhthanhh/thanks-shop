import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../common/StarRating';
import Loading from '../common/Loading';

const ReviewSection = ({ productId }) => {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canReview, setCanReview] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [formData, setFormData] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [canReviewReason, setCanReviewReason] = useState('');

    useEffect(() => {
        fetchReviews();
        if (isAuthenticated) {
            checkCanReview();
        }
    }, [productId, page]);

    const fetchReviews = async () => {
        try {
            const response = await reviewsAPI.getReviews(productId, { page, limit: 5 });
            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkCanReview = async () => {
        try {
            const response = await reviewsAPI.canReview(productId);
            setCanReview(response.data.canReview);
            setCanReviewReason(response.data.reason);

            // If user already reviewed, set the existing review for editing
            if (response.data.reason === 'already_reviewed' && response.data.review) {
                setEditingReview(response.data.review);
                setFormData({
                    rating: response.data.review.rating,
                    comment: response.data.review.comment
                });
            }
        } catch (error) {
            console.error('Error checking review eligibility:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingReview) {
                await reviewsAPI.updateReview(editingReview._id, formData);
                alert(t('reviews.success_update'));
            } else {
                await reviewsAPI.createReview(productId, formData);
                alert(t('reviews.success_create'));
            }

            setShowForm(false);
            setFormData({ rating: 5, comment: '' });
            fetchReviews();
            checkCanReview();
        } catch (error) {
            alert(error.response?.data?.message || t('reviews.error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm(t('reviews.delete_confirm'))) return;

        try {
            await reviewsAPI.deleteReview(reviewId);
            alert(t('reviews.success_delete'));
            setEditingReview(null);
            setFormData({ rating: 5, comment: '' });
            fetchReviews();
            checkCanReview();
        } catch (error) {
            alert(error.response?.data?.message || t('reviews.error'));
        }
    };

    const handleEdit = () => {
        setShowForm(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('reviews.title')}</h2>

            {/* Review Form */}
            {isAuthenticated && (
                <div className="mb-8">
                    {canReview && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary"
                        >
                            {t('reviews.write_review')}
                        </button>
                    )}

                    {editingReview && !showForm && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <StarRating rating={editingReview.rating} readonly size="sm" />
                                        <span className="text-sm text-gray-500">
                                            {formatDate(editingReview.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{editingReview.comment}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={handleEdit}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        {t('reviews.edit_review')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(editingReview._id)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        {t('reviews.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!canReview && canReviewReason === 'not_purchased' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                            {t('reviews.must_purchase')}
                        </div>
                    )}

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-8">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('reviews.your_rating')}
                                </label>
                                <StarRating
                                    rating={formData.rating}
                                    onRatingChange={(rating) => setFormData({ ...formData, rating })}
                                    size="lg"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('reviews.your_review')}
                                </label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    required
                                    rows="4"
                                    maxLength="1000"
                                    className="input-field"
                                    placeholder={t('reviews.your_review')}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.comment.length}/1000
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary"
                                >
                                    {submitting ? '...' : (editingReview ? t('reviews.update') : t('reviews.submit'))}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        if (!editingReview) {
                                            setFormData({ rating: 5, comment: '' });
                                        }
                                    }}
                                    className="btn-secondary"
                                >
                                    {t('reviews.cancel')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg mb-2">{t('reviews.no_reviews')}</p>
                        <p className="text-gray-400">{t('reviews.be_first')}</p>
                    </div>
                ) : (
                    <>
                        {reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-200 py-6 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StarRating rating={review.rating} readonly size="sm" />
                                            <span className="text-sm text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                                            title={t('reviews.delete') || 'Xóa bình luận'}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>{t('reviews.delete') || 'Xóa'}</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('reviews.load_more')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

ReviewSection.propTypes = {
    productId: PropTypes.string.isRequired
};

export default ReviewSection;
