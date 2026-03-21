const express = require('express');
const { check } = require('express-validator');
const {
    getAllFoods,
    getFood,
    createFood,
    updateFood,
    deleteFood,
    getRecommendations
} = require('../controllers/foodController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recommendations', optionalProtect, getRecommendations);

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: Food management
 */

/**
 * @swagger
 * /foods:
 *   get:
 *     summary: Get all food items (optional filtering by category)
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category name to filter by
 *     responses:
 *       200:
 *         description: Food items fetched successfully
 */
router.get('/', getAllFoods);

/**
 * @swagger
 * /foods:
 *   post:
 *     summary: Create new food item
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - restaurantId
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               restaurantId:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Food item created successfully
 *       403:
 *         description: Not authorized
 */
router.post(
    '/',
    protect,
    authorize('admin', 'restaurant'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price is required and must be greater than 0').isFloat({ gt: 0 }),
        check('restaurantId', 'Valid Restaurant ID is required').isMongoId(),
        check('category', 'Category is required').not().isEmpty()
    ],
    createFood
);

/**
 * @swagger
 * /foods/{id}:
 *   get:
 *     summary: Get single food item details
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food item details fetched successfully
 *   put:
 *     summary: Update food item details
 *     tags: [Foods]
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
 *         description: Food item updated successfully
 *   delete:
 *     summary: Delete a food item
 *     tags: [Foods]
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
 *         description: Food item deleted successfully
 */
router
    .route('/:id')
    .get(getFood)
    .put(
        protect,
        authorize('admin', 'restaurant'),
        [
            check('price', 'Price must be greater than 0').optional().isFloat({ gt: 0 })
        ],
        updateFood
    )
    .delete(protect, authorize('admin', 'restaurant'), deleteFood);

module.exports = router;
