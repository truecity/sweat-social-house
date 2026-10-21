CREATE SCHEMA IF NOT EXISTS ssh;
REVOKE ALL ON SCHEMA ssh FROM PUBLIC;
CREATE TABLE IF NOT EXISTS ssh.subscribers (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 80),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed')),
  marketing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_email_at timestamptz
);
CREATE TABLE IF NOT EXISTS ssh.consent_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES ssh.subscribers(id) ON DELETE CASCADE,
  kind text NOT NULL,
  granted boolean NOT NULL,
  version text NOT NULL,
  wording text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ssh.tokens (
  hash text PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES ssh.subscribers(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('confirm','manage')),
  payload jsonb NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS tokens_expiry ON ssh.tokens(expires_at);
CREATE TABLE IF NOT EXISTS ssh.rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS ssh.admin_identity (
  singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
  clerk_user_id text UNIQUE NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ssh.admin_actions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON ALL TABLES IN SCHEMA ssh FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ssh FROM PUBLIC;
