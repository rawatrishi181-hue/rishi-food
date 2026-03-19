const express = require('express');
const router = express.Router();
const { addToFavorites, getFavorites, removeFromFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User favorite restaurants and foods management
 */

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [restaurant, food]
 *                 description: Type of item to favorite
 *               restaurantId:
 *                 type: string
 *                 description: Required if type is 'restaurant'
 *               foodId:
 *                 type: string
 *                 description: Required if type is 'food'
 *     responses:
 *       201:
 *         description: Added to favorites successfully
 *       400:
 *         description: Invalid type or missing ID
 */
router.post('/', protect, addToFavorites);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get all favorites for the current user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user favorites
 */
router.get('/', protect, getFavorites);

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: Remove an item from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the favorite record to delete
 *     responses:
 *       200:
 *         description: Removed from favorites successfully
 *       404:
 *         description: Favorite not found
 */
router.delete('/:id', protect, removeFromFavorites);

module.exports = router;
