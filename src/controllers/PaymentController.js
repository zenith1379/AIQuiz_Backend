import { PaymentService } from '../services/PaymentService.js';
import config from '../config/config.js';

const createPayment = async (req, res, next) => {
  const userId = req.user.user_id;
  const { payment_method } = req.body;

  if (payment_method !== 'paypal') {
    return res.status(400).json({ message: 'Currently, only PayPal is supported.' });
  }

  try {
    // Construct URLs for PayPal redirection
    const return_url = `${config.FRONTEND_URL}/payment/success`;
    const cancel_url = `${config.FRONTEND_URL}/payment/cancel`;

    const paymentData = {
      userId,
      return_url,
      cancel_url,
    };

    const { approval_url } = await PaymentService.createPaymentSession(paymentData);
    
    res.status(200).json({ approval_url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    next(new Error('Failed to create payment session.'));
  }
};

const paymentWebhook = async (req, res, next) => {
  try {
    // The request body is the raw webhook event from PayPal
    const webhookEvent = req.body;
    
    // Process the webhook asynchronously
    PaymentService.handleWebhook(webhookEvent).catch(error => {
        // Log errors that happen during async processing
        console.error('Error handling webhook:', error);
    });

    // Acknowledge receipt
    res.status(200).send();
  } catch (error) {
    console.error('Error in webhook endpoint:', error);
    next(error);
  }
};

export const PaymentController = {
  createPayment,
  paymentWebhook,
};
