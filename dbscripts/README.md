# DB Scripts

Run scripts in order using `psql`.

## Prerequisites

1. PostgreSQL 14+ installed locally
2. **pgvector extension installed** — download from https://github.com/pgvector/pgvector  
   On Windows: use the installer from https://github.com/pgvector/pgvector/releases

---

## Quick Start

```powershell
# Step 1 — Create database and app user (run as postgres superuser)
psql -U postgres -f 01_create_database.sql

# Step 2 — Enable pgvector and uuid extensions
psql -U postgres -d startupdb -f 02_enable_extensions.sql

# Step 3 — Create all tables and indexes
psql -U postgres -d startupdb -f 03_create_tables.sql

# Step 4 — Insert sample data (optional)
psql -U postgres -d startupdb -f 04_seed_data.sql
```

## After running scripts — update .env

```env
# Option A: using app user
DATABASE_URL=postgresql://startupapp:startupapp123@localhost:5432/startupdb

# Option B: using postgres superuser
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/startupdb
```

## Reset everything

```powershell
psql -U postgres -d startupdb -f 05_drop_all.sql
# then re-run 02 → 03 → 04
```

---

## Script Reference

| File | Purpose |
|---|---|
| `01_create_database.sql` | Creates `startupdb` database + `startupapp` user |
| `02_enable_extensions.sql` | Enables `vector` (pgvector) and `uuid-ossp` |
| `03_create_tables.sql` | Creates all 6 tables + HNSW vector indexes |
| `04_seed_data.sql` | Inserts sample startups, investors, deals, events |
| `05_drop_all.sql` | Drops everything (use for full reset) |

---

## Tables Created

```
users        — authentication and roles
startups     — startup profiles + VECTOR(768) embedding + JSONB ai_evaluation
investors    — investor profiles + VECTOR(768) embedding
deals        — deal pipeline (FK → startups, investors)
events       — ecosystem events
documents    — uploaded pitch decks + JSONB ai_analysis
```

## Vector Indexes

Both `startups.embedding` and `investors.embedding` use **HNSW** index:
```sql
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64)
```
This enables fast approximate nearest-neighbor search for investor matching.
