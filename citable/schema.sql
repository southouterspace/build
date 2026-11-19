CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  host TEXT NOT NULL,
  score INTEGER NOT NULL,
  json TEXT NOT NULL,
  account_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_url ON reports(url, created_at);

CREATE TABLE IF NOT EXISTS hits (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  expires INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  secret TEXT NOT NULL UNIQUE,
  public_id TEXT NOT NULL UNIQUE,
  email TEXT,
  plan TEXT NOT NULL,              -- pro | agency
  status TEXT NOT NULL,            -- active | canceled | past_due
  brand TEXT,
  color TEXT,
  logo_url TEXT,
  cta_url TEXT,
  cta_label TEXT,
  webhook_url TEXT,
  stripe_customer TEXT,
  stripe_subscription TEXT UNIQUE,
  stripe_session TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  url TEXT NOT NULL,
  last_signature TEXT,
  last_score INTEGER,
  last_report TEXT,
  last_checked INTEGER NOT NULL DEFAULT 0,
  last_changed INTEGER,
  created_at INTEGER NOT NULL,
  UNIQUE(account_id, url)
);
CREATE INDEX IF NOT EXISTS monitors_due ON monitors(last_checked);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  site TEXT NOT NULL,
  score INTEGER,
  report_id TEXT,
  page TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_account ON leads(account_id, created_at);

CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT NOT NULL,
  plan TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (email, plan)
);
