const express = require('express');
const { 
    getPartners, 
    createPartner, 
    updatePartner, 
    assignOrder 
} = require('../controllers/deliveryPartnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DeliveryPartners
 *   description: Delivery partner management
 */

router.get('/', protect, authorize('admin'), getPartners);
router.post('/', protect, authorize('admin'), createPartner);
router.put('/:id', protect, authorize('admin'), updatePartner);
router.post('/assign', protect, authorize('admin', 'restaurant'), assignOrder);

module.exports = router;
