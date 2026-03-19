const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all delivery partners
 * @route   GET /delivery-partners
 * @access  Private (Admin)
 */
exports.getPartners = async (req, res) => {
    try {
        const { status, name } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (name) query.name = { $regex: name, $options: 'i' };

        const partners = await DeliveryPartner.find(query);
        return sendResponse(res, 200, 'Partners fetched successfully', partners);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Create new delivery partner
 * @route   POST /delivery-partners
 * @access  Private (Admin)
 */
exports.createPartner = async (req, res) => {
    try {
        const partner = await DeliveryPartner.create(req.body);
        return sendResponse(res, 201, 'Partner created successfully', partner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Update delivery partner status/details
 * @route   PUT /delivery-partners/:id
 * @access  Private (Admin)
 */
exports.updatePartner = async (req, res) => {
    try {
        const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!partner) return sendError(res, 404, 'Partner not found');
        return sendResponse(res, 200, 'Partner updated successfully', partner);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Assign order to delivery partner
 * @route   POST /orders/assign
 * @access  Private (Admin/Restaurant)
 */
exports.assignOrder = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId } = req.body;
        
        const order = await Order.findById(orderId);
        if (!order) return sendError(res, 404, 'Order not found');

        const partner = await DeliveryPartner.findById(deliveryPartnerId);
        if (!partner) return sendError(res, 404, 'Partner not found');

        if (partner.status !== 'Active') {
            return sendError(res, 400, 'Partner is not active or is busy');
        }

        order.riderId = deliveryPartnerId;
        order.status = 'out_for_delivery';
        await order.save();

        partner.status = 'Busy';
        await partner.save();

        return sendResponse(res, 200, 'Order assigned successfully', { order, partner });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};
