const Notification = require('../models/Notification');
const { sendResponse, sendError } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Create a new notification (Internal/Admin)
 * @route   POST /notifications
 * @access  Private
 */
const createNotification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation Error', errors.array());
        }

        const { userId, title, message } = req.body;

        const notification = await Notification.create({
            userId,
            title,
            message
        });

        return sendResponse(res, 201, 'Notification created successfully', notification);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort('-createdAt');

        return sendResponse(res, 200, 'Notifications fetched successfully', notifications);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return sendError(res, 404, 'Notification not found');
        }

        // Check ownership
        if (notification.userId.toString() !== req.user._id.toString()) {
            return sendError(res, 403, 'Not authorized to access this notification');
        }

        notification.isRead = true;
        await notification.save();

        return sendResponse(res, 200, 'Notification marked as read', notification);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return sendError(res, 404, 'Notification not found');
        }

        // Check ownership
        if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 403, 'Not authorized to delete this notification');
        }

        await notification.deleteOne();

        return sendResponse(res, 200, 'Notification deleted successfully', {});
    } catch (error) {
        console.error(error);
        return sendError(res, 500, 'Server error');
    }
};

/**
 * Internal helper to create notification without HTTP request
 */
const sendInternalNotification = async (userId, title, message) => {
    try {
        await Notification.create({ userId, title, message });
    } catch (error) {
        console.error('Failed to send internal notification:', error);
    }
};

module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead,
    deleteNotification,
    sendInternalNotification
};
