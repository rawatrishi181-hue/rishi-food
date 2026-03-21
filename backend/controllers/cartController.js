const Cart = require('../models/Cart');
const Food = require('../models/Food');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Add a food item to the cart
 * @route   POST /cart/add
 * @access  Private
 */
const addToCart = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { foodId, quantity } = req.body;
        const userId = req.user._id;

        // Check if food exists
        const food = await Food.findById(foodId);
        if (!food) {
            return sendError(res, 404, 'Food item not found');
        }

        if (!food.isAvailable) {
            return sendError(res, 400, 'Food item is currently not available');
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                restaurantId: food.restaurantId,
                items: [{
                    foodId,
                    name: food.name,
                    price: food.price,
                    quantity
                }]
            });
        } else {
            // Set restaurantId if cart was empty
            if (cart.items.length === 0) {
                cart.restaurantId = food.restaurantId;
            }

            // Check if item already exists in cart
            const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

            if (itemIndex > -1) {
                // Increase quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({
                    foodId,
                    name: food.name,
                    price: food.price,
                    quantity
                });
            }
        }

        await cart.save();
        return sendResponse(res, 200, 'Item added to cart', cart);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get user's cart
 * @route   GET /cart
 * @access  Private
 */
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('restaurantId', 'name city')
            .populate('items.foodId', 'image category');

        if (!cart) {
            return sendResponse(res, 200, 'Cart is empty', { items: [], totalAmount: 0 });
        }

        return sendResponse(res, 200, 'Cart fetched successfully', cart);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update quantity of a food item in the cart
 * @route   PUT /cart/update/:foodId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { foodId } = req.params;

        if (quantity < 1) {
            return sendError(res, 400, 'Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return sendError(res, 404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

        if (itemIndex === -1) {
            return sendError(res, 404, 'Item not found in cart');
        }

        cart.items[itemIndex].quantity = quantity;

        await cart.save();
        return sendResponse(res, 200, 'Cart updated successfully', cart);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /cart/remove/:foodId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
    try {
        const { foodId } = req.params;
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return sendError(res, 404, 'Cart not found');
        }

        cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);

        await cart.save();
        return sendResponse(res, 200, 'Item removed from cart', cart);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /cart/clear
 * @access  Private
 */
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return sendResponse(res, 200, 'Cart already empty', { items: [], totalAmount: 0 });
        }

        cart.items = [];
        cart.restaurantId = undefined;
        cart.totalAmount = 0;

        await cart.save();
        return sendResponse(res, 200, 'Cart cleared successfully', cart);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
