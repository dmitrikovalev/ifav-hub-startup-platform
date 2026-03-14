-- =============================================================
-- 02_enable_extensions.sql
-- Auto-executed by Docker on first container start
-- For manual use: psql -U postgres -d startupdb -f 02_enable_extensions.sql
-- =============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
