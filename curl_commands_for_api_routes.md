# Curl commands for Razorpay API routes

## Create Razorpay Order

curl -X POST http://localhost:PORT/api/v1/razorpay/create-order \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d "{\"planId\": \"PLAN_ID\", \"userId\": \"USER_ID\"}"

## Verify Razorpay Payment

curl -X POST http://localhost:PORT/api/v1/razorpay/verify-payment \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d "{\"razorpay_order_id\": \"ORDER_ID\", \"razorpay_payment_id\": \"PAYMENT_ID\", \"razorpay_signature\": \"SIGNATURE\"}"

## Razorpay Webhook Endpoint

The webhook endpoint is configured at:
POST http://localhost:PORT/api/v1/razorpay-webhook
Content-Type: application/json
X-Razorpay-Signature: SIGNATURE

This endpoint is called by Razorpay to notify payment events.

Replace PORT, YOUR_ACCESS_TOKEN, PLAN_ID, USER_ID, ORDER_ID, PAYMENT_ID, and SIGNATURE with actual values.
