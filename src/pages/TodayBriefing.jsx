import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { trackMeta, trackOrder, STORAGE_KEY, loadChecks, getTrackStats, taskId as getTaskId } from '../data/prepData'
import { PLAN } from './PrepPlan'
import { getLocalDate } from '../utils/dateUtils'

const emojis = ['', '😴', '😐', '🙂', '😊', '🔥']

export default function TodayBriefing() {
  const today = getLocalDate()
  const [briefing, setBriefing] = useState(null)
  const [planner, setPlanner] = useState(null)
  const [sessions, setSessions] = useState([])
  const [mood, setMood] = useState(0)
  const [checks, setChecks] = useState(loadChecks)

  const toggleCheck = (tId) => {
    setChecks(prev => {
      const next = { ...prev, [tId]: !prev[tId] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const offset = parseInt(localStorage.getItem('dp_prep_offset') || '0', 10)

  const load = () => {
    fetch('/api/briefing').then(r => r.json()).then(d => {
      setBriefing(d)
      if (d.mood) setMood(d.mood.energy_level)
    })
    fetch(`/api/planner/${today}`).then(r => r.json()).then(setPlanner)
    fetch(`/api/study_sessions/${today}`).then(r => r.json()).then(setSessions)
  }

  useEffect(() => {
    load()
    const intv = setInterval(load, 60000)
    return () => clearInterval(intv)
  }, [today])

  const saveMood = (level) => {
    setMood(level)
    fetch('/api/save_mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, energy_level: level })
    })
  }

  if (!briefing || !planner) return <div className="text-center mt-lg" style={{ color: 'var(--neu-text-secondary)' }}>Loading...</div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

  // Today's planner stats
  const blocks = planner.blocks || {}
  const allBlocks = Object.values(blocks)
  const scheduledBlocks = allBlocks.filter(b => b.task_title)
  const doneBlocks = scheduledBlocks.filter(b => b.is_done)
  const todayTotal = scheduledBlocks.length
  const todayDone = doneBlocks.length
  const todayPct = todayTotal > 0 ? Math.round(todayDone / todayTotal * 100) : 0

  // Today's study stats
  const totalStudyHours = sessions.reduce((acc, s) => acc + (s.hours || 0), 0)
  const trackBreakdown = {}
  sessions.forEach(s => {
    trackBreakdown[s.track] = (trackBreakdown[s.track] || 0) + s.hours
  })

  // Effective day for prep
  const effectiveDayNum = briefing ? Math.max(1, briefing.day_num - offset) : 1
  let todayPrepTasks = []
  let weekNum = 1
  for (const w of PLAN) {
    const d = w.days.find(day => day.day === effectiveDayNum)
    if (d) { todayPrepTasks = d.tasks; weekNum = w.week; break }
  }

  // Prep task completion for today
  const prepDone = todayPrepTasks.filter((t, i) => {
    const tId = getTaskId(weekNum, effectiveDayNum, t.track, i)
    return !!checks[tId]
  }).length
  const prepTotal = todayPrepTasks.length
  const prepPct = prepTotal > 0 ? Math.round(prepDone / prepTotal * 100) : 0

  // Overall prep stats
  const { stats, totalTasks, totalDone } = getTrackStats(PLAN, checks)
  const overallPct = totalTasks > 0 ? Math.round(totalDone / totalTasks * 100) : 0

  // Current hour task
  const currentBlock = blocks[String(hour)] || {}
  const nextBlock = blocks[String(hour + 1)] || {}
  const routinesNow = planner.routines[String(hour)]
  const routinesNext = planner.routines[String(hour + 1)]

  // Hours remaining
  const hoursLeft = Array.from({ length: 18 }, (_, i) => i + 6).filter(h => h > hour)
  const emptyHoursLeft = hoursLeft.filter(h => {
    const b = blocks[String(h)] || {}
    const r = planner.routines[String(h)]
    return !b.task_title && (!r || r.length === 0)
  }).length

  return (
    <>
      <div className="briefing-hero animate-in">
        <h1>Good {greeting}! {greetEmoji}</h1>
        <div className="day-badge">📅 {today} — Day {effectiveDayNum}</div>
        <p className="sub-text">Here's how today is going.</p>
      </div>

      {/* ── Live Stats ── */}
      <div className="card-grid animate-in delay-1" style={{ maxWidth: 780, margin: '0 auto 24px' }}>
        <div className="stat-card">
          <div className="stat-value">{todayDone}/{todayTotal}</div>
          <div className="stat-label">Planner Tasks Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayPct}%</div>
          <div className="stat-label">Today's Completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStudyHours.toFixed(1)}h</div>
          <div className="stat-label">Study Hours Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{prepDone}/{prepTotal}</div>
          <div className="stat-label">Prep Tasks Done</div>
        </div>
      </div>

      {/* ── Today's Progress Bar ── */}
      <div className="animate-in delay-1" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--neu-text-primary)' }}>Today's Progress</div>
          <div style={{ fontSize: '.75rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>{todayPct}%</div>
        </div>
        <div className="progress-track" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${todayPct}%` }}></div>
        </div>
      </div>

      {/* ── Current / Next Task ── */}
      <div className="card-grid animate-in delay-2" style={{ maxWidth: 700, margin: '0 auto 24px', gridTemplateColumns: '1fr 1fr' }}>
        <div className="card neu-pressed-accent" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--neu-accent)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Now ({hour}:00)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {routinesNow && routinesNow.length > 0
              ? routinesNow.map(r => r.label).join(', ')
              : currentBlock.task_title || 'Free time'}
          </div>
          {currentBlock.category && currentBlock.category !== 'general' && (
            <span className="pill pill-routine" style={{ marginTop: 8 }}>{currentBlock.category}</span>
          )}
        </div>
        <div className="card" style={{ marginBottom: 0, opacity: 0.7 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--neu-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Next ({hour + 1}:00)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {routinesNext && routinesNext.length > 0
              ? routinesNext.map(r => r.label).join(', ')
              : nextBlock.task_title || 'Free time'}
          </div>
        </div>
      </div>

      {/* ── Mood ── */}
      <div className="card animate-in delay-2" style={{ maxWidth: 500, margin: '0 auto 24px', textAlign: 'center' }}>
        <div className="card-header">How's your energy?</div>
        <div className="mood-selector">
          {[1,2,3,4,5].map(i => (
            <button key={i} className={`mood-btn${mood === i ? ' selected' : ''}`}
              onClick={() => saveMood(i)}>{emojis[i]}</button>
          ))}
        </div>
      </div>

      {/* ── Study Sessions Today ── */}
      {sessions.length > 0 && (
        <div className="card animate-in delay-3" style={{ maxWidth: 700, margin: '0 auto 24px' }}>
          <div className="card-header">📚 Study Sessions Today</div>
          <div className="flex flex-col gap-sm">
            {sessions.map(s => (
              <div className="inner-card flex justify-between items-center" key={s.id}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{s.topic || s.track}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--neu-text-secondary)' }}>{s.start_time} – {s.end_time}</div>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="pill pill-routine">{s.track}</span>
                  <span style={{ fontWeight: 700, color: 'var(--neu-accent)' }}>{s.hours}h</span>
                </div>
              </div>
            ))}
          </div>
          {Object.keys(trackBreakdown).length > 0 && (
            <div className="flex gap-md items-center" style={{ marginTop: 16, flexWrap: 'wrap' }}>
              {Object.entries(trackBreakdown).map(([track, hrs]) => (
                <div key={track} className="badge" style={{ fontSize: '.75rem' }}>
                  {track}: {hrs.toFixed(1)}h
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Track Dashboard ── */}
      <div className="animate-in" style={{ maxWidth: 780, margin: '0 auto 24px', animationDelay: '.35s', opacity: 0 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--neu-text-primary)' }}>📋 Overall Prep Progress</div>
          <div style={{ fontSize: '.72rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>{totalDone}/{totalTasks} total ({overallPct}%)</div>
        </div>
        <div className="prep-dashboard">
          {trackOrder.map(t => {
            const meta = trackMeta[t]
            const st = stats[t]
            const tpct = st.total ? Math.round(st.done / st.total * 100) : 0
            return (
              <Link to="/prep" className="prep-dash-card" key={t} style={{ textDecoration: 'none' }}>
                <div className="prep-dash-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
                <div className="prep-dash-name" style={{ color: meta.color }}>{meta.label}</div>
                <div className="prep-dash-stat">{st.done}/{st.total} tasks</div>
                <div className="prep-dash-pct" style={{ color: meta.color }}>{tpct}%</div>
                <div className="prep-dash-bar">
                  <div className="prep-dash-fill" style={{ width: `${tpct}%`, background: meta.color }}></div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Today's Prep Tasks ── */}
      {todayPrepTasks.length > 0 && (
        <div className="card animate-in" style={{ maxWidth: 600, margin: '0 auto 24px', animationDelay: '.4s', opacity: 0 }}>
          <div className="card-header">📋 Today's Prep Tasks ({prepDone}/{prepTotal})</div>
          <div className="prep-progress-track" style={{ marginBottom: 16 }}>
            <div className="prep-progress-fill" style={{ width: `${prepPct}%` }}></div>
          </div>
          <div className="sidebar-tasks">
            {todayPrepTasks.map((t, idx) => {
              const tId = getTaskId(weekNum, effectiveDayNum, t.track, idx)
              const isDone = !!checks[tId]
              return (
                <div className="task-item" key={idx} style={{ opacity: isDone ? 0.5 : 1, cursor: 'pointer' }} onClick={() => toggleCheck(tId)}>
                  <div style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isDone ? '✅' : '⬜'}</div>
                  <div>
                    <div className="task-text" style={{ textDecoration: isDone ? 'line-through' : 'none' }}><strong>{t.track}</strong>: {t.text}</div>
                    {t.sub && <div className="task-sub">{t.sub}</div>}
                  </div>
                  {t.time && <span className="pill pill-routine">{t.time}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick Info ── */}
      <div className="card-grid animate-in" style={{ maxWidth: 600, margin: '0 auto 24px', animationDelay: '.45s', opacity: 0 }}>
        <div className="stat-card">
          <div className="stat-value">{emptyHoursLeft}</div>
          <div className="stat-label">Empty Hours Left</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Study Sessions</div>
        </div>
      </div>

      <div className="text-center animate-in" style={{ marginTop: 32, animationDelay: '.5s', opacity: 0, paddingBottom: 40 }}>
        <Link to="/planner" className="start-btn" style={{ display: 'inline-block', marginBottom: 16 }}>📅 Open Planner</Link>
        <br/>
        <Link to="/study" className="btn btn-secondary" style={{ fontSize: '.85rem' }}>📚 Log Study Session</Link>
      </div>
    </>
  )
}
