# TODO: Integrate Razorpay Payment System

## Tasks

- [ ] Create razorPayment.controller.ts with createRazorpayOrder and verifyPayment functions
- [ ] Create razorWebhook.controller.ts with handleRazorpayWebhook function
- [ ] Create razorPayment.route.ts for payment endpoints
- [ ] Create razorWebhook.route.ts for webhook endpoint
- [ ] Update app.ts to register new routes
- [ ] Test the integration

## Notes

- Adapt code to use PlanService.getPlanById instead of findPackageById
- Use SubscriptionService.createSubscription for activating subscriptions
- Use plan.price_monthly for amount calculation
- Simplify webhook logic since no subscription types are defined
