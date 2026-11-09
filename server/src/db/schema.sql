-- Maintenix database schema
-- Core schema for authentication, CRM, jobs, field workflow, variations, and reports.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operative', 'client')),
  phone VARCHAR(40),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(40),
  billing_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_idx ON clients (LOWER(email));
CREATE INDEX IF NOT EXISTS clients_client_user_id_idx ON clients (client_user_id);

DROP TRIGGER IF EXISTS clients_set_updated_at ON clients;

CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name VARCHAR(160) NOT NULL,
  address_line1 VARCHAR(180) NOT NULL,
  address_line2 VARCHAR(180),
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  access_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_client_id_idx ON properties (client_id);
CREATE INDEX IF NOT EXISTS properties_postcode_idx ON properties (postcode);
CREATE UNIQUE INDEX IF NOT EXISTS properties_client_name_idx ON properties (client_id, LOWER(name));

DROP TRIGGER IF EXISTS properties_set_updated_at ON properties;

CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  assigned_operative_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'assigned',
      'in_progress',
      'on_hold',
      'completed',
      'cancelled'
    )
  ),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  scheduled_date DATE,
  due_date DATE,
  completion_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT jobs_completion_status_check CHECK (
    status = 'completed'
    OR completion_date IS NULL
  )
);

CREATE INDEX IF NOT EXISTS jobs_client_id_idx ON jobs (client_id);
CREATE INDEX IF NOT EXISTS jobs_property_id_idx ON jobs (property_id);
CREATE INDEX IF NOT EXISTS jobs_assigned_operative_id_idx ON jobs (assigned_operative_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_priority_idx ON jobs (priority);
CREATE INDEX IF NOT EXISTS jobs_scheduled_date_idx ON jobs (scheduled_date);
CREATE INDEX IF NOT EXISTS jobs_due_date_idx ON jobs (due_date);

DROP TRIGGER IF EXISTS jobs_set_updated_at ON jobs;

CREATE TRIGGER jobs_set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_notes_job_id_idx ON job_notes (job_id);
CREATE INDEX IF NOT EXISTS job_notes_user_id_idx ON job_notes (user_id);
CREATE INDEX IF NOT EXISTS job_notes_created_at_idx ON job_notes (created_at);

CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  photo_type VARCHAR(20) NOT NULL CHECK (
    photo_type IN ('before', 'after', 'variation', 'general')
  ),
  file_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_photos_job_id_idx ON job_photos (job_id);
CREATE INDEX IF NOT EXISTS job_photos_uploaded_by_idx ON job_photos (uploaded_by);
CREATE INDEX IF NOT EXISTS job_photos_photo_type_idx ON job_photos (photo_type);

CREATE TABLE IF NOT EXISTS variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  estimated_amount NUMERIC(10, 2),
  admin_price NUMERIC(10, 2),
  client_decision_note TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'pending_admin_review' CHECK (
    status IN (
      'pending_admin_review',
      'pending_client_approval',
      'approved',
      'rejected'
    )
  ),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS variations_job_id_idx ON variations (job_id);
CREATE INDEX IF NOT EXISTS variations_raised_by_idx ON variations (raised_by);
CREATE INDEX IF NOT EXISTS variations_reviewed_by_idx ON variations (reviewed_by);
CREATE INDEX IF NOT EXISTS variations_status_idx ON variations (status);
CREATE INDEX IF NOT EXISTS variations_created_at_idx ON variations (created_at);

DROP TRIGGER IF EXISTS variations_set_updated_at ON variations;

CREATE TRIGGER variations_set_updated_at
BEFORE UPDATE ON variations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Performance indexes and data-safety constraints (safe to run repeatedly)
-- ---------------------------------------------------------------------------

-- Trigram indexes make "contains" searches (ILIKE '%text%') fast.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx ON jobs USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS clients_name_trgm_idx ON clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS properties_name_trgm_idx ON properties USING gin (name gin_trgm_ops);

-- Common filter combinations: "this operative's jobs by status", "this client's jobs by status".
CREATE INDEX IF NOT EXISTS jobs_operative_status_idx ON jobs (assigned_operative_id, status);
CREATE INDEX IF NOT EXISTS jobs_client_status_idx ON jobs (client_id, status);

CREATE INDEX IF NOT EXISTS users_role_active_idx ON users (role, is_active);

-- One login user can belong to at most one client record.
CREATE UNIQUE INDEX IF NOT EXISTS clients_client_user_id_unique_idx
  ON clients (client_user_id)
  WHERE client_user_id IS NOT NULL;

-- Money values can never be negative.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'variations_estimated_amount_non_negative') THEN
    ALTER TABLE variations
      ADD CONSTRAINT variations_estimated_amount_non_negative
      CHECK (estimated_amount IS NULL OR estimated_amount >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'variations_admin_price_non_negative') THEN
    ALTER TABLE variations
      ADD CONSTRAINT variations_admin_price_non_negative
      CHECK (admin_price IS NULL OR admin_price >= 0);
  END IF;
END $$;
