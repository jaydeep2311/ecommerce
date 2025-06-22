const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getDeletedProducts,
  getCategories,
  getBrands,
  addReview
} = require('../controllers/productController');

const { protect, authorize, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn([
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports & Outdoors',
      'Health & Beauty',
      'Toys & Games',
      'Automotive',
      'Food & Beverages',
      'Other'
    ])
    .withMessage('Please provide a valid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*.url')
    .isURL()
    .withMessage('Each image must have a valid URL')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn([
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports & Outdoors',
      'Health & Beauty',
      'Toys & Games',
      'Automotive',
      'Food & Beverages',
      'Other'
    ])
    .withMessage('Please provide a valid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Each image must have a valid URL')
];

// Public routes
router.get('/categories', getCategories);
router.get('/brands', getBrands);

router
  .route('/')
  .get(optionalAuth, getProducts)
  .post(protect, authorize('admin'), createProductValidation, createProduct);

router
  .route('/:id')
  .get(optionalAuth, getProduct)
  .put(protect, authorize('admin'), updateProductValidation, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

// Review routes
router.post('/:id/reviews', protect, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters')
], addReview);

// Admin-only routes for soft-deleted products
router.get('/deleted/all', protect, authorize('admin'), getDeletedProducts);
router.put('/:id/restore', protect, authorize('admin'), restoreProduct);

module.exports = router;
