const Category = require('../models/Category');
const Food = require('../models/Food');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all categories
 * @route   GET /categories
 * @access  Public
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        return sendResponse(res, 200, 'Categories fetched successfully', categories);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Create a category
 * @route   POST /categories
 * @access  Private/Admin
 */
const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const category = await Category.create({ name, description, image });
        return sendResponse(res, 201, 'Category created successfully', category);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 400, 'Category already exists');
        }
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get single category
 * @route   GET /categories/:id
 * @access  Public
 */
const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendError(res, 404, 'Category not found');
        }
        return sendResponse(res, 200, 'Category fetched successfully', category);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Update category
 * @route   PUT /categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return sendError(res, 404, 'Category not found');
        }
        return sendResponse(res, 200, 'Category updated successfully', category);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendError(res, 404, 'Category not found');
        }
        await category.deleteOne();
        return sendResponse(res, 200, 'Category deleted successfully', {});
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get foods by category
 * @route   GET /categories/:id/foods
 * @access  Public
 */
const getCategoryFoods = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendError(res, 404, 'Category not found');
        }
        const foods = await Food.find({ category: category.name });
        return sendResponse(res, 200, 'Category foods fetched successfully', foods);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

module.exports = {
    getCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    getCategoryFoods
};
