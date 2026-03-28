const Banner = require('../models/Banner');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all active banners
 * @route   GET /api/banners
 * @access  Public
 */
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true })
            .sort('-priority -createdAt')
            .lean();
        
        return sendResponse(res, 200, 'Banners fetched successfully', banners);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Create a new banner
 * @route   POST /api/banners
 * @access  Admin
 */
const createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        return sendResponse(res, 201, 'Banner created successfully', banner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Admin
 */
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return sendError(res, 404, 'Banner not found');
        }
        return sendResponse(res, 200, 'Banner deleted successfully');
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    getBanners,
    createBanner,
    deleteBanner
};
