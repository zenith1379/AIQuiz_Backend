import express from 'express';
import { PaymentController } from '../controllers/PaymentController.js';

const router = express.Router();

// @route   POST /api/webhooks/payment-complete
// @desc    Webhook endpoint for payment providers (e.g., PayPal)
// @access  Public
router.post('/payment-complete', PaymentController.paymentWebhook);

export default router;
