const FAQ = require('../models/FAQ');
const SupportTicket = require('../models/SupportTicket');
const { sendResponse, sendError } = require('../utils/responseHandler');

// --- FAQ Controllers ---

exports.getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        return sendResponse(res, 200, 'FAQs fetched successfully', faqs);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.createFAQ = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        return sendResponse(res, 201, 'FAQ created successfully', faq);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!faq) return sendError(res, 404, 'FAQ not found');
        return sendResponse(res, 200, 'FAQ updated successfully', faq);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return sendError(res, 404, 'FAQ not found');
        return sendResponse(res, 200, 'FAQ deleted successfully', {});
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

// --- Support Ticket Controllers ---

exports.createTicket = async (req, res) => {
    try {
        const ticketData = {
            ...req.body,
            userId: req.user._id
        };
        const ticket = await SupportTicket.create(ticketData);
        return sendResponse(res, 201, 'Support ticket raised successfully', ticket);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user._id }).sort('-createdAt');
        return sendResponse(res, 200, 'Your tickets fetched successfully', tickets);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find().populate('userId', 'name email').sort('-createdAt');
        return sendResponse(res, 200, 'All tickets fetched successfully', tickets);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) return sendError(res, 404, 'Ticket not found');
        return sendResponse(res, 200, 'Ticket updated successfully', ticket);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
};
