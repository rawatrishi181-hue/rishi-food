const Banner = require('../models/Banner');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');

/**
 * @desc    Get all active banners
 * @route   GET /api/banners
 * @access  Public
 */
const getBanners = async (req, res) => {
    try {
        // Check cache
        const cachedBanners = await getCache(CACHE_KEYS.BANNERS);
        if (cachedBanners) {
            return sendResponse(res, 200, 'Banners fetched successfully', cachedBanners);
        }

        const banners = await Banner.find({ isActive: true })
            .sort('-priority -createdAt')
            .lean();
        
        // Cache result (30 min TTL)
        await setCache(CACHE_KEYS.BANNERS, banners, CACHE_TTL.BANNERS);
        
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
        // Clear cache
        await deleteCache(CACHE_KEYS.BANNERS);
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
        // Clear cache
        await deleteCache(CACHE_KEYS.BANNERS);
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
