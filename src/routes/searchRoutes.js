const express = require('express');
const router = express.Router();
const { globalSearch, searchRestaurants, searchFoods } = require('../controllers/searchController');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global search for foods and restaurants
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search across foods and restaurants
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Combined search results
 */
router.get('/', globalSearch);

/**
 * @swagger
 * /api/search/restaurants:
 *   get:
 *     summary: Search for restaurants
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: List of restaurants matching query
 */
router.get('/restaurants', searchRestaurants);

/**
 * @swagger
 * /api/search/foods:
 *   get:
 *     summary: Search for food items
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: List of food items matching query
 */
router.get('/foods', searchFoods);

module.exports = router;
