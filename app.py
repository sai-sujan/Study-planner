"""
Day Planner — Flask API Backend
Run with: python app.py
API at: http://localhost:5050/api/
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import sqlite3, os
from datetime import datetime, date, timedelta

app = Flask(__name__)
CORS(app)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "planner.db")

# ── AI helper — Claude CLI → Groq API → Ollama fallback chain ────────────────

GROQ_MODEL = "llama-3.3-70b-versatile"

def _try_groq(prompt, timeout=120, expect_json=False):
    """Try Groq API. Returns (text, source) or (None, reason)."""
    import json as json_mod
    try:
        from urllib.request import Request, urlopen
        from urllib.error import URLError, HTTPError
    except ImportError:
        return None, "no-urllib"

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return None, "no-groq-key"

    payload = json_mod.dumps({
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 8192,
    }).encode()

    req = Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=timeout) as resp:
            body = json_mod.loads(resp.read().decode())
            text = body["choices"][0]["message"]["content"].strip()
            if text:
                return text, f"groq-{GROQ_MODEL}"
    except HTTPError as e:
        return None, f"groq-http-{e.code}"
    except (URLError, TimeoutError):
        return None, "groq-timeout"
    except Exception as e:
        return None, f"groq-error: {e}"
    return None, "groq-empty"


def run_ai_prompt(prompt, timeout=120, expect_json=False, model=None):
    """Try Claude CLI first → Groq API → Ollama qwen3.5:4b.
    If expect_json=True, validates JSON and retries once on parse failure (helpful for smaller models).
    model: optional Claude model to use (e.g. 'claude-haiku-4-5-20251001'). If None, uses CLI default.
    """
    import subprocess, shutil, json as json_mod, re

    clean_env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

    def _clean_thinking(raw):
        """Strip <think> blocks and markdown fences from model output."""
        text = re.sub(r"<think>[\s\S]*?</think>", "", raw).strip()
        return text

    def _extract_json(text):
        """Try to extract valid JSON from text that may have markdown fences or extra text."""
        t = text.strip()
        # Strip markdown code fences
        if t.startswith("```"):
            t = "\n".join(t.split("\n")[1:])
            if t.endswith("```"):
                t = t[:-3].strip()
        # Try direct parse
        try:
            json_mod.loads(t)
            return t
        except json_mod.JSONDecodeError:
            pass
        # Try to find JSON object in the text
        match = re.search(r'\{[\s\S]*\}', t)
        if match:
            try:
                json_mod.loads(match.group())
                return match.group()
            except json_mod.JSONDecodeError:
                pass
        return None

    # --- 1. Try Claude CLI first ---
    if shutil.which("claude"):
        try:
            cmd = ["claude", "-p", prompt]
            if model:
                cmd += ["--model", model]
            result = subprocess.run(
                cmd,
                capture_output=True, text=True, timeout=timeout,
                env=clean_env,
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip(), "claude"
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            pass

    # --- 2. Fallback: Groq API ---
    groq_text, groq_source = _try_groq(prompt, timeout=timeout, expect_json=expect_json)
    if groq_text:
        if expect_json:
            cleaned = _extract_json(_clean_thinking(groq_text))
            if cleaned:
                return cleaned, groq_source
            # Bad JSON from Groq, try once more
            groq_text2, _ = _try_groq(prompt, timeout=timeout, expect_json=True)
            if groq_text2:
                cleaned2 = _extract_json(_clean_thinking(groq_text2))
                if cleaned2:
                    return cleaned2, groq_source
        else:
            return _clean_thinking(groq_text), groq_source

    # --- 3. Fallback: Ollama qwen3.5:4b ---
    if shutil.which("ollama"):
        max_attempts = 2 if expect_json else 1
        for attempt in range(max_attempts):
            try:
                result = subprocess.run(
                    ["ollama", "run", "qwen3.5:4b", prompt],
                    capture_output=True, text=True, timeout=timeout + 60,
                    env=clean_env,
                )
                if result.returncode == 0 and result.stdout.strip():
                    text = _clean_thinking(result.stdout)
                    if expect_json:
                        cleaned = _extract_json(text)
                        if cleaned:
                            return cleaned, "ollama-qwen3.5:4b"
                        continue
                    return text, "ollama-qwen3.5:4b"
            except subprocess.TimeoutExpired:
                return None, "timeout"
            except Exception as e:
                return None, f"ollama-error: {e}"
        return None, "ollama-bad-json"

    return None, "no-ai-backend"


def stream_ai_prompt(prompt, model=None):
    """Generator that yields chunks from Claude CLI → Groq → Ollama.
    Yields SSE-formatted lines: 'data: <text>\n\n'
    Final event: 'event: done\ndata: end\n\n'
    """
    import subprocess, shutil, re, json as json_mod

    clean_env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

    def _send_chunks(text):
        """Send text in small chunks to simulate streaming."""
        for i in range(0, len(text), 20):
            yield f"data: {json_mod.dumps(text[i:i+20])}\n\n"
        yield "event: done\ndata: end\n\n"

    # --- 1. Try Claude CLI ---
    if shutil.which("claude"):
        try:
            cmd = ["claude", "-p", prompt]
            if model:
                cmd += ["--model", model]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=clean_env,
                bufsize=1,
            )
            buffer = ""
            while True:
                char = proc.stdout.read(1)
                if not char:
                    break
                buffer += char
                if len(buffer) >= 3 or char in ('\n', '.', ',', '!', '?', '|', '`'):
                    yield f"data: {json_mod.dumps(buffer)}\n\n"
                    buffer = ""
            if buffer:
                yield f"data: {json_mod.dumps(buffer)}\n\n"
            proc.wait()
            if proc.returncode == 0:
                yield "event: done\ndata: end\n\n"
                return
        except Exception:
            pass

    # --- 2. Fallback: Groq API ---
    groq_text, groq_source = _try_groq(prompt, timeout=120)
    if groq_text:
        text = re.sub(r"<think>[\s\S]*?</think>", "", groq_text).strip()
        yield from _send_chunks(text)
        return

    # --- 3. Fallback: Ollama ---
    if shutil.which("ollama"):
        try:
            result = subprocess.run(
                ["ollama", "run", "qwen3.5:4b", prompt],
                capture_output=True, text=True, timeout=120,
                env=clean_env,
            )
            if result.returncode == 0 and result.stdout.strip():
                text = re.sub(r"<think>[\s\S]*?</think>", "", result.stdout).strip()
                yield from _send_chunks(text)
                return
        except Exception:
            pass

    yield f"data: {json_mod.dumps('[Error] No AI backend available. Install Claude CLI, set GROQ_API_KEY, or install Ollama.')}\n\n"
    yield "event: done\ndata: end\n\n"


# ── helpers ──────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def today_str():
    return date.today().isoformat()

def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# ── database init ────────────────────────────────────────────────────────────

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS daily_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            hour INTEGER NOT NULL CHECK(hour BETWEEN 0 AND 23),
            task_title TEXT DEFAULT '',
            category TEXT DEFAULT 'general',
            notes TEXT DEFAULT '',
            is_done INTEGER DEFAULT 0,
            UNIQUE(date, hour)
        );
        CREATE TABLE IF NOT EXISTS study_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            track TEXT NOT NULL,
            topic TEXT DEFAULT '',
            hours REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS day_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            full_notes TEXT DEFAULT '',
            key_learnings TEXT DEFAULT '',
            last_saved TEXT
        );
        CREATE TABLE IF NOT EXISTS task_done (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            task_id INTEGER,
            task_text TEXT,
            track TEXT,
            is_done INTEGER DEFAULT 0,
            completed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS prep_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_num INTEGER NOT NULL,
            day_label TEXT NOT NULL,
            track TEXT NOT NULL,
            task_text TEXT NOT NULL,
            sub_text TEXT DEFAULT '',
            time_est TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS moods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
            mood_note TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week INTEGER NOT NULL,
            track TEXT NOT NULL,
            target_hours REAL DEFAULT 0,
            UNIQUE(week, track)
        );
        CREATE TABLE IF NOT EXISTS routines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL,
            start_time TEXT NOT NULL,
            duration_mins INTEGER NOT NULL,
            color TEXT DEFAULT 'gray',
            notes TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS topic_blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_name TEXT NOT NULL,
            section_id TEXT NOT NULL,
            section_title TEXT NOT NULL,
            blog_content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS interview_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            category TEXT NOT NULL,
            transcript TEXT NOT NULL,
            confidence_json TEXT DEFAULT '{}',
            feedback TEXT DEFAULT '',
            score INTEGER DEFAULT 0,
            duration_sec INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        );
    """)
    if cur.execute("SELECT COUNT(*) FROM routines").fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO routines (label, start_time, duration_mins, color, notes) VALUES (?,?,?,?,?)",
            [
                ("Wake up",       "06:00", 30, "coral",  ""),
                ("Morning prep",  "06:30", 30, "coral",  ""),
                ("Breakfast",     "08:00", 45, "amber",  ""),
                ("Lunch break",   "13:00", 60, "amber",  ""),
                ("Evening break", "17:30", 30, "amber",  ""),
                ("Dinner",        "20:00", 45, "amber",  ""),
                ("Wind down",     "22:30", 30, "coral",  ""),
            ],
        )
    conn.commit()
    conn.close()

# ── API: Briefing data ──────────────────────────────────────────────────────

@app.route("/api/briefing")
def api_briefing():
    conn = get_db()
    td = today_str()
    first = conn.execute("SELECT MIN(date) FROM daily_plan").fetchone()[0]
    day_num = (date.today() - date.fromisoformat(first)).days + 1 if first else 1

    prep_tasks = [dict(r) for r in conn.execute(
        "SELECT * FROM prep_plan WHERE day_num=?", (day_num,)
    ).fetchall()]

    yesterday = (date.today() - timedelta(days=1)).isoformat()
    yd_total = conn.execute(
        "SELECT COUNT(*) FROM daily_plan WHERE date=? AND task_title != ''", (yesterday,)
    ).fetchone()[0]
    yd_done = conn.execute(
        "SELECT COUNT(*) FROM daily_plan WHERE date=? AND is_done=1", (yesterday,)
    ).fetchone()[0]

    mood = conn.execute("SELECT * FROM moods WHERE date=?", (td,)).fetchone()
    conn.close()
    return jsonify({
        "today": td, "day_num": day_num,
        "prep_tasks": prep_tasks,
        "yd_total": yd_total, "yd_done": yd_done,
        "mood": dict(mood) if mood else None,
    })

# ── API: Planner data ───────────────────────────────────────────────────────

@app.route("/api/planner/<day>")
def api_planner(day):
    conn = get_db()
    blocks = {}
    for row in conn.execute("SELECT * FROM daily_plan WHERE date=?", (day,)).fetchall():
        blocks[str(row["hour"])] = dict(row)

    routines = {}
    for r in conn.execute("SELECT * FROM routines ORDER BY start_time").fetchall():
        h = int(r["start_time"].split(":")[0])
        h_str = str(h)
        if h_str not in routines:
            routines[h_str] = []
        routines[h_str].append(dict(r))

    first = conn.execute("SELECT MIN(date) FROM daily_plan").fetchone()[0]
    day_num = (date.today() - date.fromisoformat(first)).days + 1 if first else 1
    prep_tasks = [dict(r) for r in conn.execute(
        "SELECT * FROM prep_plan WHERE day_num=?", (day_num,)
    ).fetchall()]

    done_ids = [r["task_id"] for r in conn.execute(
        "SELECT task_id FROM task_done WHERE date=? AND is_done=1", (day,)
    ).fetchall()]

    conn.close()
    return jsonify({
        "blocks": blocks, "routines": routines,
        "prep_tasks": prep_tasks, "done_ids": done_ids,
        "current_hour": datetime.now().hour,
    })

# ── API: Save/update ────────────────────────────────────────────────────────

@app.route("/api/save_block", methods=["POST"])
def api_save_block():
    d = request.json
    conn = get_db()
    conn.execute(
        """INSERT INTO daily_plan (date, hour, task_title, category, notes, is_done)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(date, hour) DO UPDATE SET
             task_title=excluded.task_title, category=excluded.category,
             notes=excluded.notes, is_done=excluded.is_done""",
        (d["date"], d["hour"], d.get("task_title",""), d.get("category","general"),
         d.get("notes",""), d.get("is_done",0)),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True})

@app.route("/api/save_task", methods=["POST"])
def api_save_task():
    d = request.json
    conn = get_db()
    conn.execute(
        """INSERT INTO task_done (date, task_id, task_text, track, is_done, completed_at)
           VALUES (?,?,?,?,?,?) ON CONFLICT DO NOTHING""",
        (d["date"], d["task_id"], d.get("task_text",""), d.get("track",""),
         d.get("is_done",0), now_str() if d.get("is_done") else None),
    )
    conn.execute(
        "UPDATE task_done SET is_done=?, completed_at=? WHERE date=? AND task_id=?",
        (d.get("is_done",0), now_str() if d.get("is_done") else None, d["date"], d["task_id"]),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True})

@app.route("/api/log_study", methods=["POST"])
def api_log_study():
    d = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO study_log (date, start_time, end_time, track, topic, hours) VALUES (?,?,?,?,?,?)",
        (d["date"], d["start_time"], d["end_time"], d["track"], d.get("topic",""), d["hours"]),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True})

@app.route("/api/delete_study/<int:sid>", methods=["DELETE"])
def api_delete_study(sid):
    conn = get_db()
    conn.execute("DELETE FROM study_log WHERE id=?", (sid,))
    conn.commit(); conn.close()
    return jsonify({"ok": True})

@app.route("/api/save_notes", methods=["POST"])
def api_save_notes():
    d = request.json
    conn = get_db()
    conn.execute(
        """INSERT INTO day_notes (date, full_notes, key_learnings, last_saved)
           VALUES (?,?,?,?) ON CONFLICT(date) DO UPDATE SET
             full_notes=excluded.full_notes, key_learnings=excluded.key_learnings,
             last_saved=excluded.last_saved""",
        (d["date"], d.get("full_notes",""), d.get("key_learnings",""), now_str()),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True, "saved_at": datetime.now().strftime("%H:%M")})

@app.route("/api/save_mood", methods=["POST"])
def api_save_mood():
    d = request.json
    conn = get_db()
    conn.execute(
        """INSERT INTO moods (date, energy_level, mood_note) VALUES (?,?,?)
           ON CONFLICT(date) DO UPDATE SET
             energy_level=excluded.energy_level, mood_note=excluded.mood_note""",
        (d["date"], d["energy_level"], d.get("mood_note","")),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True})

# ── API: Read endpoints ──────────────────────────────────────────────────────

@app.route("/api/day_data/<day>")
def api_day_data(day):
    conn = get_db()
    blocks = [dict(r) for r in conn.execute("SELECT * FROM daily_plan WHERE date=? ORDER BY hour", (day,)).fetchall()]
    sessions = [dict(r) for r in conn.execute("SELECT * FROM study_log WHERE date=? ORDER BY start_time", (day,)).fetchall()]
    note = conn.execute("SELECT * FROM day_notes WHERE date=?", (day,)).fetchone()
    mood = conn.execute("SELECT * FROM moods WHERE date=?", (day,)).fetchone()
    tasks = [dict(r) for r in conn.execute("SELECT * FROM task_done WHERE date=?", (day,)).fetchall()]
    conn.close()
    return jsonify({
        "blocks": blocks, "sessions": sessions,
        "note": dict(note) if note else None,
        "mood": dict(mood) if mood else None,
        "tasks": tasks,
    })

@app.route("/api/study_sessions/<day>")
def api_study_sessions(day):
    conn = get_db()
    sessions = [dict(r) for r in conn.execute(
        "SELECT * FROM study_log WHERE date=? ORDER BY start_time", (day,)
    ).fetchall()]
    conn.close()
    return jsonify(sessions)

@app.route("/api/study_weekly")
def api_study_weekly():
    conn = get_db()
    start = (date.today() - timedelta(days=6)).isoformat()
    rows = conn.execute(
        "SELECT date, track, SUM(hours) as total FROM study_log WHERE date>=? GROUP BY date, track ORDER BY date",
        (start,),
    ).fetchall()
    conn.close()
    result = {}
    for r in rows:
        result.setdefault(r["date"], {})[r["track"]] = r["total"]
    return jsonify(result)

@app.route("/api/stats")
def api_stats():
    conn = get_db()
    total_hours = conn.execute("SELECT COALESCE(SUM(hours),0) FROM study_log").fetchone()[0]
    days_tracked = conn.execute("SELECT COUNT(DISTINCT date) FROM study_log").fetchone()[0]
    avg_daily = round(total_hours / max(days_tracked, 1), 1)

    dates_with_study = [r[0] for r in conn.execute(
        "SELECT DISTINCT date FROM study_log ORDER BY date DESC"
    ).fetchall()]
    streak = 0
    check = date.today()
    for d in dates_with_study:
        if d == check.isoformat():
            streak += 1; check -= timedelta(days=1)
        else:
            break

    track_hours = {}
    for r in conn.execute("SELECT track, SUM(hours) as total FROM study_log GROUP BY track").fetchall():
        track_hours[r["track"]] = round(r["total"], 1)

    start14 = (date.today() - timedelta(days=13)).isoformat()
    daily = {}
    for r in conn.execute(
        "SELECT date, SUM(hours) as total FROM study_log WHERE date>=? GROUP BY date ORDER BY date", (start14,)
    ).fetchall():
        daily[r["date"]] = round(r["total"], 1)

    task_comp = {}
    for r in conn.execute(
        "SELECT date, COUNT(*) as total, SUM(is_done) as done FROM daily_plan WHERE task_title!='' GROUP BY date ORDER BY date"
    ).fetchall():
        task_comp[r["date"]] = int(r["done"] / r["total"] * 100) if r["total"] > 0 else 0

    moods = {}
    for r in conn.execute("SELECT date, energy_level FROM moods ORDER BY date").fetchall():
        moods[r["date"]] = r["energy_level"]

    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
    weekly_track = {}
    for r in conn.execute(
        "SELECT track, SUM(hours) as total FROM study_log WHERE date>=? GROUP BY track", (week_start,)
    ).fetchall():
        weekly_track[r["track"]] = round(r["total"], 1)

    conn.close()
    return jsonify({
        "total_hours": round(total_hours, 1), "days_tracked": days_tracked,
        "avg_daily": avg_daily, "streak": streak,
        "track_hours": track_hours, "daily_hours": daily,
        "task_completion": task_comp, "moods": moods,
        "weekly_track": weekly_track,
    })

@app.route("/api/history")
def api_history():
    conn = get_db()
    dates = set()
    for tbl in ["daily_plan", "study_log", "day_notes", "moods", "task_done"]:
        for r in conn.execute(f"SELECT DISTINCT date FROM {tbl}").fetchall():
            dates.add(r["date"])
    day_data = {}
    for d in sorted(dates):
        plan_total = conn.execute("SELECT COUNT(*) FROM daily_plan WHERE date=? AND task_title!=''", (d,)).fetchone()[0]
        plan_done = conn.execute("SELECT COUNT(*) FROM daily_plan WHERE date=? AND is_done=1", (d,)).fetchone()[0]
        study_hours = conn.execute("SELECT COALESCE(SUM(hours),0) FROM study_log WHERE date=?", (d,)).fetchone()[0]
        has_notes = conn.execute("SELECT COUNT(*) FROM day_notes WHERE date=? AND (full_notes!='' OR key_learnings!='')", (d,)).fetchone()[0]

        # Calculate pct: blend planner completion + study activity
        if plan_total > 0:
            pct = int(plan_done / plan_total * 100)
            # Boost pct if there's also study activity
            if study_hours > 0 and pct < 100:
                pct = min(100, pct + 20)
        elif study_hours > 0:
            # No planner tasks but studied — show green based on hours
            pct = min(100, int(study_hours / 4 * 100))  # 4h = 100%
            pct = max(50, pct)  # at least amber
        elif has_notes:
            pct = 50  # has notes = amber
        else:
            pct = 30  # just mood or minimal activity

        day_data[d] = {
            "pct": pct,
            "total": plan_total,
            "done": plan_done,
            "study_hours": round(study_hours, 1),
        }
    conn.close()
    return jsonify(day_data)

@app.route("/api/notes/<day>")
def api_get_notes(day):
    conn = get_db()
    note = conn.execute("SELECT * FROM day_notes WHERE date=?", (day,)).fetchone()
    conn.close()
    return jsonify(dict(note) if note else {"date": day, "full_notes": "", "key_learnings": "", "last_saved": None})

@app.route("/api/notes_list")
def api_notes_list():
    conn = get_db()
    past = [dict(r) for r in conn.execute(
        "SELECT date, substr(full_notes,1,80) as preview FROM day_notes ORDER BY date DESC"
    ).fetchall()]
    conn.close()
    return jsonify(past)

@app.route("/api/export_day/<day>")
def api_export_day(day):
    conn = get_db()
    lines = [f"Day Summary — {day}", "=" * 40, ""]
    lines.append("HOURLY PLAN"); lines.append("-" * 20)
    for r in conn.execute("SELECT * FROM daily_plan WHERE date=? ORDER BY hour", (day,)).fetchall():
        status = "✓" if r["is_done"] else "○"
        lines.append(f"  {r['hour']:02d}:00  [{status}] {r['task_title']}  ({r['category']})")
    lines.append("")
    lines.append("STUDY SESSIONS"); lines.append("-" * 20)
    for r in conn.execute("SELECT * FROM study_log WHERE date=? ORDER BY start_time", (day,)).fetchall():
        lines.append(f"  {r['start_time']}-{r['end_time']}  {r['track']}: {r['topic']}  ({r['hours']}h)")
    lines.append("")
    note = conn.execute("SELECT * FROM day_notes WHERE date=?", (day,)).fetchone()
    if note:
        lines += ["NOTES", "-" * 20, note["full_notes"], "", "KEY LEARNINGS", note["key_learnings"]]
    conn.close()
    return Response("\n".join(lines), mimetype="text/plain",
                    headers={"Content-Disposition": f"attachment; filename=day_{day}.txt"})

# ── API: Routines CRUD ──────────────────────────────────────────────────────

@app.route("/api/routines")
def api_routines():
    conn = get_db()
    rows = [dict(r) for r in conn.execute("SELECT * FROM routines ORDER BY start_time").fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/routine", methods=["POST"])
def api_add_routine():
    d = request.json
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO routines (label, start_time, duration_mins, color, notes) VALUES (?,?,?,?,?)",
        (d["label"], d["start_time"], d["duration_mins"], d.get("color","gray"), d.get("notes","")),
    )
    conn.commit(); rid = cur.lastrowid; conn.close()
    return jsonify({"ok": True, "id": rid})

@app.route("/api/routine/<int:rid>", methods=["PATCH"])
def api_update_routine(rid):
    d = request.json
    conn = get_db()
    conn.execute(
        "UPDATE routines SET label=?, start_time=?, duration_mins=?, color=?, notes=? WHERE id=?",
        (d["label"], d["start_time"], d["duration_mins"], d.get("color","gray"), d.get("notes",""), rid),
    )
    conn.commit(); conn.close()
    return jsonify({"ok": True})

@app.route("/api/routine/<int:rid>", methods=["DELETE"])
def api_delete_routine(rid):
    conn = get_db()
    conn.execute("DELETE FROM routines WHERE id=?", (rid,))
    conn.commit(); conn.close()
    return jsonify({"ok": True})

# ── API: Gen AI Blog Generation (via claude -p) ──────────────────────────────

@app.route("/api/genai/blog", methods=["POST"])
def api_genai_blog():
    import subprocess, shutil, copy
    d = request.json or {}
    section_title = d.get("section_title", "")
    subsections   = d.get("subsections", [])
    topics_sample = d.get("topics_sample", [])

    if not section_title:
        return jsonify({"error": "section_title required"}), 400

    # Check claude CLI is available
    if not shutil.which("claude"):
        return jsonify({"error": "Claude CLI not found. Make sure claude is installed and on your PATH."}), 500

    subs_text = ", ".join(subsections) if subsections else "all aspects"
    topics_text = "\n".join(f"- {t}" for t in topics_sample[:20]) if topics_sample else ""

    prompt = f"""You are a world-class technical educator writing for AI engineers. Create a comprehensive, beautifully structured blog post about "{section_title}" as a production AI engineering topic.

The section covers these areas: {subs_text}.

Key topics to cover:
{topics_text}

Write using this EXACT structure. Use real markdown — it will be rendered properly:

---

# [Catchy, engaging title — make it memorable]

> **Who is this for?** AI engineers who want to understand {section_title} deeply so they can build production-grade systems.

---

## 🧭 The Big Picture

[2-3 sentences giving the 30,000-foot view. What problem does this solve? Use a real-world analogy.]

**Think of it like this:** [One punchy analogy sentence in bold]

---

## 🔄 How It Works — The Flow

[Show a clear flow diagram using a Mermaid code block illustrating the core process:]

```mermaid
graph LR
    A[Input/Start] --> B[Core Process]
    B --> C[Output/Result]
```

Use flowcharts (graph LR or graph TD), sequence diagrams, or other Mermaid diagram types as appropriate. Then explain each step in 1-2 sentences below the diagram.

---

## 🎯 Core Concepts — Quick Reference

| Concept | What It Is | Why You Need It |
|---------|-----------|-----------------|
| [name]  | [1-line plain English] | [1-line reason] |

Include the 6-8 most important concepts from the topic.

---

## 💡 Key Techniques Breakdown

[For each major subsection, add a subheading and bullet points:]

### [Subsection Name 1]
- **[Technique]**: [What it does and when to use it]

### [Subsection Name 2]
- **[Technique]**: [What it does and when to use it]

---

## 🛠️ Real-World Example

**Scenario:** [Specific real scenario]

**Step-by-step:**
1. [Step 1 with specific detail]
2. [Step 2 with specific detail]
3. [Step 3 with specific detail]

---

## ⚠️ Common Pitfalls

- **[Pitfall name]**: [What happens and how to avoid it]

---

## 🔀 When to Use What

| Situation | Best Approach | Why |
|-----------|---------------|-----|
| [scenario] | [approach] | [reason] |

---

## ⚡ TL;DR — Remember These 3 Things

1. **[Key insight 1]** — [one sentence]
2. **[Key insight 2]** — [one sentence]
3. **[Key insight 3]** — [one sentence]

---

> 💬 **Quick interview tip:** If someone asks you about {section_title}, lead with the problem it solves, then the mechanism, then a real example.

---

## 🎤 Interview Quick-Fire Reference

Use this structure to answer ANY interview question about {section_title}:

IMPORTANT: Each answer MUST be in bullet points (use • for each point). NEVER write the answer as one long paragraph. Break every answer into 2-4 separate bullet points on separate lines using <br/> between them. If listing examples or types, each one MUST be on its own bullet point line.

| # | Aspect | Answer |
|---|--------|--------|
| 1 | **Definition** | • [What is it? One crisp sentence] |
| 2 | **Purpose** | • [Why does it exist?]<br/>• [What goal does it serve?] |
| 3 | **Mechanism** | • [How does it work?]<br/>• [Key step 1]<br/>• [Key step 2] |
| 4 | **Types** | • [Type 1: description]<br/>• [Type 2: description]<br/>• [Type 3: description] |
| 5 | **Usage** | • [Use case 1]<br/>• [Use case 2]<br/>• [Use case 3] |
| 6 | **Problem it solves** | • [The pain point]<br/>• [What happens without it] |
| 7 | **How it solves it** | • [The key insight]<br/>• [How it works in practice] |
| 8 | **Summary** | • [One-liner wrap up] |

---

IMPORTANT RULES:
- Use Mermaid diagram syntax (```mermaid ... ```) for ALL flow diagrams, architecture diagrams, and process flows. Use graph LR for horizontal flows, graph TD for vertical, sequenceDiagram for interactions, etc. Make them detailed with styled nodes.
- Every table MUST have a header row and separator row (|---|)
- Use **bold** for concept names throughout
- Use `backticks` for technical terms and model names
- Blockquotes (> text) for callouts and tips
- The Interview Quick-Fire Reference table at the end is MANDATORY — fill every row with real, specific content
- Target: 900-1200 words
- Fill in ALL placeholder text with real content about {section_title} — no placeholder brackets in output"""

    # Clean env to avoid nested Claude Code session error
    clean_env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

    try:
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=120,
            env=clean_env,
        )
        if result.returncode != 0:
            err = result.stderr.strip() or "claude exited with a non-zero status"
            return jsonify({"error": err}), 500

        blog_text = result.stdout.strip()
        if not blog_text:
            return jsonify({"error": "Claude returned an empty response"}), 500

        return jsonify({"ok": True, "blog": blog_text})

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Claude took too long (>120s). Try again."}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── API: Topic Blog (per-item blog generation + persistence) ────────────────

@app.route("/api/genai/topic-blog", methods=["POST"])
def api_genai_topic_blog():
    import subprocess, shutil
    d = request.json or {}
    topic_name    = d.get("topic_name", "").strip()
    section_id    = d.get("section_id", "")
    section_title = d.get("section_title", "")

    if not topic_name:
        return jsonify({"error": "topic_name required"}), 400

    if not shutil.which("claude"):
        return jsonify({"error": "Claude CLI not found. Make sure claude is installed and on your PATH."}), 500

    prompt = f"""You are a world-class technical educator writing for AI engineers. Create a focused, comprehensive blog post about "{topic_name}" (part of {section_title}).

Write using this EXACT structure. Use real markdown:

---

# {topic_name} — A Deep Dive

> **Who is this for?** AI engineers who want to truly understand {topic_name} and use it effectively in production.

---

## 🧭 What Is {topic_name}?

[2-3 sentences giving a clear definition. What problem does it solve? Use a real-world analogy.]

**Think of it like this:** [One punchy analogy sentence in bold]

---

## 🔄 How It Works

[Show a clear flow diagram using a Mermaid code block illustrating the mechanism:]

```mermaid
graph LR
    A[Input/Start] --> B[Core Process]
    B --> C[Output/Result]
```

Use flowcharts, sequence diagrams, or other Mermaid types as appropriate. Then explain each step in 1-2 sentences.

---

## 🎯 Key Properties

| Property | Details |
|----------|---------|
| [aspect] | [explanation] |

Include 4-6 key properties/characteristics.

---

## 💡 When to Use It

- **Best for:** [scenarios where this shines]
- **Not ideal for:** [scenarios where alternatives are better]
- **Compared to alternatives:** [brief comparison with related techniques]

---

## 🛠️ Practical Example

**Scenario:** [Specific real scenario]

**Implementation:**
1. [Step 1 with specific detail]
2. [Step 2 with specific detail]
3. [Step 3 with specific detail]

[Include a short code snippet or prompt example if applicable]

---

## ⚠️ Common Mistakes

- **[Mistake 1]**: [What goes wrong and how to fix it]
- **[Mistake 2]**: [What goes wrong and how to fix it]
- **[Mistake 3]**: [What goes wrong and how to fix it]

---

## ⚡ TL;DR

1. **[Key insight 1]** — [one sentence]
2. **[Key insight 2]** — [one sentence]
3. **[Key insight 3]** — [one sentence]

---

> 💬 **Interview tip:** If asked about {topic_name}, explain the core idea in one sentence, then give a concrete example, then compare with alternatives.

---

## 🎤 Interview Quick-Fire Reference

Use this structure to answer ANY interview question about {topic_name}:

IMPORTANT: Each answer MUST be in bullet points (use • for each point). NEVER write the answer as one long paragraph. Break every answer into 2-4 separate bullet points on separate lines using <br/> between them. If listing examples or types, each one MUST be on its own bullet point line.

| # | Aspect | Answer |
|---|--------|--------|
| 1 | **Definition** | • [What is it? One crisp sentence] |
| 2 | **Purpose** | • [Why does it exist?]<br/>• [What goal does it serve?] |
| 3 | **Mechanism** | • [How does it work?]<br/>• [Key step 1]<br/>• [Key step 2] |
| 4 | **Types** | • [Type 1: description]<br/>• [Type 2: description]<br/>• [Type 3: description] |
| 5 | **Usage** | • [Use case 1]<br/>• [Use case 2]<br/>• [Use case 3] |
| 6 | **Problem it solves** | • [The pain point]<br/>• [What happens without it] |
| 7 | **How it solves it** | • [The key insight]<br/>• [How it works in practice] |
| 8 | **Summary** | • [One-liner wrap up] |

---

IMPORTANT RULES:
- Use Mermaid diagram syntax (```mermaid ... ```) for ALL flow diagrams, architecture diagrams, and process flows. Use graph LR for horizontal flows, graph TD for vertical, sequenceDiagram for interactions, etc. Make them detailed with styled nodes.
- Every table MUST have a header row and separator row (|---|)
- Use **bold** for concept names
- Use `backticks` for technical terms
- The Interview Quick-Fire Reference table at the end is MANDATORY — fill every row with real, specific content
- Target: 700-1000 words
- Fill in ALL placeholders with real content about {topic_name}"""

    clean_env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

    try:
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=120,
            env=clean_env,
        )
        if result.returncode != 0:
            return jsonify({"error": result.stderr.strip() or "claude exited with non-zero status"}), 500

        blog_text = result.stdout.strip()
        if not blog_text:
            return jsonify({"error": "Claude returned an empty response"}), 500

        # Auto-save to database
        conn = get_db()
        now = now_str()
        existing = conn.execute(
            "SELECT id FROM topic_blogs WHERE topic_name=? AND section_id=?",
            (topic_name, section_id)
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE topic_blogs SET blog_content=?, updated_at=? WHERE id=?",
                (blog_text, now, existing["id"])
            )
        else:
            conn.execute(
                "INSERT INTO topic_blogs (topic_name, section_id, section_title, blog_content, created_at) VALUES (?,?,?,?,?)",
                (topic_name, section_id, section_title, blog_text, now)
            )
        conn.commit()
        conn.close()

        return jsonify({"ok": True, "blog": blog_text})

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Claude took too long (>120s). Try again."}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/genai/topic-blog/save", methods=["POST"])
def api_genai_topic_blog_save():
    """Save a streamed blog to database after streaming completes."""
    d = request.json or {}
    topic_name    = d.get("topic_name", "").strip()
    section_id    = d.get("section_id", "")
    section_title = d.get("section_title", "")
    blog_text     = d.get("blog_text", "").strip()

    if not topic_name or not blog_text:
        return jsonify({"error": "topic_name and blog_text required"}), 400

    conn = get_db()
    now = now_str()
    existing = conn.execute(
        "SELECT id FROM topic_blogs WHERE topic_name=? AND section_id=?",
        (topic_name, section_id)
    ).fetchone()
    if existing:
        conn.execute(
            "UPDATE topic_blogs SET blog_content=?, updated_at=? WHERE id=?",
            (blog_text, now, existing["id"])
        )
    else:
        conn.execute(
            "INSERT INTO topic_blogs (topic_name, section_id, section_title, blog_content, created_at) VALUES (?,?,?,?,?)",
            (topic_name, section_id, section_title, blog_text, now)
        )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/genai/topic-blogs")
def api_genai_topic_blogs_list():
    conn = get_db()
    rows = [dict(r) for r in conn.execute(
        "SELECT id, topic_name, section_id, section_title, created_at, updated_at FROM topic_blogs ORDER BY created_at DESC"
    ).fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/genai/topic-blog/<topic_name>/<section_id>")
def api_genai_topic_blog_get(topic_name, section_id):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM topic_blogs WHERE topic_name=? AND section_id=?",
        (topic_name, section_id)
    ).fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify(None)

@app.route("/api/genai/topic-blog/<int:blog_id>", methods=["DELETE"])
def api_genai_topic_blog_delete(blog_id):
    conn = get_db()
    conn.execute("DELETE FROM topic_blogs WHERE id=?", (blog_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

# ── API: DSA Code Runner ────────────────────────────────────────────────────

@app.route("/api/dsa/run", methods=["POST"])
def api_dsa_run():
    import subprocess, tempfile
    d = request.json or {}
    code = d.get("code", "")

    if not code.strip():
        return jsonify({"output": "", "error": "No code provided"})

    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            ["python3", tmp_path],
            capture_output=True, text=True, timeout=10,
        )

        os.unlink(tmp_path)

        output = result.stdout
        if result.stderr:
            output += ("\n" if output else "") + result.stderr

        return jsonify({"output": output.strip() or "(no output)"})

    except subprocess.TimeoutExpired:
        try: os.unlink(tmp_path)
        except: pass
        return jsonify({"output": "⏰ Time Limit Exceeded (10s). Check for infinite loops."})
    except Exception as e:
        try: os.unlink(tmp_path)
        except: pass
        return jsonify({"output": f"Error: {str(e)}"})

# ── API: DSA Problem Generator ─────────────────────────────────────────────

@app.route("/api/dsa/generate-problem", methods=["POST"])
def api_dsa_generate_problem():
    """Generate description + starterCode for a DSA problem using Claude, then write it into dsaData.js."""
    import re as re_mod
    d = request.json or {}
    title = d.get("title", "").strip()
    difficulty = d.get("difficulty", "Easy")
    topic_label = d.get("topic_label", "")
    step_title = d.get("step_title", "")

    if not title:
        return jsonify({"error": "Missing problem title"}), 400

    prompt = f"""You are generating a DSA problem for a coding practice app (Python only).

Problem title: "{title}"
Difficulty: {difficulty}
Topic: {topic_label}
Step: {step_title}

Generate TWO things as valid JSON with keys "description" and "starterCode":

1. "description" — HTML string with:
   - <h3>Problem</h3> with clear problem statement using <code> for variables/values and <b> for emphasis
   - <h3>Examples</h3> with 2-3 examples in <pre> blocks showing Input/Output/Explanation
   - <h3>Constraints</h3> as a <ul> list
   - Do NOT include the title in the description

2. "starterCode" — Python string with:
   - A function stub with descriptive docstring and "pass" body
   - A test harness after "# --- Test cases (do not modify) ---" comment
   - Test harness should: print 2-3 sample calls, then print "═══TEST_RESULTS═══", then run 8-12 test cases
   - Each test prints "Test N: PASSED ✅" or "Test N: FAILED ❌" with expected/got values
   - End with: if all_pass: print("\\n🎉 All tests passed!")
   - IMPORTANT: Include MANY edge cases! Always include:
     * Empty input (empty array/string/0/None where applicable)
     * Single element input
     * Two elements
     * All same elements / duplicates
     * Already sorted / reverse sorted (for sorting/search problems)
     * Negative numbers (if applicable)
     * Very large values (near constraint limits)
     * Minimum and maximum boundary values from constraints
     * Special patterns (all zeros, alternating, palindromic, etc. where relevant)
   - The function should match the problem exactly

Return ONLY valid JSON, no markdown fences, no explanation. Example format:
{{"description": "<h3>Problem</h3>...", "starterCode": "def func(...):\\n    pass\\n..."}}"""

    raw, source = run_ai_prompt(prompt, timeout=180, expect_json=True)
    if not raw:
        return jsonify({"error": f"AI generation failed ({source})"}), 500

    try:
        import json as json_mod
        data = json_mod.loads(raw)
        description = data.get("description", "")
        starter_code = data.get("starterCode", "")
        if not description or not starter_code:
            return jsonify({"error": "AI returned incomplete data"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to parse AI response: {e}"}), 500

    # Write into dsaData.js
    dsa_path = os.path.join(os.path.dirname(__file__), "src", "data", "dsaData.js")
    try:
        with open(dsa_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the problem entry: { title: 'TITLE', difficulty: 'DIFF' }
        # and replace with the full version including description + starterCode
        escaped_title = title.replace("'", "\\'")

        # Match the simple entry (title + difficulty only, no description)
        pattern = re_mod.compile(
            r"\{\s*title:\s*'" + re_mod.escape(escaped_title) + r"'\s*,\s*difficulty:\s*'" + re_mod.escape(difficulty) + r"'\s*\}",
        )
        match = pattern.search(content)
        if not match:
            # Try with double quotes or slightly different format
            pattern2 = re_mod.compile(
                r"\{\s*title:\s*'" + re_mod.escape(escaped_title) + r"'\s*,\s*difficulty:\s*'" + re_mod.escape(difficulty) + r"'\s*,?\s*\}",
            )
            match = pattern2.search(content)

        if not match:
            return jsonify({"error": "Could not find problem entry in dsaData.js", "description": description, "starterCode": starter_code}), 200

        # Build the replacement — use backtick template literals for multiline
        desc_escaped = description.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        code_escaped = starter_code.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

        replacement = "{\n" + f"            title: '{escaped_title}',\n" + f"            difficulty: '{difficulty}',\n" + f"            description: `{desc_escaped}`,\n" + f"            starterCode: `{code_escaped}`,\n" + "          }"

        new_content = content[:match.start()] + replacement + content[match.end():]

        with open(dsa_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        return jsonify({"ok": True, "description": description, "starterCode": starter_code})

    except Exception as e:
        # Return the generated data even if file write fails
        return jsonify({"error": f"File write failed: {e}", "description": description, "starterCode": starter_code}), 200


# ── Interview Practice — AI Feedback ─────────────────────────────────────────

@app.route("/api/interview/feedback", methods=["POST"])
def api_interview_feedback():
    import subprocess
    d = request.json or {}
    question = d.get("question", "")
    answer = d.get("answer", "")
    confidence = d.get("confidence", {})

    if not answer.strip():
        return jsonify({"feedback": "No answer provided to analyze."})

    prompt = f"""You are an expert interview coach. Analyze this interview response.

Question: {question}

Candidate's Answer: {answer}

Confidence Metrics:
- Speaking pace: {confidence.get('pace', 'N/A')} WPM
- Filler word rate: {confidence.get('fillerRate', 'N/A')}%
- Answer length: {confidence.get('wordCount', 'N/A')} words
- Confidence score: {confidence.get('score', 'N/A')}/100

Provide feedback in this exact format:
**Overall Score:** X/10

**Strengths:**
- (2-3 bullet points)

**Areas to Improve:**
- (2-3 bullet points)

**Suggested Better Answer:**
(A concise improved version of their answer, 3-4 sentences max)

**Delivery Tips:**
- (1-2 tips based on confidence metrics)

Keep feedback concise and actionable."""

    try:
        clean_env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=60,
            env=clean_env,
        )
        feedback = result.stdout.strip()
        if result.returncode != 0 or not feedback:
            feedback = result.stderr.strip() or "Failed to generate feedback. Please try again."
        return jsonify({"feedback": feedback})
    except subprocess.TimeoutExpired:
        return jsonify({"feedback": "⏰ Feedback generation timed out. Please try again."})
    except Exception as e:
        return jsonify({"feedback": f"Error generating feedback: {str(e)}"})

# ── Interview Practice — Session Storage ─────────────────────────────────────

@app.route("/api/interview/sessions", methods=["GET"])
def api_interview_sessions():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, question, category, transcript, confidence_json, feedback, score, duration_sec, created_at "
        "FROM interview_sessions ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/interview/session", methods=["POST"])
def api_interview_save_session():
    import json as json_mod
    d = request.json or {}
    conn = get_db()
    conn.execute(
        "INSERT INTO interview_sessions (question, category, transcript, confidence_json, feedback, score, duration_sec, created_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        (
            d.get("question", ""),
            d.get("category", ""),
            d.get("transcript", ""),
            json_mod.dumps(d.get("confidence", {})),
            d.get("feedback", ""),
            d.get("score", 0),
            d.get("duration_sec", 0),
            now_str(),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/api/interview/session/<int:sid>", methods=["DELETE"])
def api_interview_delete_session(sid):
    conn = get_db()
    conn.execute("DELETE FROM interview_sessions WHERE id=?", (sid,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/api/interview/stats", methods=["GET"])
def api_interview_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM interview_sessions").fetchone()[0]
    avg_score = conn.execute("SELECT AVG(score) FROM interview_sessions WHERE score > 0").fetchone()[0] or 0
    avg_confidence = conn.execute("SELECT AVG(json_extract(confidence_json, '$.overall')) FROM interview_sessions WHERE confidence_json != '{}'").fetchone()[0] or 0
    by_cat = conn.execute(
        "SELECT category, COUNT(*) as cnt, AVG(score) as avg_score "
        "FROM interview_sessions GROUP BY category ORDER BY cnt DESC"
    ).fetchall()
    recent = conn.execute(
        "SELECT score, json_extract(confidence_json, '$.overall') as conf, created_at "
        "FROM interview_sessions ORDER BY created_at DESC LIMIT 20"
    ).fetchall()
    conn.close()
    return jsonify({
        "total": total,
        "avg_score": round(avg_score, 1),
        "avg_confidence": round(avg_confidence, 1),
        "by_category": [dict(r) for r in by_cat],
        "recent": [dict(r) for r in recent],
    })

# ── API: Python Blog Generation ─────────────────────────────────────────────

@app.route("/api/python/blog", methods=["POST"])
def api_python_blog():
    d = request.json or {}
    phase_title = d.get("phase_title", "")
    topic_label = d.get("topic_label", "")
    problem_titles = d.get("problem_titles", [])

    if not topic_label:
        return jsonify({"error": "topic_label required"}), 400

    problems_text = "\n".join(f"- {t}" for t in problem_titles) if problem_titles else ""

    prompt = f"""You are a friendly Python teacher. Write a blog post about "{topic_label}" from {phase_title}.

VERY IMPORTANT: Use simple, everyday English. Write like you are explaining to a friend. No fancy words. Short sentences. If a simple word exists, use it instead of a complex one. For example: say "use" not "utilize", "start" not "initialize", "make" not "construct", "check" not "validate", "show" not "demonstrate".

Practice problems in this topic:
{problems_text}

Write using this EXACT structure in markdown (EVERY blog must follow this same pattern):

---

# [Simple, clear title about {topic_label}]

> **Who is this for?** Anyone learning {topic_label} for interviews or real work.

---

## 🧭 The Big Picture

[2-3 simple sentences. What is this? Why should I care? Use a real-life example to explain — like comparing it to something from daily life.]

---

## 🔍 Core Concepts

[Cover the key ideas in {topic_label}. For each one:
- What it is (one simple sentence)
- How it works (plain explanation)
- When to use it
- Short code example]

---

## 💻 Practical Examples

IMPORTANT: Give at least 5-6 practical, real-world code examples. Go from easy to hard. Each example should be something you'd actually write at work or in a project — not textbook-style. Use everyday scenarios like:
- Working with user data, files, APIs, databases
- Building a small feature (shopping cart, to-do list, user profile)
- Handling errors in a real app
- Processing data (CSV, JSON, logs)

For EACH example:
1. One line saying what this example does and why
2. Working Python code with comments
3. Expected output

```python
# Example 1: [What it does — real scenario]
# [well-commented working code]
print(result)  # show the output
```

```python
# Example 2: [Slightly harder real scenario]
# [well-commented working code]
```

```python
# Example 3: [Real-world use case]
```

```python
# Example 4: [Common pattern you see in production code]
```

```python
# Example 5: [Tricky but useful pattern]
```

```python
# Example 6: [Putting it all together — mini project example]
```

---

## ⚡ Performance & Memory

[How fast is it? How much memory does it use? Keep it simple. Use Big-O but explain what it means in plain words.]

---

## 🏗️ Real-World Usage

[3-4 real scenarios where this is used in actual projects. For each:
- What the project/task is
- How {topic_label} helps
- A small code snippet showing the pattern]

---

## ⚠️ Common Mistakes & Fixes

[3-4 mistakes people make. For each:
- The wrong way (with code)
- Why it's wrong
- The right way (with code)]

---

## 🎯 Interview Tips

[What interviewers want to hear about {topic_label}. Common follow-up questions. Things to mention that impress interviewers.]

---

## 🎤 Interview Quick-Fire Reference

Write each answer exactly how I would SAY it to an interviewer — first person, conversational, confident.

IMPORTANT: Each answer MUST be in bullet points (use • for each point). NEVER write the answer as one long paragraph. Break every answer into 2-4 separate bullet points on separate lines using <br/> between them.

| # | If they ask... | What I'd say |
|---|----------------|-------------|
| 1 | **What is it?** | • So {topic_label} is basically...<br/>• Think of it like...<br/>• In simple words... |
| 2 | **Why does it exist?** | • The main reason we need this is...<br/>• Without it, we'd have to...<br/>• It saves us from... |
| 3 | **How does it work?** | • The way it works is...<br/>• First it...<br/>• Then it... |
| 4 | **What are the types?** | • There are mainly...<br/>• The first one is...<br/>• The second one is...<br/>• The key difference is... |
| 5 | **When do you use it?** | • I'd reach for this when...<br/>• A real example would be...<br/>• It's especially useful for... |
| 6 | **What problem does it solve?** | • Without this, we'd have to...<br/>• The pain point is...<br/>• It fixes this by... |
| 7 | **How does it solve it?** | • The clever part is...<br/>• Under the hood it...<br/>• This means we get... |
| 8 | **Sum it up** | • In short...<br/>• The key takeaway is...<br/>• If I had to explain it in one line... |

---

RULES:
- SIMPLE ENGLISH ONLY. No big words. Write like you talk.
- MUST have at least 5-6 practical code examples with real-world scenarios
- Every blog MUST follow the EXACT same section order shown above
- Use Mermaid (```mermaid ... ```) for flow diagrams where helpful
- Every table MUST have header + separator row (|---|)
- Use **bold** for concept names
- Use `backticks` for code/technical terms
- The Quick Reference Table at the end is MANDATORY
- Target: 1200-1800 words (longer than before because of more examples)
- Fill ALL placeholders with real content about {topic_label}"""

    text, source = run_ai_prompt(prompt)
    if text is None:
        return jsonify({"error": f"AI generation failed ({source}). Try again."}), 504
    return jsonify({"ok": True, "blog": text, "source": source})


@app.route("/api/python/explain", methods=["POST"])
def api_python_explain():
    """Generate a detailed concept explanation for a specific Python problem/topic."""
    d = request.json or {}
    topic = d.get("topic", "")
    phase_title = d.get("phase_title", "")
    topic_label = d.get("topic_label", "")
    difficulty = d.get("difficulty", "Medium")

    if not topic:
        return jsonify({"error": "topic required"}), 400

    prompt = f"""You are a friendly Python teacher. Explain "{topic}" (from {phase_title} > {topic_label}). Difficulty: {difficulty}.

VERY IMPORTANT: Use simple, everyday English. Write like you are talking to a friend. No fancy words. Short sentences. Say "use" not "utilize", "start" not "initialize", "make" not "construct", "check" not "validate".

Write using this EXACT structure in markdown (EVERY explanation must follow this same pattern):

## What is {topic}?

[2-3 simple sentences. What is it? Why should I care? Compare it to something from daily life.]

## How It Works

[Step-by-step explanation. Keep each step short and clear.]

```python
# Simple, clear code example with comments
```

## Practical Examples

IMPORTANT: Give at least 4-5 practical code examples. Use real-world scenarios — things you'd actually do in a project. Go from easy to hard.

```python
# Example 1: [Simple real-world use case]
# [working code with comments and output]
```

```python
# Example 2: [Slightly harder scenario]
```

```python
# Example 3: [Common pattern in real projects]
```

```python
# Example 4: [Tricky but useful pattern]
```

```python
# Example 5: [Putting it together — mini real task]
```

## Key Points to Remember

- [Point 1 — the most important thing]
- [Point 2 — common mistake people make]
- [Point 3 — when to use it and when not to]
- [Point 4 — speed or memory thing to know]

## Under the Hood

[2-3 sentences about what Python does internally. Keep it simple.]

```python
# Code example showing tricky/edge cases
```

## Common Mistakes

1. [Mistake 1 — wrong code, why it's wrong, and the fix]
2. [Mistake 2 — wrong code, why it's wrong, and the fix]
3. [Mistake 3 — wrong code, why it's wrong, and the fix]

## Interview Answer

> **If asked about {topic} in an interview, here's what I'd say (first person, confident, conversational, in bullet points):**
> • So basically {topic} is...
> • The way it works is...
> • I usually use it when...
> • One thing to watch out for is...

IMPORTANT: The interview answer MUST be in bullet points (use • for each point), NOT a single paragraph. Each point should be a separate line.

RULES:
- SIMPLE ENGLISH ONLY. No big words. Write like you talk.
- MUST have at least 4-5 practical code examples with real-world scenarios
- Every explanation MUST follow the EXACT same section order shown above
- Use Mermaid (```mermaid ... ```) for flow diagrams where helpful
- Use `backticks` for Python keywords
- Use **bold** for concept names
- Target 700-1100 words (longer because of more examples)
- Include working Python code with expected output
- Fill ALL placeholders with real content"""

    text, source = run_ai_prompt(prompt)
    if text is None:
        return jsonify({"error": f"AI generation failed ({source}). Try again."}), 504
    return jsonify({"ok": True, "blog": text, "source": source})


# ── Python Random Practice Questions ─────────────────────────────────────────

@app.route("/api/python/random-question", methods=["POST"])
def api_python_random_question():
    """Generate a random real-world Python coding question based on completed topics."""
    d = request.json or {}
    completed_topics = d.get("completed_topics", [])
    difficulty = d.get("difficulty", "Medium")

    if not completed_topics:
        return jsonify({"error": "No completed topics provided"}), 400

    topics_str = "\n".join(f"- {t}" for t in completed_topics)

    prompt = f"""You are a senior Python engineer at Google. Generate ONE random real-world Python coding challenge that tests concepts from the topics the user has already learned.

COMPLETED TOPICS:
{topics_str}

DIFFICULTY: {difficulty}

You MUST respond in EXACTLY this JSON format (no markdown wrapping, no extra text):
{{
  "title": "Short descriptive title (5-8 words)",
  "difficulty": "{difficulty}",
  "topics_tested": ["topic1", "topic2"],
  "description": "Clear problem description in markdown. Include:\\n- What to build/implement\\n- Real-world context (why this matters)\\n- Input/output examples\\n- Constraints or edge cases",
  "starter_code": "Python starter code with function signatures, docstrings, and test cases using the ═══TEST_RESULTS═══ pattern",
  "hints": ["hint1", "hint2", "hint3"],
  "solution_approach": "Brief explanation of the optimal approach (3-4 sentences)"
}}

RULES:
- The question MUST combine 2-3 of the completed topics creatively
- Make it a REAL-WORLD scenario (API client, data pipeline, caching system, config parser, etc.) — not a textbook exercise
- The starter code MUST include a test harness at the bottom that prints ═══TEST_RESULTS═══ followed by PASS/FAIL lines
- Include at least 4 test cases in the harness
- The difficulty should match: Easy = 10-20 lines solution, Medium = 20-40 lines, Hard = 40-60 lines
- NEVER repeat common textbook problems like FizzBuzz, palindrome, etc.
- Focus on production Python patterns: error handling, generators, decorators, context managers, dataclasses, etc.
- Return ONLY valid JSON, no markdown fences"""

    raw, source = run_ai_prompt(prompt, expect_json=True)
    if raw is None:
        return jsonify({"error": f"AI generation failed ({source}). Try again."}), 504

    import json as json_mod
    try:
        question = json_mod.loads(raw)
        return jsonify({"ok": True, "question": question, "source": source})
    except json_mod.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response as JSON", "raw": raw[:500]}), 500


# ── DSA Random Practice Questions ─────────────────────────────────────────────

@app.route("/api/dsa/random-question", methods=["POST"])
def api_dsa_random_question():
    """Generate a random DSA coding question based on completed topics."""
    d = request.json or {}
    completed_topics = d.get("completed_topics", [])
    difficulty = d.get("difficulty", "Medium")

    if not completed_topics:
        return jsonify({"error": "No completed topics provided"}), 400

    topics_str = "\n".join(f"- {t}" for t in completed_topics)

    prompt = f"""You are a senior software engineer at Google. Generate ONE random DSA (Data Structures & Algorithms) coding challenge that tests concepts from the topics the user has already learned.

COMPLETED TOPICS:
{topics_str}

DIFFICULTY: {difficulty}

You MUST respond in EXACTLY this JSON format (no markdown wrapping, no extra text):
{{
  "title": "Short descriptive title (5-8 words)",
  "difficulty": "{difficulty}",
  "topics_tested": ["topic1", "topic2"],
  "description": "Clear problem description in markdown. Include:\\n- Problem statement\\n- Input/output format\\n- Examples with explanation\\n- Constraints",
  "starter_code": "Python starter code with function signature and test cases using the ═══TEST_RESULTS═══ pattern",
  "hints": ["hint1", "hint2", "hint3"],
  "solution_approach": "Brief explanation of the optimal approach with time/space complexity (3-4 sentences)"
}}

RULES:
- The question MUST combine 2-3 of the completed topics creatively
- Make it a REAL interview-style problem — the kind asked at Google, Amazon, Meta
- The starter code MUST include a test harness at the bottom that prints ═══TEST_RESULTS═══ followed by PASS/FAIL lines
- Include at least 4 test cases including edge cases in the harness
- The difficulty should match: Easy = brute force O(n²) ok, Medium = need optimal O(n log n) or O(n), Hard = tricky DP/advanced DS
- Focus on algorithmic thinking: arrays, strings, trees, graphs, DP, greedy, binary search, sliding window, etc.
- NEVER repeat classic textbook problems verbatim — put a twist or combine topics
- Return ONLY valid JSON, no markdown fences"""

    raw, source = run_ai_prompt(prompt, expect_json=True)
    if raw is None:
        return jsonify({"error": f"AI generation failed ({source}). Try again."}), 504

    import json as json_mod
    try:
        question = json_mod.loads(raw)
        return jsonify({"ok": True, "question": question, "source": source})
    except json_mod.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response as JSON", "raw": raw[:500]}), 500


# ── Explain Selection (for blog highlights) ──────────────────────────────────

@app.route("/api/explain-selection", methods=["POST"])
def api_explain_selection():
    """Short explanation for a selected word/sentence in context of a topic."""
    d = request.json or {}
    selected_text = d.get("text", "")
    topic_context = d.get("topic", "")

    if not selected_text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""Explain this in 2-3 simple sentences. Context: we are learning about {topic_context} in Python.

Selected text: "{selected_text}"

RULES:
- Keep it very short — max 3 sentences
- Use simple everyday English, no fancy words
- If it's a code term, explain what it does
- If it's a concept, explain it like talking to a friend
- Do NOT repeat the selected text back, just explain it"""

    text, source = run_ai_prompt(prompt, timeout=60, model="claude-haiku-4-5-20251001")
    if text is None:
        return jsonify({"error": f"Failed ({source})"}), 504
    return jsonify({"ok": True, "explanation": text, "source": source})


# ── Streaming blog endpoints ─────────────────────────────────────────────────

@app.route("/api/genai/blog/stream", methods=["POST"])
def api_genai_blog_stream():
    d = request.json or {}
    section_title = d.get("section_title", "")
    subsections   = d.get("subsections", [])
    topics_sample = d.get("topics_sample", [])

    if not section_title:
        return jsonify({"error": "section_title required"}), 400

    subs_text = ", ".join(subsections) if subsections else "all aspects"
    topics_text = "\n".join(f"- {t}" for t in topics_sample[:20]) if topics_sample else ""

    # Same prompt as the non-streaming endpoint
    prompt = f"""You are a world-class technical educator writing for AI engineers. Create a comprehensive, beautifully structured blog post about "{section_title}" as a production AI engineering topic.

The section covers these areas: {subs_text}.

Key topics to cover:
{topics_text}

Write using this EXACT structure. Use real markdown — it will be rendered properly:

---

# [Catchy, engaging title — make it memorable]

> **Who is this for?** AI engineers who want to understand {section_title} deeply so they can build production-grade systems.

---

## 🧭 The Big Picture

[2-3 sentences giving the 30,000-foot view. What problem does this solve? Use a real-world analogy.]

**Think of it like this:** [One punchy analogy sentence in bold]

---

## 🔄 How It Works — The Flow

[Show a clear flow diagram using a Mermaid code block illustrating the core process:]

```mermaid
graph LR
    A[Input/Start] --> B[Core Process]
    B --> C[Output/Result]
```

Use flowcharts (graph LR or graph TD), sequence diagrams, or other Mermaid diagram types as appropriate. Then explain each step in 1-2 sentences below the diagram.

---

## 🎯 Core Concepts — Quick Reference

| Concept | What It Is | Why You Need It |
|---------|-----------|-----------------|
| [name]  | [1-line plain English] | [1-line reason] |

Include the 6-8 most important concepts from the topic.

---

## 💡 Key Techniques Breakdown

[For each major subsection, add a subheading and bullet points:]

### [Subsection Name 1]
- **[Technique]**: [What it does and when to use it]

### [Subsection Name 2]
- **[Technique]**: [What it does and when to use it]

---

## 🛠️ Real-World Example

**Scenario:** [Specific real scenario]

**Step-by-step:**
1. [Step 1 with specific detail]
2. [Step 2]
3. [Step 3]

[Add a code block or configuration example if relevant]

---

## ⚡ Decision Guide

| Situation | Best Approach | Why |
|-----------|---------------|-----|
| [scenario] | [approach] | [reason] |

Add 4-5 decision scenarios.

---

> 💬 **Quick interview tip:** If someone asks you about {section_title}, lead with the problem it solves, then the mechanism, then a real example.

---

## 🎤 Interview Quick-Fire Reference

Use this structure to answer ANY interview question about {section_title}:

IMPORTANT: Each answer MUST be in bullet points (use • for each point). NEVER write the answer as one long paragraph. Break every answer into 2-4 separate bullet points on separate lines using <br/> between them. If listing examples or types, each one MUST be on its own bullet point line.

| # | Aspect | Answer |
|---|--------|--------|
| 1 | **Definition** | • [What is it? One crisp sentence] |
| 2 | **Purpose** | • [Why does it exist?]<br/>• [What goal does it serve?] |
| 3 | **Mechanism** | • [How does it work?]<br/>• [Key step 1]<br/>• [Key step 2] |
| 4 | **Types** | • [Type 1: description]<br/>• [Type 2: description]<br/>• [Type 3: description] |
| 5 | **Usage** | • [Use case 1]<br/>• [Use case 2]<br/>• [Use case 3] |
| 6 | **Problem it solves** | • [The pain point]<br/>• [What happens without it] |
| 7 | **How it solves it** | • [The key insight]<br/>• [How it works in practice] |
| 8 | **Summary** | • [One-liner wrap up] |

---

IMPORTANT RULES:
- Use Mermaid diagram syntax for ALL flow diagrams
- Every table MUST have a header row and separator row (|---|)
- Use **bold** for concept names throughout
- Use `backticks` for technical terms and model names
- Blockquotes (> text) for callouts and tips
- The Interview Quick-Fire Reference table at the end is MANDATORY — fill every row with real, specific content
- Target: 900-1200 words
- Fill in ALL placeholder text with real content about {section_title} — no placeholder brackets in output"""

    return Response(stream_ai_prompt(prompt), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route("/api/genai/topic-blog/stream", methods=["POST"])
def api_genai_topic_blog_stream():
    d = request.json or {}
    topic_name    = d.get("topic_name", "").strip()
    section_id    = d.get("section_id", "")
    section_title = d.get("section_title", "")

    if not topic_name:
        return jsonify({"error": "topic_name required"}), 400

    prompt = f"""You are a world-class technical educator. Write a focused, deep-dive blog post about "{topic_name}" within the context of {section_title} for AI engineers.

Write using this EXACT structure in markdown:

---

# {topic_name}: A Deep Dive

> **Who is this for?** AI engineers who want to master {topic_name} for production systems and interviews.

---

## 🧭 The Big Picture

[2-3 sentences. What is {topic_name}? Why is it critical? Use a real-world analogy.]

---

## 🔍 Core Concepts

[Explain the 4-6 core concepts of {topic_name}. For each:]
- What it is
- How it works
- Why it matters

---

## 🔄 How It Works

```mermaid
graph LR
    A[Start] --> B[Step 1]
    B --> C[Step 2]
    C --> D[Result]
```

[Explain the flow step by step]

---

## 🎯 Key Properties

| Property | Details |
|----------|---------|
| [prop]   | [detail] |

---

## 💡 When to Use It

- **Best for:** [specific use cases]
- **Not ideal for:** [anti-patterns]
- **Compared to alternatives:** [brief comparison]

---

## 🛠️ Practical Example

**Scenario:** [Real-world scenario]

**Implementation:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

[Code block if applicable]

---

## ⚠️ Common Pitfalls

1. [Pitfall 1 and how to avoid it]
2. [Pitfall 2 and how to avoid it]
3. [Pitfall 3 and how to avoid it]

---

> 💬 **Interview tip:** If asked about {topic_name}, explain the core idea in one sentence, then give a concrete example, then compare with alternatives.

---

## 🎤 Interview Quick-Fire Reference

Use this structure to answer ANY interview question about {topic_name}:

IMPORTANT: Each answer MUST be in bullet points (use • for each point). NEVER write the answer as one long paragraph. Break every answer into 2-4 separate bullet points on separate lines using <br/> between them. If listing examples or types, each one MUST be on its own bullet point line.

| # | Aspect | Answer |
|---|--------|--------|
| 1 | **Definition** | • [What is it? One crisp sentence] |
| 2 | **Purpose** | • [Why does it exist?]<br/>• [What goal does it serve?] |
| 3 | **Mechanism** | • [How does it work?]<br/>• [Key step 1]<br/>• [Key step 2] |
| 4 | **Types** | • [Type 1: description]<br/>• [Type 2: description]<br/>• [Type 3: description] |
| 5 | **Usage** | • [Use case 1]<br/>• [Use case 2]<br/>• [Use case 3] |
| 6 | **Problem it solves** | • [The pain point]<br/>• [What happens without it] |
| 7 | **How it solves it** | • [The key insight]<br/>• [How it works in practice] |
| 8 | **Summary** | • [One-liner wrap up] |

---

IMPORTANT RULES:
- Use Mermaid diagram syntax for ALL flow diagrams
- Every table MUST have a header row and separator row (|---|)
- Use **bold** for concept names
- Use `backticks` for technical terms
- The Interview Quick-Fire Reference table at the end is MANDATORY — fill every row with real, specific content
- Target: 700-1000 words
- Fill in ALL placeholders with real content about {topic_name}"""

    return Response(stream_ai_prompt(prompt), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route("/api/python/blog/stream", methods=["POST"])
def api_python_blog_stream():
    d = request.json or {}
    phase_title = d.get("phase_title", "")
    topic_label = d.get("topic_label", "")
    problem_titles = d.get("problem_titles", [])

    if not topic_label:
        return jsonify({"error": "topic_label required"}), 400

    problems_text = "\n".join(f"- {t}" for t in problem_titles) if problem_titles else ""

    prompt = f"""You are a friendly Python teacher. Write a blog post about "{topic_label}" from {phase_title}.

VERY IMPORTANT: Use simple, everyday English. Write like you are explaining to a friend. No fancy words. Short sentences.

Practice problems in this topic:
{problems_text}

Write using this EXACT structure in markdown (EVERY blog must follow this same pattern):

---

# [Simple, clear title about {topic_label}]

> **Who is this for?** Anyone learning {topic_label} for interviews or real work.

---

## 🧭 The Big Picture

[2-3 simple sentences. What is this? Why should I care?]

---

## 🔍 Core Concepts

[Cover the key ideas. For each: what it is, how it works, short code example]

---

## 💻 Practical Examples

IMPORTANT: Give at least 5-6 practical, real-world code examples.

---

## ⚡ Performance & Memory

[How fast is it? Big-O explained simply.]

---

## 🏗️ Real-World Usage

[3-4 real scenarios]

---

## ⚠️ Common Mistakes & Fixes

[3-4 mistakes with wrong way and right way]

---

## 🎯 Interview Tips

[What interviewers want to hear]

---

## 🎤 Interview Quick-Fire Reference

IMPORTANT: Each answer MUST be in bullet points (use • for each point). Break into 2-4 separate bullet points using <br/> between them.

| # | If they ask... | What I'd say |
|---|----------------|-------------|
| 1 | **What is it?** | • [answer]<br/>• [answer] |
| 2 | **Why does it exist?** | • [answer]<br/>• [answer] |
| 3 | **How does it work?** | • [answer]<br/>• [answer] |
| 4 | **What are the types?** | • [type 1]<br/>• [type 2]<br/>• [type 3] |
| 5 | **When do you use it?** | • [answer]<br/>• [answer] |
| 6 | **What problem does it solve?** | • [answer]<br/>• [answer] |
| 7 | **How does it solve it?** | • [answer]<br/>• [answer] |
| 8 | **Sum it up** | • [answer] |

---

RULES:
- SIMPLE ENGLISH ONLY
- MUST have at least 5-6 practical code examples
- Every blog MUST follow the EXACT same section order
- The Quick Reference Table is MANDATORY
- Target: 1200-1800 words
- Fill ALL placeholders with real content about {topic_label}"""

    return Response(stream_ai_prompt(prompt), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ── init + run ───────────────────────────────────────────────────────────────
init_db()

if __name__ == "__main__":
    print("✅ Day Planner API running at http://localhost:5050")
    app.run(debug=True, port=5050)
