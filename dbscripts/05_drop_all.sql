-- =============================================================
-- 05_drop_all.sql
-- WARNING: Drops all tables and extensions. Use for full reset.
-- Usage: psql -U postgres -d startupdb -f 05_drop_all.sql
-- =============================================================

DROP TABLE IF EXISTS documents  CASCADE;
DROP TABLE IF EXISTS deals      CASCADE;
DROP TABLE IF EXISTS events     CASCADE;
DROP TABLE IF EXISTS investors  CASCADE;
DROP TABLE IF EXISTS startups   CASCADE;
DROP TABLE IF EXISTS users      CASCADE;

DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS "uuid-ossp";

\echo '>>> All tables and extensions dropped.'
\echo '>>> Run 02 → 03 → 04 to recreate.'
