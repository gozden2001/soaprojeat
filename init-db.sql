-- Create databases for different services
-- Main database is already created by POSTGRES_DB

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS tours;
CREATE SCHEMA IF NOT EXISTS purchases;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA tours TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA purchases TO postgres;

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE;