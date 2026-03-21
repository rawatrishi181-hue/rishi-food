const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management and history
 */

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Initialize a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentGateway:
 *                 type: string
 *                 enum: [Razorpay, Stripe, Paypal, Wallet]
 *                 default: Razorpay
 *     responses:
 *       201:
 *         description: Payment initialized
 */
router.post('/create', protect, createPayment);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify payment status (Mock)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - status
 *             properties:
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failure]
 *               gatewayResponse:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment verification status
 */
router.post('/verify', protect, verifyPayment);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get payment history for current user (or all if admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history list
 */
router.get('/history', protect, getPaymentHistory);

module.exports = router;
