-- Migration to fix ID types: change all IDs to SERIAL (integer) for consistency
-- Drop tables in reverse order of dependencies

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS case_status CASCADE;
DROP TYPE IF EXISTS review_type CASCADE;
DROP TYPE IF EXISTS review_status CASCADE;
DROP TYPE IF EXISTS ocr_status CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('officer', 'cvo', 'legal_board', 'admin', 'owner');
CREATE TYPE account_status AS ENUM ('pending_verification', 'active', 'inactive', 'suspended');
CREATE TYPE case_status AS ENUM ('intake', 'ai_analysis', 'awaiting_officer_review', 'awaiting_cvo_review', 'awaiting_legal_review', 'finalized', 'archived');
CREATE TYPE review_type AS ENUM ('cvo', 'legal_board');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'escalated_to_legal');
CREATE TYPE ocr_status AS ENUM ('pending', 'completed', 'failed');

DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS ai_drafts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate tables with SERIAL PRIMARY KEY for all IDs

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  account_status account_status NOT NULL,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  employee_id VARCHAR(100),
  cadre_service VARCHAR(100),
  designation_rank VARCHAR(100),
  profile_photo_url TEXT,
  head_office_address TEXT,
  branch_office_address TEXT,
  country VARCHAR(100),
  state VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  officer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  case_title VARCHAR(255) NOT NULL,
  status case_status NOT NULL,
  assigned_cvo_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_legal_board_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  original_filename VARCHAR(255),
  cloudinary_public_id VARCHAR(255),
  secure_url TEXT,
  file_type VARCHAR(50),
  file_size_bytes INTEGER,
  ocr_text TEXT,
  vector_embedding BYTEA,
  ocr_status VARCHAR(50) DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_drafts (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  defence_score DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  review_type VARCHAR(50),
  comments TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_monthly NUMERIC(10, 2) NOT NULL,
  features JSONB
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  payment_provider_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_ai_drafts_case_id ON ai_drafts(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status ON documents(ocr_status);

-- Recreate constraints
ALTER TABLE ai_drafts ADD CONSTRAINT unique_case_version UNIQUE (case_id, version);
