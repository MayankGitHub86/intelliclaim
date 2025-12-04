-- Initialize IntelliClaim Database
-- This script runs when PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE intelliclaim'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'intelliclaim');

-- Connect to the intelliclaim database
\c intelliclaim;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS claims;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set default privileges
GRANT ALL PRIVILEGES ON DATABASE intelliclaim TO intelliclaim_user;
GRANT ALL ON SCHEMA public TO intelliclaim_user;
GRANT ALL ON SCHEMA auth TO intelliclaim_user;
GRANT ALL ON SCHEMA claims TO intelliclaim_user;
GRANT ALL ON SCHEMA documents TO intelliclaim_user;
GRANT ALL ON SCHEMA analytics TO intelliclaim_user;
