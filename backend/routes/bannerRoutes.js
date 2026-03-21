const express = require('express');
const router = express.Router();
const { getBanners, createBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banners and promotional images management
 */

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get all active banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: List of banners
 */
router.get('/', getBanners);

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a new banner
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               link:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [restaurant, food, external]
 *               isActive:
 *                 type: boolean
 *               priority:
 *                 type: number
 *     responses:
 *       201:
 *         description: Banner created successfully
 */
router.post('/', protect, authorize('admin'), createBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete a banner
 *     tags: [Banners]
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
 *         description: Banner deleted successfully
 */
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
