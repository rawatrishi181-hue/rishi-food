const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Food = require('../models/Food');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        return sendResponse(res, 200, 'Dashboard stats fetched successfully', {
            totalUsers,
            totalRestaurants,
            totalOrders,
            totalRevenue
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get Top 5 Restaurants by Order Count
 * @route   GET /admin/top-restaurants
 * @access  Private/Admin
 */
const getTopRestaurants = async (req, res) => {
    try {
        const topRestaurants = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: '$restaurantId', orderCount: { $sum: 1 } } },
            { $sort: { orderCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurantDetails'
                }
            },
            { $unwind: '$restaurantDetails' },
            {
                $project: {
                    name: '$restaurantDetails.name',
                    city: '$restaurantDetails.city',
                    orderCount: 1
                }
            }
        ]);

        return sendResponse(res, 200, 'Top restaurants fetched successfully', topRestaurants);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get Top Selling Foods
 * @route   GET /admin/top-foods
 * @access  Private/Admin
 */
const getTopSellingFoods = async (req, res) => {
    try {
        const topFoods = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.foodId',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        return sendResponse(res, 200, 'Top selling foods fetched successfully', topFoods);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get Orders Analytics (Daily, Weekly, Monthly)
 * @route   GET /admin/orders-analytics
 * @access  Private/Admin
 */
const getOrdersAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailyOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
        const weeklyOrders = await Order.countDocuments({ createdAt: { $gte: startOfWeek } });
        const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Advanced monthly grouping for trend (Last 6 months)
        const trend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return sendResponse(res, 200, 'Orders analytics fetched successfully', {
            summary: {
                dailyOrders,
                weeklyOrders,
                monthlyOrders
            },
            trend
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get Admin Revenue Analytics
 * @route   GET /api/admin/revenue
 * @access  Private/Admin
 */
const getRevenueAnalytics = async (req, res) => {
    try {
        const revenueTrend = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return sendResponse(res, 200, 'Revenue analytics fetched successfully', revenueTrend);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Top Users by Spending
 * @route   GET /api/admin/top-users
 * @access  Private/Admin
 */
const getTopUsers = async (req, res) => {
    try {
        const topUsers = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: '$userId',
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    totalSpent: 1,
                    orderCount: 1
                }
            }
        ]);

        return sendResponse(res, 200, 'Top users fetched successfully', topUsers);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Detailed Orders Report
 * @route   GET /api/admin/orders-report
 * @access  Private/Admin
 */
const getOrdersReport = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('restaurantId', 'name')
            .sort('-createdAt');

        const summary = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            statusCounts: orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {})
        };

        return sendResponse(res, 200, 'Orders report fetched successfully', { summary, orders });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Admin Dashboard Stats (New)
 * @route   GET /admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res) => {
    try {
        const activeOrders = await Order.countDocuments({ status: { $in: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery'] } });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const revenueData = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        return sendResponse(res, 200, 'Stats fetched successfully', {
            activeOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            totalUsers: await User.countDocuments()
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Sales Chart Data
 * @route   GET /admin/sales
 * @access  Private/Admin
 */
const getSalesData = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    sales: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedSales = sales.map(item => ({
            day: days[item._id - 1],
            sales: item.sales,
            revenue: item.revenue
        }));

        return sendResponse(res, 200, 'Sales data fetched successfully', formattedSales);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Order Distribution (Veg vs Non-Veg)
 * @route   GET /admin/orders-distribution
 * @access  Private/Admin
 */
const getOrderDistribution = async (req, res) => {
    try {
        const distribution = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'foods',
                    localField: 'items.foodId',
                    foreignField: '_id',
                    as: 'foodDetails'
                }
            },
            { $unwind: '$foodDetails' },
            {
                $group: {
                    _id: '$foodDetails.category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Fallback simple logic if food details lookup is complex
        // Let's just use category for now as proxy for distribution
        return sendResponse(res, 200, 'Distribution fetched successfully', distribution);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get Detailed Analytics for Admin
 * @route   GET /admin/analytics
 * @access  Admin
 */
const getDetailedAnalytics = async (req, res) => {
    try {
        const Order = require('../models/Order');
        const Food = require('../models/Food');

        // 1. Revenue & Orders by Date (Last 30 days)
        const salesByDate = await Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Top Selling Items
        const topSellingItems = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.foodId",
                    count: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "foods",
                    localField: "_id",
                    foreignField: "_id",
                    as: "foodDetails"
                }
            },
            { $unwind: "$foodDetails" }
        ]);

        return sendResponse(res, 200, 'Detailed analytics fetched', {
            salesByDate,
            topSellingItems
        });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    getStats,
    getSalesData,
    getOrderDistribution,
    getDashboardStats,
    getTopRestaurants,
    getTopSellingFoods,
    getOrdersAnalytics,
    getRevenueAnalytics,
    getTopUsers,
    getOrdersReport,
    getDetailedAnalytics
};
