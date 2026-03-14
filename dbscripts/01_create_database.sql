-- =============================================================
-- 01_create_database.sql
-- Run this as the postgres superuser BEFORE connecting to the DB
-- Usage: psql -U postgres -f 01_create_database.sql
-- =============================================================

-- Create the database
CREATE DATABASE startupdb
    WITH
    OWNER     = postgres
    ENCODING  = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE   = 'en_US.UTF-8'
    TEMPLATE  = template0;

-- Create a dedicated app user (optional but recommended)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'startupapp') THEN
        CREATE USER startupapp WITH PASSWORD 'startupapp123';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE startupdb TO startupapp;

\echo '>>> Database startupdb created successfully.'
\echo '>>> Connect with: psql -U startupapp -d startupdb'
