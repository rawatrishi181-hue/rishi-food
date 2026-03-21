const express = require('express');
const router = express.Router();
const { registerAsRider, getAvailableOrders, acceptOrder, completeDelivery, updateLocation } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/location', protect, authorize('rider'), updateLocation);

/**
 * @swagger
 * tags:
 *   name: Delivery
 *   description: Rider management and order delivery
 */

/**
 * @swagger
 * /api/delivery/register:
 *   post:
 *     summary: Register as a rider
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully registered as a rider
 */
router.post('/register', protect, registerAsRider);

/**
 * @swagger
 * /api/delivery/orders:
 *   get:
 *     summary: Get available orders for riders
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available orders
 */
router.get('/orders', protect, authorize('rider'), getAvailableOrders);

/**
 * @swagger
 * /api/delivery/order/{id}/accept:
 *   put:
 *     summary: Accept an order for delivery
 *     tags: [Delivery]
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
 *         description: Order accepted
 */
router.put('/order/:id/accept', protect, authorize('rider'), acceptOrder);

/**
 * @swagger
 * /api/delivery/order/{id}/complete:
 *   put:
 *     summary: Mark order as delivered
 *     tags: [Delivery]
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
 *         description: Order delivered
 */
router.put('/order/:id/complete', protect, authorize('rider'), completeDelivery);

module.exports = router;
