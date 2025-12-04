#!/bin/bash
set -e

# Check if we're running as the correct user
echo "Running database initialization as user: $POSTGRES_USER"

# Create application user if it doesn't exist (and isn't the main user)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- The main user already exists and has all privileges
    -- We'll just ensure the database and extensions are ready
    
    -- Create test database if it doesn't exist
    SELECT 'CREATE DATABASE intelliclaim_test OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'intelliclaim_test')\gexec
    
    -- Create extensions in main database
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Create extensions in test database
    \\c intelliclaim_test
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    \\c $POSTGRES_DB
EOSQL

echo "Database initialization completed successfully!"
echo "Main database: $POSTGRES_DB"
echo "Main user: $POSTGRES_USER"
