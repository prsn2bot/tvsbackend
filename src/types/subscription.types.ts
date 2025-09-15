import { Plan } from "./plan.types";

// Represents the `subscriptions` table
export interface Subscription {
  id: string; // UUID
  user_id: string; // UUID
  plan_id: number;
  payment_provider_subscription_id?: string;
  status: string; // e.g., 'active', 'canceled', 'past_due'
  start_date: Date;
  end_date?: Date;
  created_at: Date;
}

// A combined type for when fetching a subscription with its plan details
export type SubscriptionWithPlan = Subscription & { plan: Plan };
