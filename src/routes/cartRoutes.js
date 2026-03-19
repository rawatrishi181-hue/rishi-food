const express = require('express');
const { check } = require('express-validator');
const {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add a food item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foodId
 *               - quantity
 *             properties:
 *               foodId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post(
    '/add',
    protect,
    [
        check('foodId', 'Valid Food ID is required').isMongoId(),
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
    ],
    addToCart
);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.get('/', protect, getCart);

/**
 * @swagger
 * /cart/update/{foodId}:
 *   put:
 *     summary: Update quantity of a food item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: foodId
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
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated successfully
 */
router.put(
    '/update/:foodId',
    protect,
    [
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
    ],
    updateCartItem
);

/**
 * @swagger
 * /cart/remove/{foodId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/remove/:foodId', protect, removeCartItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear all items from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/clear', protect, clearCart);

module.exports = router;
