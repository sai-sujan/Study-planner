# Study Planner

A personal daily planning, study tracking, and DSA practice web application with AI-powered features.

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **AI Backend** (for blog generation, DSA problem generation, explanations):
  - **Claude Code CLI** — Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (requires Anthropic API key)
  - **Fallback — Ollama (free, local):** If Claude CLI is unavailable or fails, the app automatically falls back to Ollama. Install [Ollama](https://ollama.com), then:
    ```bash
    ollama pull qwen3.5:4b
    ```

> **Note:** The app works fully without any AI backend — planning, scheduling, study tracking, DSA coding, and all core features work offline. AI is only needed for blog generation, problem generation, and chat explanations.

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/sai-sujan/Study-planner.git
cd Study-planner

# 2. Install Python dependencies
pip install flask flask-cors

# 3. Install Node dependencies
npm install
```

## Running the App

You need **two terminals** — one for the backend, one for the frontend:

```bash
# Terminal 1 — Backend API
python app.py
# Starts Flask server at http://localhost:5050

# Terminal 2 — Frontend
npm run dev
# Starts Vite dev server at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## AI Backend Setup

The app tries **Claude CLI first**. If Claude is unavailable, rate-limited, or errors out, it **automatically falls back to Ollama qwen3.5:4b**. You only need one installed.

### Claude Code CLI (Primary)

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Set up your Anthropic API key
3. The app detects the `claude` CLI automatically

### Ollama (Free Fallback)

If you don't have Claude CLI or it fails (rate limits, subscription issues), install Ollama as a free local alternative:

1. Install Ollama from https://ollama.com
2. Pull the model:
   ```bash
   ollama pull qwen3.5:4b
   ```
3. Make sure Ollama is running (`ollama serve` or the desktop app)
4. The app falls back to Ollama automatically when Claude is unavailable

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| Backend | Python Flask |
| Database | SQLite (auto-created, no setup needed) |
| Code Editor | Monaco Editor (VS Code engine) |
| Charts | Chart.js |
| Styling | Custom neumorphic CSS with dark mode |
| AI | Ollama (qwen3.5:4b) or Claude CLI |

## Features

- **Day Planner** — Hourly task scheduling with categories
- **Weekly View** — Google Calendar-style week overview
- **Study Tracker** — Log study sessions by track and topic
- **DSA Sheet** — Striver's A2Z DSA roadmap with built-in Python code editor, test runner, and AI problem generator
- **Prep Plan** — Multi-day preparation task tracker
- **Daily Briefing** — Morning dashboard with today's schedule, goals, and stats
- **Blog Generator** — AI-generated study blogs for Gen AI, Python, and custom topics
- **Highlight & Explain** — Select text in blogs to highlight and get AI explanations with chat
- **Notes** — Daily notes and key learnings
- **Statistics** — Charts and progress visualization
- **History** — Calendar view of all tracked days with completion percentages
- **Routines** — Recurring daily routine blocks
- **Focus Mode** — Full-screen view of current/next task (ESC to exit)
- **Dark Mode** — Toggle between light and dark themes
- **Random Practice** — AI-generated interview-style DSA challenges

## Project Structure

```
app.py                  # Flask API backend (all endpoints)
planner.db              # SQLite database (auto-created at first run)
src/
  main.jsx              # React entry point + route definitions
  App.jsx               # Layout shell: navbar, dark mode, focus mode
  index.css             # Neumorphic CSS theme (light + dark)
  pages/
    Briefing.jsx        # Daily briefing dashboard
    TodayBriefing.jsx   # Today's pinned view
    Planner.jsx         # Hourly day planner grid
    WeekView.jsx        # Weekly calendar overview
    Routine.jsx         # Recurring routines CRUD
    Study.jsx           # Study session logging
    PrepPlan.jsx        # Multi-day prep plan tracker
    History.jsx         # Calendar history of past days
    Notes.jsx           # Daily notes + key learnings
    Stats.jsx           # Charts and statistics
    DSASheet.jsx        # Striver A2Z DSA roadmap
    DSAProblem.jsx      # DSA problem viewer + code editor
    DSAPractice.jsx     # Random DSA practice
    GenAI.jsx           # Gen AI study page
    GenAIBlog.jsx       # Gen AI blog generator
    TopicBlog.jsx       # Custom topic blog generator
    PythonBlog.jsx      # Python blog generator
  components/
    BlogHighlighter.jsx # Shared highlight + explain component for blogs
  data/
    dsaData.js          # Striver A2Z DSA sheet data (problems, descriptions, test cases)
    prepData.js         # Prep plan seed data
  utils/
    dateUtils.js        # Date formatting utilities
```

## License

MIT
