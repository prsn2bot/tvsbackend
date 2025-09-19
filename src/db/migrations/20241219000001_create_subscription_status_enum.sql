-- Create subscription_status enum
CREATE TYPE subscription_status AS ENUM (
    'active',
    'cancelled', 
    'past_due',
    'trialing'
);

-- Update subscriptions table to use the enum
ALTER TABLE subscriptions 
ALTER COLUMN status TYPE subscription_status 
USING status::subscription_status;