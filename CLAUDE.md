# Day Planner

A personal daily planning and study tracking web application.

## Architecture

- **Backend**: Python Flask API server (`app.py`) running on port 5050
- **Frontend**: React 19 SPA with Vite, running on port 5173
- **Database**: SQLite (`planner.db`) with WAL mode
- **Styling**: Custom neumorphic/soft UI CSS (`src/index.css`) with dark mode support
- **Routing**: React Router DOM v7 with nested routes under `<App />` layout

## How to Run

```bash
# Backend
python app.py          # Starts Flask API at http://localhost:5050

# Frontend
npm run dev            # Starts Vite dev server at http://localhost:5173
```

Vite proxies `/api` requests to the Flask backend (configured in `vite.config.js`).

## Project Structure

```
app.py                  # Flask API backend (all endpoints)
planner.db              # SQLite database (auto-created)
src/
  main.jsx              # React entry point + route definitions
  App.jsx               # Layout shell: navbar, dark mode, focus mode, quick-add modal
  index.css             # Full neumorphic CSS theme (light + dark)
  pages/
    Briefing.jsx        # Landing page — daily briefing
    TodayBriefing.jsx   # Today's pinned view
    Planner.jsx         # Hourly day planner grid
    WeekView.jsx        # Weekly overview
    Routine.jsx         # Recurring routines CRUD
    Study.jsx           # Study session logging
    PrepPlan.jsx        # Multi-day prep plan tracker
    History.jsx         # Calendar/history of past days
    Notes.jsx           # Daily notes + key learnings
    Stats.jsx           # Charts and stats (Chart.js)
  data/
    prepData.js         # Static prep plan seed data
templates/              # Legacy Jinja2 templates (not used by React frontend)
static/                 # Legacy static assets (not used by React frontend)
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `daily_plan` | Hourly task blocks per day (unique on date+hour) |
| `study_log` | Study sessions with track, topic, hours |
| `day_notes` | Daily notes and key learnings |
| `task_done` | Prep task completion tracking |
| `prep_plan` | Multi-day preparation plan tasks |
| `moods` | Daily energy level (1-5) + mood note |
| `goals` | Weekly track-based hour targets |
| `routines` | Recurring routine blocks (CRUD) |

## Key API Endpoints

- `GET /api/briefing` — Daily briefing data
- `GET /api/planner/<day>` — Planner blocks, routines, prep tasks for a day
- `POST /api/save_block` — Upsert hourly task block
- `POST /api/log_study` — Log a study session
- `POST /api/save_notes` — Upsert daily notes
- `GET /api/stats` — Aggregated statistics
- `GET /api/history` — All tracked dates with completion %
- CRUD: `/api/routines`, `/api/routine`, `/api/routine/<id>`

## Key Features Built

- Neumorphic UI design with light/dark mode toggle
- Focus mode (full-screen current/next task view, press ESC to exit)
- Keyboard quick-add (press `N` to open quick task modal)
- 10 navigation tabs: Briefing, Today, Planner, Week, Routine, Study, Prep, History, Notes, Stats
- Chart.js integration for study/stats visualization
- Day export as plain text file
- Auto-refreshing focus mode (every 60s)

## Dev Notes

- No git repo initialized yet
- `templates/` and `static/` are from an earlier Jinja2-based version; the app now uses React
- The `dist/` folder contains a Vite production build
- Database is local SQLite — no migrations system, schema is in `init_db()` in `app.py`
