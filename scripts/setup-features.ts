import { query } from '../src/config/database';

const setupDatabase = async () => {
  const queries = [
    // This function will be used by triggers to automatically update the 'updated_at' column.
    `
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `,

    // Create the 'coupons' table if it doesn't exist.
    `
    CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        discount_type VARCHAR(50) NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        package_id INTEGER REFERENCES subscription_packages(id) ON DELETE SET NULL,
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        valid_until TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `,

    // Create the trigger for the 'coupons' table.
    `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp' AND tgrelid = 'coupons'::regclass) THEN
            CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON coupons
            FOR EACH ROW
            EXECUTE PROCEDURE trigger_set_timestamp();
        END IF;
    END
    $$;
    `,

    // Create the 'subscriptions' table if it doesn't exist.
    `
    CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        package_id INTEGER NOT NULL REFERENCES subscription_packages(id) ON DELETE RESTRICT,
        coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2) NOT NULL,
        duration VARCHAR(255) NOT NULL,
        starts_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ,
        payment_method VARCHAR(50),
        payment_gateway_subscription_id TEXT,
        payment_gateway_customer_id TEXT,
        payment_transaction_id VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        created_by_admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `,

    // Create the trigger for the 'subscriptions' table.
    `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp' AND tgrelid = 'subscriptions'::regclass) THEN
            CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW
            EXECUTE PROCEDURE trigger_set_timestamp();
        END IF;
    END
    $$;
    `
  ];

  console.log('[Migration] Starting database setup for coupons and subscriptions...');

  for (const sql of queries) {
    try {
      await query(sql);
      // A simple log to show which type of query succeeded.
      if (sql.includes('CREATE OR REPLACE FUNCTION')) console.log('[Migration] - Timestamp function ensured.');
      if (sql.includes('CREATE TABLE IF NOT EXISTS coupons')) console.log('[Migration] - Coupons table ensured.');
      if (sql.includes('ON coupons')) console.log('[Migration] - Coupons trigger ensured.');
      if (sql.includes('CREATE TABLE IF NOT EXISTS subscriptions')) console.log('[Migration] - Subscriptions table ensured.');
      if (sql.includes('ON subscriptions')) console.log('[Migration] - Subscriptions trigger ensured.');

    } catch (error) {
      console.error('[Migration] Error executing query:', error);
      // It might be useful to log which query failed.
      console.error('Failing SQL:', sql.substring(0, 100) + '...');
      process.exit(1);
    }
  }

  console.log('[Migration] Database setup for features completed successfully.');
  process.exit(0);
};

setupDatabase(); 