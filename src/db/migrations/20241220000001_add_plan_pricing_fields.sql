-- Migration to add quarterly, half yearly, yearly prices and is_popular boolean to plans table

ALTER TABLE plans
ADD COLUMN price_quarterly NUMERIC(10, 2) DEFAULT 0 NOT NULL,
ADD COLUMN price_half_yearly NUMERIC(10, 2) DEFAULT 0 NOT NULL,
ADD COLUMN price_yearly NUMERIC(10, 2) DEFAULT 0 NOT NULL,
ADD COLUMN is_popular BOOLEAN DEFAULT FALSE NOT NULL;
