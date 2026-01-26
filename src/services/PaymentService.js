import paypal from 'paypal-rest-sdk';
import config from '../config/config.js';
import pool from '../config/database.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('payment');

// Configure PayPal SDK
paypal.configure({
  mode: config.PAYPAL_MODE, // 'sandbox' or 'live'
  client_id: config.PAYPAL_CLIENT_ID,
  client_secret: config.PAYPAL_CLIENT_SECRET,
});

const createPaymentSession = (paymentData) => {
  return new Promise((resolve, reject) => {
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: paymentData.return_url, // URL to redirect to on successful payment
        cancel_url: paymentData.cancel_url, // URL to redirect to on cancelled payment
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Premium Subscription',
                sku: '001',
                price: '10.00',
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: '10.00',
          },
          description: 'Subscription to AIQuiz Premium Plan.',
          custom: paymentData.userId.toString(), // Pass user ID for webhook identification
        },
      ],
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        log.error('PayPal Payment Creation Error:', error.response);
        reject(error);
      } else {
        const approval_url = payment.links.find(link => link.rel === 'approval_url').href;
        resolve({ approval_url });
      }
    });
  });
};

const handleWebhook = async (webhookEvent) => {
    // TODO: Verify webhook signature in production (webhookId required)
    
    log.debug('Received PayPal Webhook:', webhookEvent?.event_type);

    const eventType = webhookEvent.event_type;

    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        const resource = webhookEvent.resource;
        const customId = resource.purchase_units[0].custom_id;
        const userId = parseInt(customId, 10);

        if (!userId) {
          log.error('Webhook Error: User ID not found in custom field.');
            return;
        }

        try {
            // Update user to premium in the database
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1); // e.g., 1-month subscription

            await pool.query(
                'UPDATE users SET is_premium = ?, subscription_tier = ?, subscription_expires_at = ? WHERE user_id = ?',
                [true, 'premium', expiresAt, userId]
            );

            log.info(`User ${userId} successfully upgraded to premium.`);

        } catch (dbError) {
          log.error('Database Error after webhook processing:', dbError);
        }
    }
};

export const PaymentService = {
  createPaymentSession,
  handleWebhook,
};
