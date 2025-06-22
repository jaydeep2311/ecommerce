const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
} = require('../controllers/cartController');

const { protect } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100')
];

const updateCartValidation = [
  body('quantity')
    .isInt({ min: 0, max: 100 })
    .withMessage('Quantity must be between 0 and 100')
];

// All routes require authentication
router.use(protect);

// Routes
router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router.get('/validate', validateCart);

router.post('/items', addToCartValidation, addToCart);

router
  .route('/items/:productId')
  .put(updateCartValidation, updateCartItem)
  .delete(removeFromCart);

module.exports = router;
