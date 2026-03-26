const express = require('express');
const {
    getStats,
    getSalesData,
    getOrderDistribution,
    getDashboardStats,
    getTopRestaurants,
    getTopSellingFoods,
    getOrdersAnalytics,
    getRevenueAnalytics,
    getTopUsers,
    getOrdersReport,
    getDetailedAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection and admin authorization to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/sales', getSalesData);
router.get('/orders-distribution', getOrderDistribution);
router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/analytics', getDetailedAnalytics);

router.get('/recent-orders', async (req, res) => {
    try {
        const Order = require('../models/Order');
        const orders = await Order.find()
            .populate('userId', 'name email')
            .populate('restaurantId', 'name')
            .sort('-createdAt')
            .limit(10);
        const { sendResponse } = require('../utils/responseHandler');
        return sendResponse(res, 200, 'Recent orders fetched', orders);
    } catch (error) {
        const { sendError } = require('../utils/responseHandler');
        return sendError(res, 500, error.message);
    }
});

/**
 * @swagger
 * /admin/top-restaurants:
 *   get:
 *     summary: Get top 5 restaurants by order count
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top restaurants fetched successfully
 */
router.get('/top-restaurants', getTopRestaurants);

/**
 * @swagger
 * /admin/top-foods:
 *   get:
 *     summary: Get top selling food items
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top selling foods fetched successfully
 */
router.get('/top-foods', getTopSellingFoods);

/**
 * @swagger
 * /admin/orders-analytics:
 *   get:
 *     summary: Get orders analytics (Daily, Weekly, Monthly)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders analytics fetched successfully
 */
router.get('/orders-analytics', getOrdersAnalytics);

/**
 * @swagger
 * /admin/revenue:
 *   get:
 *     summary: Get revenue analytics (Monthly trend)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue analytics fetched successfully
 */
router.get('/revenue', getRevenueAnalytics);

/**
 * @swagger
 * /admin/top-users:
 *   get:
 *     summary: Get top 10 users by total spending
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top users fetched successfully
 */
router.get('/top-users', getTopUsers);

/**
 * @swagger
 * /admin/orders-report:
 *   get:
 *     summary: Get detailed orders report with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders report fetched successfully
 */
router.get('/orders-report', getOrdersReport);

module.exports = router;
