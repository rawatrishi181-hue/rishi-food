const Address = require('../models/Address');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Add a new address
 * @route   POST /api/addresses
 * @access  Private
 */
const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addressData = { ...req.body, userId };

        // If it's the first address, set it as default
        const existingCount = await Address.countDocuments({ userId });
        if (existingCount === 0) {
            addressData.isDefault = true;
        }

        const address = await Address.create(addressData);

        return sendResponse(res, 201, 'Address added successfully', address);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get all user addresses
 * @route   GET /api/addresses
 * @access  Private
 */
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        return sendResponse(res, 200, 'Addresses fetched successfully', addresses);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Update an address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res) => {
    try {
        let address = await Address.findOne({ _id: req.params.id, userId: req.user._id });

        if (!address) {
            return sendError(res, 404, 'Address not found');
        }

        // Handle isDefault logic: if setting this one to default, others become non-default
        if (req.body.isDefault === true && !address.isDefault) {
            await Address.updateMany(
                { userId: req.user._id, _id: { $ne: req.params.id } },
                { $set: { isDefault: false } }
            );
        }

        address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        return sendResponse(res, 200, 'Address updated successfully', address);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Delete an address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!address) {
            return sendError(res, 404, 'Address not found');
        }

        // If deleted address was default, make the most recent one default
        if (address.isDefault) {
            const nextAddress = await Address.findOne({ userId: req.user._id }).sort('-createdAt');
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return sendResponse(res, 200, 'Address deleted successfully');
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};
