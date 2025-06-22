const express = require('express');
const {
  getDashboardAnalytics,
  getUserAnalytics,
  getProductAnalytics,
  getSalesAnalytics
} = require('../controllers/analyticsController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Analytics routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/users', getUserAnalytics);
router.get('/products', getProductAnalytics);
router.get('/sales', getSalesAnalytics);

module.exports = router;
