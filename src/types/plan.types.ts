/**
 * Represents the structure of the `features` object within a Plan.
 */
export interface PlanFeatures {
  max_cases: number | null; // null for unlimited
  cvo_review_enabled: boolean;
  legal_board_audit_enabled: boolean;
  [key: string]: any;
}

/**
 * Represents a subscription plan record from the `plans` table.
 */
export interface Plan {
  id: number;
  name: string;
  price_monthly: number;
  price_quarterly: number;
  price_half_yearly: number;
  price_yearly: number;
  is_popular: boolean;
  features: PlanFeatures;
}
