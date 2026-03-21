const Chat = require('../models/Chat');
const { sendResponse, sendError } = require('../utils/responseHandler');

/**
 * @desc    Save chat message and emit via socket
 * @route   POST /chat
 * @access  Private
 */
const sendMessage = async (req, res) => {
    try {
        const { orderId, receiverId, message } = req.body;
        const senderId = req.user._id;

        const chat = await Chat.create({
            orderId,
            senderId,
            receiverId,
            message
        });

        // Emit via socket if possible
        const { getIO } = require('../socket/socket');
        const io = getIO();
        if (io) {
            io.to(receiverId.toString()).emit('receive_message', {
                orderId,
                senderId,
                message,
                timestamp: chat.createdAt
            });
        }

        return sendResponse(res, 201, 'Message sent', chat);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

/**
 * @desc    Get chat history for an order
 * @route   GET /chat/:orderId
 * @access  Private
 */
const getChatHistory = async (req, res) => {
    try {
        const { orderId } = req.params;
        const chats = await Chat.find({ orderId }).sort('createdAt');
        return sendResponse(res, 200, 'Chat history fetched', chats);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

module.exports = {
    sendMessage,
    getChatHistory
};
