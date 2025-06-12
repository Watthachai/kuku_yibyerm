-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'kuku_yibyerm_admin') THEN

      CREATE ROLE kuku_yibyerm_admin LOGIN PASSWORD 'kuku_yibyerm_passw0rd';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE kuku_yibyerm_db OWNER kuku_yibyerm_admin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kuku_yibyerm_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kuku_yibyerm_db TO kuku_yibyerm_admin;

-- Connect to the database and create extensions if needed
\c kuku_yibyerm_db;

-- Create uuid extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO kuku_yibyerm_admin;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kuku_yibyerm_admin;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kuku_yibyerm_admin;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO kuku_yibyerm_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO kuku_yibyerm_admin;