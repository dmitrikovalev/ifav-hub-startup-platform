# IFAVHub — User Guide

## Getting Started

### Registration

1. Open the app at **http://localhost:5173**.
2. On the login screen, click the **Register** tab.
3. Fill in:
   - **Full Name** — your display name.
   - **Role** — choose **Founder** or **Investor** (determines your perspective in the platform).
   - **Email** — must be a valid email format.
   - **Password** — minimum 6 characters.
4. Click **Create Account**. You will be redirected to the Dashboard.

### Login

Switch to the **Login** tab, enter your email and password, then click **Sign In**.

> Your session is stored in a JWT token. If you get logged out, simply sign in again.

---

## Layout Overview

The interface has three areas:

| Area | Position | What it shows |
|---|---|---|
| **Sidebar** | Left | Navigation menu with all sections |
| **Content Area** | Center | The active page (changes based on menu selection) |
| **Right Panel** | Right | Upcoming events + personal task list |

The **Right Panel** is always visible. It shows up to 5 upcoming events from the database and a local task checklist where you can add, complete, and delete tasks.

---

## Dashboard

The landing page after login. Displays at a glance:

- **Stat cards** — Active Startups, Investors, Deals in Pipeline (with total value).
- **Deal Pipeline table** — the 6 most recent deals with startup, investor, stage, amount, and probability. Click **View all** to go to Deal Flow.
- **Stage Summary** — count of deals per stage.

No actions are needed here — it's a read-only overview that updates automatically.

---

## Startups

Manage startup profiles. This is the core section for founders.

### Viewing & Searching

- Use the **search bar** to filter startups by name.
- Use the **stage dropdown** to filter by development stage (idea, mvp, seed, series_a, series_b).

### Adding a Startup

1. Click **Add Startup** (top right).
2. Fill in the form:
   - **Name** (required), **Description**, **Industry**, **Stage**.
   - **Funding Goal** and **Team Size** (numeric).
   - **Location**, **Website**.
3. Click **Create**. The startup appears in the list.

> After creation, the system generates a vector embedding in the background for AI matching.

### Editing & Deleting

- Click the **pencil icon** on any row to edit.
- Click the **trash icon** to delete (no confirmation — be careful).

### AI Evaluation

Click the **bot icon** (purple) on a startup row. The system sends the startup data to Gemini AI and returns:

- **Overall Score** (0–100) displayed as a circular ring.
- **Strengths**, **Weaknesses**, **Suggestions**, **Risks** — each as a bullet list.
- **Market Size** and **Team Assessment** — text summaries.
- **Business Model** — one-line description.

This score is saved and visible in the AI Score column.

### Investor Matching

Click the **people icon** (blue) on a startup row. The system:

1. Generates an embedding of the startup description.
2. Searches the investor database using vector similarity (pgvector).
3. Asks Gemini to explain why each investor is a match.

Results show each investor with a **match percentage** and an **explanation**.

> For matching to work, both the startup and investors need embeddings. Embeddings are generated automatically when profiles are created.

---

## Investors

Manage investor profiles. Similar to Startups but with investor-specific fields.

### Adding an Investor

1. Click **Add Investor**.
2. Fill in: **Name**, **Firm**, **Location**, **LinkedIn URL**.
3. **Investment Focus** — describe the investor's thesis (used for AI matching).
4. **Bio** — background information.
5. **Industries** — click tags to select: fintech, healthtech, edtech, etc.
6. **Preferred Stages** — click tags: pre_seed, seed, series_a, etc.
7. **Min/Max Investment** — dollar amounts.
8. Click **Create**.

### Searching

Type in the search bar to filter by investor name or firm.

### Editing & Deleting

Same pencil/trash icons as Startups. LinkedIn profiles open in a new tab via the LinkedIn icon.

---

## Deal Flow

A **Kanban board** for managing your deal pipeline. Deals move through 6 stages:

**Lead** → **Qualified** → **Proposal** → **Negotiation** → **Closed Won** / **Closed Lost**

### Creating a Deal

1. Click **Add Deal**.
2. Fill in: **Title**, **Startup** (dropdown), **Investor** (optional dropdown).
3. **Amount**, **Stage**, **Probability** (0–100% slider), **Notes**.
4. Click **Create**. The deal appears in the corresponding stage column.

### Moving Deals Between Stages

Each deal card has arrow buttons at the bottom:
- **← Previous Stage** — moves the deal one stage back.
- **→ Next Stage** — moves the deal one stage forward.

### Editing & Deleting

Pencil icon to edit, trash icon to delete — directly on each card.

---

## Fundraising

A read-only analytics page with:

- **Stat cards** — Total Raised (closed won deals), Pipeline Value, Active Deals count.
- **Bar chart** — deals distribution by stage.
- **Active Pipeline list** — all non-closed deals with stage badges, amounts, and probability bars.

Data comes from deals you've created in Deal Flow.

---

## Documents

Upload pitch deck PDFs for AI-powered analysis.

### Uploading a Document

1. **Select startup** from the dropdown (required).
2. **Choose document type**: Pitch Deck, Financial Model, or Term Sheet.
3. Click **Choose PDF** and select a file.
4. Click **Analyze**. The file uploads and analysis begins in the background.

### Analysis Process

- Status shows **pending** → **analyzing** (with spinner) → **done** or **failed**.
- The page auto-polls every 3 seconds until analysis completes.
- Once done, an **AI Score ring** appears in the table.

### Viewing Results

Click **View** on a completed document. The analysis modal shows the same detailed breakdown as startup AI evaluation: score, strengths, weaknesses, suggestions, risks, market size, team assessment.

### Deleting

Click the trash icon to remove a document and its analysis.

---

## Events

Manage ecosystem events — meetups, demo days, webinars, conferences, workshops.

### Creating an Event

1. Click **Add Event**.
2. Fill in: **Title**, **Description**, **Type** (dropdown), **Max Attendees**.
3. Check **Online event** for virtual events (shows a Meeting URL field) or leave unchecked for physical events (shows a Location field).
4. Set **Start Time** and **End Time** (datetime pickers).
5. Click **Create**.

### Event Cards

Each event shows:
- **Date** (day + month) on the left.
- **Title**, **description** (truncated), **type badge**.
- **Time**, **location or Online tag** with a Join link for virtual events.

Events also appear in the **Right Panel** sidebar (up to 5 upcoming).

---

## AI Assistant

A chat interface powered by Gemini 2.5 Flash Lite, acting as a startup advisor.

### Quick Actions

Click any of the pre-built prompts at the top to start a conversation:
- "What makes a great pitch deck?"
- "How do I find the right investors for my startup?"
- "Explain the difference between seed and Series A funding."
- "What are common term sheet red flags?"

### Custom Questions

Type any question in the text area and press **Enter** or click **Send**. The AI remembers the last 10 message exchanges within your session for context-aware follow-ups.

### Tips

- Ask about fundraising strategy, pitch improvement, investor types, term sheets, or ecosystem trends.
- The conversation resets when you refresh the page (memory is session-based).

---

## Messages

A demo messaging interface with sample conversations. You can:
- Switch between conversations in the left panel.
- Type and send messages (stored locally, not persisted to server).

> This is a UI mockup for the networking feature. Messages are not saved between sessions.

---

## Accelerator

A curated, read-only catalog of top accelerator programs (Y Combinator, Techstars, 500 Global, etc.). Each row shows:

- **Program name**, **Batch**, **Deadline**, **Equity**, **Funding**, **Stage**, **Status** (open/closed).
- Click the **external link icon** to visit the program's website.

> This is static reference data, not editable from the UI.

---

## Right Panel (Sidebar)

Always visible on the right side of every page.

### Upcoming Events

Shows the next 5 events sorted by date. Each card displays the event title, type, date, and whether it's online or at a physical location.

### Tasks

A personal checklist:
- **Add a task** — type in the input field and press Enter or click +.
- **Complete a task** — click the checkbox. Completed tasks show strikethrough.
- **Delete a task** — hover over a task and click the trash icon.
- The counter shows how many tasks remain.

> Tasks are stored in browser memory and reset on page refresh.

---

## Tips & Troubleshooting

| Issue | Solution |
|---|---|
| "Something went wrong" on login | Check that the backend is running on port 8000 |
| AI features return errors | Verify `GOOGLE_API_KEY` is set in backend `.env` |
| Investor matching returns no results | Ensure investors have been created and their embeddings generated |
| Document analysis stuck on "analyzing" | Check backend logs; the Gemini API may be rate-limited |
| Session expired | Sign in again — JWT tokens expire after 60 minutes |
| Data not appearing | Refresh the page or check that Docker PostgreSQL is running |
