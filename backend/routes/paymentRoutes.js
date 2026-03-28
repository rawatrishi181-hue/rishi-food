const express = require('express');
const router = express.Router();
const { 
    createDummyPayment, 
    getAllTransactions, 
    getUserTransactions 
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

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
 *     summary: Create a dummy payment transaction
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
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [UPI, CARD, COD]
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post('/create', protect, createDummyPayment);

/**
 * @swagger
 * /api/payments/user/{userId}:
 *   get:
 *     summary: Get transaction history for a specific user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User transaction history
 */
router.get('/user/:userId', protect, getUserTransactions);

module.exports = router;
