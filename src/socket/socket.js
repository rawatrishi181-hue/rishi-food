const socketIO = require('socket.io');

let io;

/**
 * Initialize socket server
 * @param {Object} server - HTTP server instance
 */
const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Adjust this in production for security
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`New socket connection: ${socket.id}`);

        /**
         * Join room based on user role and ID
         */
        socket.on('join', (data) => {
            const { userId, role } = data;
            socket.join(userId);
            if (role === 'admin') {
                socket.join('admin_room');
            }
            if (role === 'delivery') {
                socket.join('delivery_room');
            }
            console.log(`${role} ${userId} joined their rooms`);
        });

        /**
         * Real-time Chat
         */
        socket.on('send_message', (data) => {
            const { receiverId, message, senderId, orderId } = data;
            io.to(receiverId).emit('receive_message', {
                senderId,
                message,
                orderId,
                timestamp: new Date()
            });
        });

        /**
         * Live Location Tracking
         */
        socket.on('update_location', (data) => {
            const { deliveryBoyId, orderId, lat, lng } = data;
            // Notify the customer of this specific order
            io.to(data.customerId).emit('location_update', {
                orderId,
                lat,
                lng
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Get the socket instance
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

/**
 * Emit order status update to a specific user
 * @param {string} userId - ID of the user who placed the order
 * @param {Object} data - Payload containing orderId and new status
 */
const emitOrderStatusUpdate = (userId, data) => {
    if (io) {
        io.to(userId.toString()).emit('order_status_update', data);
        // Also notify admins
        io.to('admin_room').emit('admin_order_update', data);
        console.log(`Emitted status update to user ${userId} and admin`);
    }
};

/**
 * Emit new order to admin
 */
const emitNewOrder = (order) => {
    if (io) {
        io.to('admin_room').emit('new_order', order);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitOrderStatusUpdate,
    emitNewOrder
};
