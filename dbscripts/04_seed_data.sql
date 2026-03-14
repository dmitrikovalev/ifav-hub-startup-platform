-- =============================================================
-- 04_seed_data.sql
-- Sample data for development and testing
-- Usage: psql -U postgres -d startupdb -f 04_seed_data.sql
-- =============================================================

-- ─── Users ────────────────────────────────────────────────────
-- Passwords are NOT hashed here — use the /api/auth/register endpoint
-- to create real users. These are for reference only.
-- Hashed value below = bcrypt("password123")
INSERT INTO users (email, hashed_password, full_name, role) VALUES
    ('founder@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwW.p7KvbQiFe', 'Alex Johnson',  'founder'),
    ('investor@demo.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwW.p7KvbQiFe', 'Sarah Chen',    'investor'),
    ('admin@demo.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwW.p7KvbQiFe', 'Mike Williams', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ─── Startups ─────────────────────────────────────────────────
INSERT INTO startups (name, description, industry, stage, funding_goal, current_funding, team_size, location, website) VALUES
    ('TechFlow AI',
     'AI-powered workflow automation platform for SMEs. Reduces manual processes by 80% using intelligent document processing and task routing.',
     'saas', 'seed', 500000, 120000, 5, 'San Francisco, CA', 'https://techflow.ai'),

    ('HealthBridge',
     'Telemedicine platform connecting rural patients with specialists. Uses AI triage to reduce unnecessary ER visits by 40%.',
     'healthtech', 'series_a', 2000000, 800000, 12, 'Austin, TX', 'https://healthbridge.io'),

    ('EduPath',
     'Personalized learning platform using adaptive AI to create custom curriculum paths for K-12 students.',
     'edtech', 'mvp', 300000, 0, 3, 'New York, NY', 'https://edupathapp.com'),

    ('FinLedger',
     'Blockchain-based accounting solution for freelancers and small businesses. Automates invoicing and tax compliance.',
     'fintech', 'seed', 750000, 250000, 6, 'Miami, FL', 'https://finledger.co'),

    ('GreenGrid',
     'IoT platform for commercial building energy optimization. Reduces energy consumption by 30% through real-time monitoring and AI scheduling.',
     'climate', 'seed', 1000000, 400000, 8, 'Seattle, WA', 'https://greengrid.energy'),

    ('MarketMind',
     'AI-driven competitor intelligence tool. Tracks pricing, features, and reviews across 50+ data sources in real time.',
     'saas', 'idea', 200000, 0, 2, 'Chicago, IL', NULL),

    ('MediScan',
     'Computer vision diagnostics tool for dermatology clinics. Detects skin conditions with 94% accuracy using custom trained models.',
     'healthtech', 'mvp', 600000, 50000, 4, 'Boston, MA', 'https://mediscan.health'),

    ('LogiRoute',
     'Last-mile delivery optimization SaaS for e-commerce. AI route planning cuts delivery costs by 25%.',
     'marketplace', 'series_a', 3000000, 1500000, 18, 'Los Angeles, CA', 'https://logiroute.com'),

    ('CodeMentor Pro',
     'AI coding assistant and mentor platform for junior developers. Provides real-time code review and personalized learning paths.',
     'edtech', 'seed', 400000, 100000, 4, 'Remote', 'https://codementor.pro'),

    ('AgriSense',
     'Precision agriculture platform using drone imagery and soil sensors. Helps farmers increase yield by 20% and reduce water usage.',
     'climate', 'mvp', 800000, 200000, 7, 'Des Moines, IA', 'https://agrisense.farm')
ON CONFLICT DO NOTHING;

-- ─── Investors ────────────────────────────────────────────────
INSERT INTO investors (name, firm, bio, investment_focus, industries, stages, min_investment, max_investment, portfolio_count, location, linkedin_url) VALUES
    ('David Park',
     'Sequoia Capital',
     'Partner at Sequoia with 15 years in enterprise SaaS and AI investments.',
     'Enterprise SaaS, AI/ML tools, developer infrastructure. Looking for strong technical founders with scalable B2B products.',
     ARRAY['saas','deeptech'], ARRAY['seed','series_a'], 500000, 5000000, 24,
     'Menlo Park, CA', 'https://linkedin.com/in/davidpark'),

    ('Jennifer Walsh',
     'Andreessen Horowitz (a16z)',
     'General Partner focused on consumer and health technology.',
     'Digital health, telemedicine, health data platforms, patient experience.',
     ARRAY['healthtech'], ARRAY['series_a','series_b'], 2000000, 20000000, 18,
     'San Francisco, CA', 'https://linkedin.com/in/jenniferwalsh'),

    ('Marcus Thompson',
     'GreenFuture Ventures',
     'Impact investor with deep expertise in climate tech and clean energy.',
     'Climate technology, renewable energy, sustainable agriculture, circular economy.',
     ARRAY['climate'], ARRAY['seed','series_a'], 300000, 3000000, 12,
     'New York, NY', 'https://linkedin.com/in/marcusthompson'),

    ('Li Wei',
     'Tiger Global Management',
     'Focuses on late-stage consumer internet and fintech.',
     'Fintech infrastructure, embedded finance, B2B payments, lending platforms.',
     ARRAY['fintech','marketplace'], ARRAY['series_a','series_b'], 5000000, 50000000, 31,
     'New York, NY', 'https://linkedin.com/in/liwei'),

    ('Priya Sharma',
     'Learn Capital',
     'Education-focused investor passionate about democratizing learning.',
     'EdTech platforms, workforce development, adult learning, K-12 technology.',
     ARRAY['edtech'], ARRAY['seed','series_a'], 250000, 2500000, 9,
     'San Francisco, CA', 'https://linkedin.com/in/priyasharma'),

    ('Carlos Mendez',
     'Homebrew',
     'Seed-stage generalist investor. Former founder of two SaaS exits.',
     'Early-stage B2B SaaS, productivity tools, small business software.',
     ARRAY['saas','fintech'], ARRAY['seed'], 100000, 1000000, 42,
     'San Francisco, CA', 'https://linkedin.com/in/carlosmendez'),

    ('Anna Kowalski',
     'Index Ventures',
     'Focuses on marketplace and consumer internet businesses in Europe and US.',
     'Marketplace businesses, logistics tech, e-commerce infrastructure.',
     ARRAY['marketplace','saas'], ARRAY['series_a','series_b'], 3000000, 25000000, 16,
     'London, UK', 'https://linkedin.com/in/annakowalski'),

    ('Kevin O''Brien',
     'FirstMark Capital',
     'Invests in data-driven startups and AI-native businesses.',
     'AI-native products, data infrastructure, developer tools, autonomous systems.',
     ARRAY['deeptech','saas'], ARRAY['seed','series_a'], 500000, 5000000, 27,
     'New York, NY', 'https://linkedin.com/in/kevinobrien')
ON CONFLICT DO NOTHING;

-- ─── Deals ────────────────────────────────────────────────────
INSERT INTO deals (startup_id, investor_id, title, amount, stage, probability, expected_close, notes)
SELECT
    s.id, i.id,
    s.name || ' — ' || i.firm || ' Deal',
    500000, 'proposal', 65,
    CURRENT_DATE + INTERVAL '30 days',
    'Initial due diligence complete. Term sheet under review.'
FROM startups s, investors i
WHERE s.name = 'TechFlow AI' AND i.name = 'David Park'
ON CONFLICT DO NOTHING;

INSERT INTO deals (startup_id, investor_id, title, amount, stage, probability, expected_close, notes)
SELECT
    s.id, i.id,
    s.name || ' — ' || i.firm || ' Deal',
    2000000, 'negotiation', 80,
    CURRENT_DATE + INTERVAL '14 days',
    'LOI signed. Final terms negotiation in progress.'
FROM startups s, investors i
WHERE s.name = 'HealthBridge' AND i.name = 'Jennifer Walsh'
ON CONFLICT DO NOTHING;

INSERT INTO deals (startup_id, investor_id, title, amount, stage, probability, expected_close, notes)
SELECT
    s.id, i.id,
    s.name || ' — ' || i.firm || ' Deal',
    750000, 'qualified', 40,
    CURRENT_DATE + INTERVAL '60 days',
    'Strong product-market fit. Waiting for co-investor.'
FROM startups s, investors i
WHERE s.name = 'FinLedger' AND i.name = 'Li Wei'
ON CONFLICT DO NOTHING;

INSERT INTO deals (startup_id, investor_id, title, amount, stage, probability, expected_close, notes)
SELECT
    s.id, i.id,
    s.name || ' — ' || i.firm || ' Deal',
    1000000, 'closed_won', 100,
    CURRENT_DATE - INTERVAL '7 days',
    'Deal closed successfully. Funds wired.'
FROM startups s, investors i
WHERE s.name = 'GreenGrid' AND i.name = 'Marcus Thompson'
ON CONFLICT DO NOTHING;

INSERT INTO deals (startup_id, investor_id, title, amount, stage, probability, expected_close, notes)
SELECT
    s.id, i.id,
    s.name || ' — ' || i.firm || ' Deal',
    300000, 'lead', 20,
    CURRENT_DATE + INTERVAL '90 days',
    'First meeting scheduled for next week.'
FROM startups s, investors i
WHERE s.name = 'EduPath' AND i.name = 'Priya Sharma'
ON CONFLICT DO NOTHING;

-- ─── Events ───────────────────────────────────────────────────
INSERT INTO events (title, description, event_type, location, is_online, meeting_url, start_time, end_time, max_attendees) VALUES
    ('Startup Demo Day Spring 2025',
     'Quarterly demo day featuring 10 early-stage startups pitching to 50+ investors.',
     'demo_day',
     'WeWork SoMa, San Francisco, CA',
     FALSE, NULL,
     NOW() + INTERVAL '2 days',
     NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
     150),

    ('AI in FinTech Webinar',
     'Panel discussion on how AI is reshaping lending, payments and compliance in 2025.',
     'webinar',
     NULL, TRUE,
     'https://zoom.us/j/example',
     NOW() + INTERVAL '5 days',
     NOW() + INTERVAL '5 days' + INTERVAL '90 minutes',
     500),

    ('Founder Networking Meetup — NYC',
     'Monthly casual meetup for founders and investors in New York.',
     'meetup',
     'The Wing, 510 W 22nd St, New York',
     FALSE, NULL,
     NOW() + INTERVAL '9 days',
     NOW() + INTERVAL '9 days' + INTERVAL '3 hours',
     80),

    ('TechCrunch Disrupt 2025',
     'The premier startup conference. Booth and pitch competition available for startups.',
     'conference',
     'Moscone Center, San Francisco, CA',
     FALSE, NULL,
     NOW() + INTERVAL '21 days',
     NOW() + INTERVAL '23 days',
     5000),

    ('ClimaTech Pitch Competition',
     'Climate tech startups pitch for $250K prize pool. Online event.',
     'webinar',
     NULL, TRUE,
     'https://meet.google.com/example',
     NOW() + INTERVAL '14 days',
     NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
     300)
ON CONFLICT DO NOTHING;

\echo ''
\echo '>>> Seed data inserted:'
\echo '    3 users  (password: password123)'
\echo '    10 startups'
\echo '    8 investors'
\echo '    5 deals'
\echo '    5 events'
\echo ''
\echo 'NOTE: Embeddings are NOT included in seed data.'
\echo 'Generate them via: POST /api/ai/embed-startup/{id}'
\echo '               and POST /api/ai/embed-investor/{id}'
