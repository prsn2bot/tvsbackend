// Represents the `audit_logs` table
export interface AuditLog {
  id: string; // BigInt represented as string in JS
  user_id?: string; // UUID
  action: string;
  details?: Record<string, any>; // JSONB
  previous_hash?: string;
  current_hash: string;
  created_at: Date;
}
