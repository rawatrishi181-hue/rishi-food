const express = require('express');
const { 
    getFAQs, createFAQ, updateFAQ, deleteFAQ,
    createTicket, getMyTickets, getAllTickets, updateTicket 
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/faqs', getFAQs);

// User Routes
router.post('/tickets', protect, createTicket);
router.get('/tickets/my', protect, getMyTickets);

// Admin Routes
router.post('/faqs', protect, authorize('admin'), createFAQ);
router.put('/faqs/:id', protect, authorize('admin'), updateFAQ);
router.delete('/faqs/:id', protect, authorize('admin'), deleteFAQ);

router.get('/tickets', protect, authorize('admin'), getAllTickets);
router.put('/tickets/:id', protect, authorize('admin'), updateTicket);

module.exports = router;
