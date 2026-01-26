import express from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/payments/create-session
// @desc    Creates a payment session with a provider like PayPal
// @access  Private
router.post('/create-session', verifyToken, PaymentController.createPayment);

export default router;
