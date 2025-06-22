'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/stores/authStore';
import { useAddProductReview } from '@/hooks/mutations/useProducts';
import StarRating from '@/components/StarRating';
import { toast } from 'react-hot-toast';

interface Review {
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  userHasReviewed?: boolean;
}

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating cannot be more than 5')
    .required('Rating is required'),
  comment: Yup.string()
    .max(500, 'Comment cannot be more than 500 characters')
    .optional(),
});



const ReviewItem = ({ review }: { review: Review }) => {
  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{review.user.name}</h4>
              <div className="flex items-center space-x-2">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {review.comment && (
            <p className="text-gray-700 mt-2">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  userHasReviewed = false,
}: ProductReviewsProps) {
  const { isAuthenticated, user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const addReviewMutation = useAddProductReview();

  // Check if current user has already reviewed this product
  const currentUserReview = reviews.find(review => review.user._id === user?._id);
  const hasReviewed = userHasReviewed || !!currentUserReview;

  return (
    <div className="mt-12">
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
        
        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                <StarRating rating={averageRating} readonly size="lg" />
                <div className="text-sm text-gray-600 mt-1">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* Add Review Button */}
            {isAuthenticated && !hasReviewed && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}
            
            {!isAuthenticated && (
              <p className="text-gray-600">Please login to write a review</p>
            )}
            
            {hasReviewed && (
              <p className="text-green-600">You have already reviewed this product</p>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && isAuthenticated && !hasReviewed && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
            <Formik
              initialValues={{ rating: 0, comment: '' }}
              validationSchema={reviewSchema}
              onSubmit={(values, { setSubmitting, resetForm }) => {
                addReviewMutation.mutate(
                  { productId, data: values },
                  {
                    onSuccess: () => {
                      resetForm();
                      setShowReviewForm(false);
                      toast.success('Review added successfully!');
                    },
                    onSettled: () => setSubmitting(false),
                  }
                );
              }}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating *
                    </label>
                    <StarRating
                      rating={values.rating}
                      onRatingChange={(rating) => setFieldValue('rating', rating)}
                      size="lg"
                    />
                    <ErrorMessage
                      name="rating"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Comment (Optional)
                    </label>
                    <Field
                      as="textarea"
                      id="comment"
                      name="comment"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your experience with this product..."
                    />
                    <ErrorMessage
                      name="comment"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || addReviewMutation.isPending}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting || addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Reviews List */}
        <div>
          {reviews.length > 0 ? (
            <div>
              <h4 className="text-lg font-semibold mb-6">All Reviews ({reviews.length})</h4>
              {reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
