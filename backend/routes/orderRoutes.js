const express = require('express');
const { check } = require('express-validator');
const {
    createOrder,
    getMyOrders,
    getVendorOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order from the user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - paymentMethod
 *             properties:
 *               address:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, ONLINE]
 *     responses:
 *       201:
 *         description: Order placed successfully
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router
    .route('/')
    .post(
        protect,
        [
            check('address', 'Address is required').not().isEmpty(),
            check('paymentMethod', 'Payment method is required').isIn(['COD', 'ONLINE'])
        ],
        createOrder
    )
    .get(protect, getMyOrders);

router.get('/vendor', protect, authorize('restaurant', 'admin'), getVendorOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by order ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 */
router.get('/:id', protect, getOrderDetails);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, preparing, out_for_delivery, delivered]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.put(
    '/:id/status',
    protect,
    authorize('admin', 'restaurant'),
    [
        check('status', 'Status is required').not().isEmpty()
    ],
    updateOrderStatus
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
