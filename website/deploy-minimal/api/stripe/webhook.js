// Stripe Webhook Handler for VARAi Connected Apps
// Processes Stripe webhook events for billing automation

class StripeWebhookHandler {
    constructor() {
        this.stripeAPI = new StripeAPI();
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123';
    }

    // Main webhook processing endpoint
    async handleWebhook(request, response) {
        try {
            const payload = request.body;
            const signature = request.headers['stripe-signature'];

            // Verify webhook signature (in production, use actual Stripe verification)
            const event = this.verifyWebhookSignature(payload, signature);
            
            console.log(`Processing webhook event: ${event.type}`);

            // Process the event based on type
            const result = await this.processWebhookEvent(event);

            // Send success response
            response.status(200).json({ 
                received: true, 
                processed: true,
                eventType: event.type,
                result: result
            });

        } catch (error) {
            console.error('Webhook processing error:', error);
            response.status(400).json({ 
                error: error.message,
                received: false 
            });
        }
    }

    // Verify webhook signature (mock implementation)
    verifyWebhookSignature(payload, signature) {
        // In production, use: stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)
        try {
            const event = JSON.parse(payload);
            console.log('Webhook signature verified (mock)');
            return event;
        } catch (error) {
            throw new Error('Invalid webhook payload');
        }
    }

    // Process webhook events based on type
    async processWebhookEvent(event) {
        switch (event.type) {
            // Subscription events
            case 'customer.subscription.created':
                return await this.handleSubscriptionCreated(event.data.object);
            
            case 'customer.subscription.updated':
                return await this.handleSubscriptionUpdated(event.data.object);
            
            case 'customer.subscription.deleted':
                return await this.handleSubscriptionDeleted(event.data.object);

            // Payment events
            case 'invoice.payment_succeeded':
                return await this.handlePaymentSucceeded(event.data.object);
            
            case 'invoice.payment_failed':
                return await this.handlePaymentFailed(event.data.object);

            // Customer events
            case 'customer.created':
                return await this.handleCustomerCreated(event.data.object);
            
            case 'customer.updated':
                return await this.handleCustomerUpdated(event.data.object);

            // Payment method events
            case 'payment_method.attached':
                return await this.handlePaymentMethodAttached(event.data.object);
            
            case 'payment_method.detached':
                return await this.handlePaymentMethodDetached(event.data.object);

            // Checkout events
            case 'checkout.session.completed':
                return await this.handleCheckoutCompleted(event.data.object);

            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
                return { status: 'ignored', reason: 'Unhandled event type' };
        }
    }

    // Subscription event handlers
    async handleSubscriptionCreated(subscription) {
        try {
            console.log('Processing subscription created:', subscription.id);

            const customerId = subscription.customer;
            const planId = subscription.items.data[0].price.id;
            
            // Update customer record with new subscription
            await this.updateCustomerSubscription(customerId, {
                subscriptionId: subscription.id,
                status: subscription.status,
                planId: planId,
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            });

            // Grant token allowance based on plan
            await this.grantTokenAllowance(customerId, planId);

            // Send welcome email
            await this.sendSubscriptionWelcomeEmail(customerId, subscription);

            return { 
                status: 'processed', 
                action: 'subscription_activated',
                subscriptionId: subscription.id 
            };

        } catch (error) {
            console.error('Error handling subscription created:', error);
            throw error;
        }
    }

    async handleSubscriptionUpdated(subscription) {
        try {
            console.log('Processing subscription updated:', subscription.id);

            const customerId = subscription.customer;
            const planId = subscription.items.data[0].price.id;
            
            // Update customer record
            await this.updateCustomerSubscription(customerId, {
                subscriptionId: subscription.id,
                status: subscription.status,
                planId: planId,
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            });

            // Adjust token allowance if plan changed
            await this.adjustTokenAllowance(customerId, planId);

            // Handle cancellation
            if (subscription.cancel_at_period_end) {
                await this.handleSubscriptionCancellation(customerId, subscription);
            }

            return { 
                status: 'processed', 
                action: 'subscription_updated',
                subscriptionId: subscription.id 
            };

        } catch (error) {
            console.error('Error handling subscription updated:', error);
            throw error;
        }
    }

    async handleSubscriptionDeleted(subscription) {
        try {
            console.log('Processing subscription deleted:', subscription.id);

            const customerId = subscription.customer;
            
            // Update customer record to remove subscription
            await this.removeCustomerSubscription(customerId, subscription.id);

            // Revoke token allowance
            await this.revokeTokenAllowance(customerId);

            // Send cancellation confirmation email
            await this.sendSubscriptionCancellationEmail(customerId, subscription);

            return { 
                status: 'processed', 
                action: 'subscription_cancelled',
                subscriptionId: subscription.id 
            };

        } catch (error) {
            console.error('Error handling subscription deleted:', error);
            throw error;
        }
    }

    // Payment event handlers
    async handlePaymentSucceeded(invoice) {
        try {
            console.log('Processing payment succeeded:', invoice.id);

            const customerId = invoice.customer;
            const subscriptionId = invoice.subscription;

            if (subscriptionId) {
                // Subscription payment - reset monthly token allowance
                await this.resetMonthlyTokenAllowance(customerId);
                await this.sendPaymentSuccessEmail(customerId, invoice);
            } else {
                // One-time payment - add tokens to account
                await this.processOneTimeTokenPurchase(customerId, invoice);
            }

            // Record payment in customer history
            await this.recordPaymentHistory(customerId, invoice);

            return { 
                status: 'processed', 
                action: 'payment_processed',
                invoiceId: invoice.id 
            };

        } catch (error) {
            console.error('Error handling payment succeeded:', error);
            throw error;
        }
    }

    async handlePaymentFailed(invoice) {
        try {
            console.log('Processing payment failed:', invoice.id);

            const customerId = invoice.customer;
            const attemptCount = invoice.attempt_count;

            // Send payment failure notification
            await this.sendPaymentFailureEmail(customerId, invoice);

            // Handle multiple failures
            if (attemptCount >= 3) {
                await this.handleRepeatedPaymentFailure(customerId, invoice);
            }

            // Record failed payment
            await this.recordFailedPayment(customerId, invoice);

            return { 
                status: 'processed', 
                action: 'payment_failed_handled',
                invoiceId: invoice.id 
            };

        } catch (error) {
            console.error('Error handling payment failed:', error);
            throw error;
        }
    }

    // Customer event handlers
    async handleCustomerCreated(customer) {
        try {
            console.log('Processing customer created:', customer.id);

            // Initialize customer record in our database
            await this.initializeCustomerRecord(customer);

            // Send welcome email
            await this.sendCustomerWelcomeEmail(customer);

            return { 
                status: 'processed', 
                action: 'customer_initialized',
                customerId: customer.id 
            };

        } catch (error) {
            console.error('Error handling customer created:', error);
            throw error;
        }
    }

    async handleCustomerUpdated(customer) {
        try {
            console.log('Processing customer updated:', customer.id);

            // Update customer record
            await this.updateCustomerRecord(customer);

            return { 
                status: 'processed', 
                action: 'customer_updated',
                customerId: customer.id 
            };

        } catch (error) {
            console.error('Error handling customer updated:', error);
            throw error;
        }
    }

    // Payment method event handlers
    async handlePaymentMethodAttached(paymentMethod) {
        try {
            console.log('Processing payment method attached:', paymentMethod.id);

            const customerId = paymentMethod.customer;
            
            // Update customer payment methods
            await this.addCustomerPaymentMethod(customerId, paymentMethod);

            return { 
                status: 'processed', 
                action: 'payment_method_added',
                paymentMethodId: paymentMethod.id 
            };

        } catch (error) {
            console.error('Error handling payment method attached:', error);
            throw error;
        }
    }

    async handlePaymentMethodDetached(paymentMethod) {
        try {
            console.log('Processing payment method detached:', paymentMethod.id);

            const customerId = paymentMethod.customer;
            
            // Remove payment method from customer record
            await this.removeCustomerPaymentMethod(customerId, paymentMethod.id);

            return { 
                status: 'processed', 
                action: 'payment_method_removed',
                paymentMethodId: paymentMethod.id 
            };

        } catch (error) {
            console.error('Error handling payment method detached:', error);
            throw error;
        }
    }

    // Checkout event handlers
    async handleCheckoutCompleted(session) {
        try {
            console.log('Processing checkout completed:', session.id);

            const customerId = session.customer;
            const mode = session.mode;

            if (mode === 'payment') {
                // One-time payment for tokens
                await this.processTokenPurchaseFromCheckout(customerId, session);
            } else if (mode === 'subscription') {
                // Subscription setup
                await this.processSubscriptionFromCheckout(customerId, session);
            }

            return { 
                status: 'processed', 
                action: 'checkout_processed',
                sessionId: session.id 
            };

        } catch (error) {
            console.error('Error handling checkout completed:', error);
            throw error;
        }
    }

    // Helper methods for database operations (mock implementations)
    async updateCustomerSubscription(customerId, subscriptionData) {
        console.log(`Updating subscription for customer ${customerId}:`, subscriptionData);
        // In production: Update database with subscription details
    }

    async grantTokenAllowance(customerId, planId) {
        console.log(`Granting token allowance for customer ${customerId}, plan ${planId}`);
        // In production: Update customer token allowance based on plan
    }

    async adjustTokenAllowance(customerId, planId) {
        console.log(`Adjusting token allowance for customer ${customerId}, plan ${planId}`);
        // In production: Adjust token allowance for plan changes
    }

    async revokeTokenAllowance(customerId) {
        console.log(`Revoking token allowance for customer ${customerId}`);
        // In production: Remove token allowance for cancelled subscriptions
    }

    async resetMonthlyTokenAllowance(customerId) {
        console.log(`Resetting monthly token allowance for customer ${customerId}`);
        // In production: Reset monthly token count for subscription renewals
    }

    async processOneTimeTokenPurchase(customerId, invoice) {
        console.log(`Processing one-time token purchase for customer ${customerId}:`, invoice.id);
        // In production: Add purchased tokens to customer account
    }

    async recordPaymentHistory(customerId, invoice) {
        console.log(`Recording payment history for customer ${customerId}:`, invoice.id);
        // In production: Store payment record in database
    }

    async recordFailedPayment(customerId, invoice) {
        console.log(`Recording failed payment for customer ${customerId}:`, invoice.id);
        // In production: Store failed payment record
    }

    async handleRepeatedPaymentFailure(customerId, invoice) {
        console.log(`Handling repeated payment failure for customer ${customerId}`);
        // In production: Suspend service, send urgent notifications
    }

    async initializeCustomerRecord(customer) {
        console.log(`Initializing customer record:`, customer.id);
        // In production: Create customer record in database
    }

    async updateCustomerRecord(customer) {
        console.log(`Updating customer record:`, customer.id);
        // In production: Update customer information in database
    }

    async addCustomerPaymentMethod(customerId, paymentMethod) {
        console.log(`Adding payment method for customer ${customerId}:`, paymentMethod.id);
        // In production: Store payment method details
    }

    async removeCustomerPaymentMethod(customerId, paymentMethodId) {
        console.log(`Removing payment method ${paymentMethodId} for customer ${customerId}`);
        // In production: Remove payment method from database
    }

    async processTokenPurchaseFromCheckout(customerId, session) {
        console.log(`Processing token purchase from checkout for customer ${customerId}:`, session.id);
        // In production: Add purchased tokens to customer account
    }

    async processSubscriptionFromCheckout(customerId, session) {
        console.log(`Processing subscription from checkout for customer ${customerId}:`, session.id);
        // In production: Set up subscription in database
    }

    // Email notification methods (mock implementations)
    async sendSubscriptionWelcomeEmail(customerId, subscription) {
        console.log(`Sending welcome email to customer ${customerId}`);
        // In production: Send actual email via email service
    }

    async sendSubscriptionCancellationEmail(customerId, subscription) {
        console.log(`Sending cancellation email to customer ${customerId}`);
        // In production: Send cancellation confirmation email
    }

    async sendPaymentSuccessEmail(customerId, invoice) {
        console.log(`Sending payment success email to customer ${customerId}`);
        // In production: Send payment confirmation email
    }

    async sendPaymentFailureEmail(customerId, invoice) {
        console.log(`Sending payment failure email to customer ${customerId}`);
        // In production: Send payment failure notification
    }

    async sendCustomerWelcomeEmail(customer) {
        console.log(`Sending customer welcome email to ${customer.id}`);
        // In production: Send welcome email to new customer
    }

    async handleSubscriptionCancellation(customerId, subscription) {
        console.log(`Handling subscription cancellation for customer ${customerId}`);
        // In production: Process cancellation, send notifications
    }

    async removeCustomerSubscription(customerId, subscriptionId) {
        console.log(`Removing subscription ${subscriptionId} for customer ${customerId}`);
        // In production: Remove subscription from database
    }
}

// Express.js endpoint setup (for Node.js environments)
if (typeof module !== 'undefined' && module.exports) {
    const express = require('express');
    const webhookHandler = new StripeWebhookHandler();

    // Webhook endpoint
    const webhookRouter = express.Router();
    
    webhookRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
        await webhookHandler.handleWebhook(req, res);
    });

    module.exports = {
        StripeWebhookHandler,
        webhookRouter
    };
} else {
    // Browser environment
    window.StripeWebhookHandler = StripeWebhookHandler;
}