import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { trackMeta, trackOrder, loadChecks, getTrackStats } from '../data/prepData'
import { PLAN } from './PrepPlan'
import { STEPS, loadProgress as loadDSAProgress, problemId, getTotalProblems, getDailyStats } from '../data/dsaData'
import { getLocalDate } from '../utils/dateUtils'

const emojis = ['', '😴', '😐', '🙂', '😊', '🔥']

export default function Briefing() {
  const [data, setData] = useState(null)
  const [mood, setMood] = useState(0)
  const [checks] = useState(loadChecks)
  const [studySessions, setStudySessions] = useState([])

  // FEATURE: Push-Day Button — 2026-03-19
  const [offset, setOffset] = useState(parseInt(localStorage.getItem('dp_prep_offset') || '0', 10))

  // FEATURE: AI Plan Generator — 2026-03-19
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/briefing').then(r => r.json()).then(d => {
      setData(d)
      if (d.mood) setMood(d.mood.energy_level)
      // Fetch today's study sessions
      fetch(`/api/study_sessions/${d.today}`).then(r => r.json()).then(setStudySessions).catch(() => {})
    })
  }, [])

  const saveMood = (level) => {
    setMood(level)
    fetch('/api/save_mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: data.today, energy_level: level })
    })
  }

  if (!data) return <div className="text-center mt-lg" style={{ color: 'var(--neu-text-secondary)' }}>Loading...</div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'
  const pct = data.yd_total > 0 ? Math.round(data.yd_done / data.yd_total * 100) : 0

  // Compute effective day based on Push-Day offset
  const effectiveDayNum = data ? Math.max(1, data.day_num - offset) : 1
  let todayTasks = []
  for (const w of PLAN) {
    const d = w.days.find(day => day.day === effectiveDayNum)
    if (d) { todayTasks = d.tasks; break }
  }

  // FEATURE: AI Plan Generator — 2026-03-19
  const generatePlan = async () => {
    if (!mood) { alert("Please select your energy level first!"); return }
    const planRes = await fetch(`/api/planner/${data.today}`)
    const planData = await planRes.json()

    let availableHours = []
    const currentHour = new Date().getHours()
    const hours = Array.from({ length: 18 }, (_, i) => i + 6)
    for (let h of hours) {
      if (h >= currentHour) {
        const block = planData.blocks[String(h)] || {}
        const routinesArr = planData.routines[String(h)]
        if (!block.task_title && (!routinesArr || routinesArr.length === 0)) {
          availableHours.push(h)
        }
      }
    }

    let tasksToSchedule = [...todayTasks]
    if (mood <= 2) tasksToSchedule = tasksToSchedule.slice(0, 2) // low energy: max 2 tasks

    let updates = []
    for (let i = 0; i < Math.min(tasksToSchedule.length, availableHours.length); i++) {
        const h = availableHours[i]
        const task = tasksToSchedule[i]
        updates.push(fetch('/api/save_block', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: data.today, hour: h,
                task_title: `[${task.track.toUpperCase()}] ${task.text}`,
                category: 'study',
                is_done: 0
            })
        }))
    }
    await Promise.all(updates)
    setToast('✨ Plan generated successfully!')
    setTimeout(() => setToast(''), 3000)
  }

  // FEATURE: Push-Day Button — 2026-03-19
  const handlePushDay = () => {
    if (confirm("This will shift all remaining Prep tasks by 1 day. Continue?")) {
      const newOffset = offset + 1
      localStorage.setItem('dp_prep_offset', newOffset)
      setOffset(newOffset)
    }
  }

  const { stats, totalTasks, totalDone } = getTrackStats(PLAN, checks)
  const overallPct = totalTasks > 0 ? Math.round(totalDone / totalTasks * 100) : 0

  return (
    <>
      {toast && <div style={{ position:'fixed', top: 20, right: 20, background: '#2979FF', color: '#fff', padding: '12px 24px', borderRadius: 999, fontWeight: 600, zIndex: 9999, boxShadow: '5px 5px 12px rgba(41,121,255,0.35)' }}>{toast}</div>}
      
      <div className="briefing-hero animate-in">
        <h1>Good {greeting}! {greetEmoji}</h1>
        <div className="day-badge">📅 {data.today} — Day {effectiveDayNum}</div>
        <p className="sub-text">Let's make today count.</p>
      </div>

      {/* ── Track Dashboard ── */}
      <div className="animate-in delay-1" style={{ maxWidth: 780, margin: '0 auto 24px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--neu-text-primary)' }}>📋 Prep Progress</div>
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

      {/* ── DSA Progress ── */}
      {(() => {
        const dsaProgress = loadDSAProgress()
        const totalDSA = getTotalProblems()
        let dsaSolved = 0, dsaAttempted = 0
        STEPS.forEach((step, si) => step.topics.forEach((topic, ti) =>
          topic.problems.forEach((_, pi) => {
            const s = Number(dsaProgress[problemId(si, ti, pi)]) || 0
            if (s === 2) dsaSolved++
            else if (s === 1) dsaAttempted++
          })
        ))
        const dsaPct = totalDSA ? Math.round(dsaSolved / totalDSA * 100) : 0
        const daysLeft = Math.ceil((totalDSA - dsaSolved) / 10)

        return (
          <div className="animate-in delay-1" style={{ maxWidth: 780, margin: '0 auto 24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--neu-text-primary)' }}>🗂️ DSA Sheet Progress</div>
              <div style={{ fontSize: '.72rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>
                {dsaSolved}/{totalDSA} solved ({dsaPct}%) · ~{daysLeft} days left
              </div>
            </div>
            <Link to="/dsa" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'var(--neu-bg)', borderRadius: 16, padding: '14px 18px',
                boxShadow: '4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ display: 'flex', gap: 20, fontSize: '.78rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#22c55e' }}>✓ {dsaSolved} solved</span>
                  <span style={{ color: '#f59e0b' }}>~ {dsaAttempted} attempted</span>
                  <span style={{ color: '#94a3b8' }}>○ {totalDSA - dsaSolved - dsaAttempted} todo</span>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{
                  flex: 1, maxWidth: 200, height: 6, background: 'var(--neu-bg)', borderRadius: 999, overflow: 'hidden',
                  boxShadow: 'inset 2px 2px 3px var(--neu-shadow-dark), inset -2px -2px 3px var(--neu-shadow-light)',
                }}>
                  <div style={{ width: `${dsaPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', borderRadius: 999, transition: 'width .3s' }} />
                </div>
                <span style={{ fontSize: '.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{dsaPct}%</span>
              </div>
            </Link>
          </div>
        )
      })()}

      {/* ── Today's Learning ── */}
      {(() => {
        const todayDate = data?.today || getLocalDate()
        const dsaToday = getDailyStats(todayDate)
        const totalStudyHours = studySessions.reduce((s, x) => s + (x.hours || 0), 0)
        const hasActivity = dsaToday.count > 0 || studySessions.length > 0

        if (!hasActivity) return null

        return (
          <div className="animate-in delay-2" style={{ maxWidth: 780, margin: '0 auto 24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--neu-text-primary)' }}>📖 Today's Learning</div>
              <div style={{ fontSize: '.72rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>
                {dsaToday.count} problems · {totalStudyHours.toFixed(1)}h studied
              </div>
            </div>

            <div style={{
              background: 'var(--neu-bg)', borderRadius: 16, padding: '18px 20px',
              boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            }}>

              {/* DSA Problems Solved Today */}
              {dsaToday.count > 0 && (
                <div style={{ marginBottom: studySessions.length > 0 ? 16 : 0 }}>
                  <div style={{
                    fontSize: '.7rem', fontWeight: 700, color: '#22c55e',
                    textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '.05em',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    DSA Problems Solved — {dsaToday.count}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {dsaToday.problems.map((title, i) => (
                      <span key={i} style={{
                        background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                        padding: '4px 10px', borderRadius: 999,
                        fontSize: '.68rem', fontWeight: 600, fontFamily: 'monospace',
                      }}>
                        ✓ {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Sessions */}
              {studySessions.length > 0 && (
                <div>
                  {dsaToday.count > 0 && (
                    <div style={{ borderTop: '1px solid rgba(163,177,198,0.15)', marginBottom: 12 }} />
                  )}
                  <div style={{
                    fontSize: '.7rem', fontWeight: 700, color: 'var(--neu-accent)',
                    textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '.05em',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--neu-accent)' }} />
                    Study Sessions — {studySessions.length}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {studySessions.map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'var(--neu-bg)', borderRadius: 10, padding: '8px 12px',
                        boxShadow: 'inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)',
                      }}>
                        <span style={{
                          background: 'var(--neu-accent-soft)', color: 'var(--neu-accent)',
                          padding: '2px 8px', borderRadius: 999,
                          fontSize: '.62rem', fontWeight: 700, fontFamily: 'monospace',
                          textTransform: 'uppercase',
                        }}>{s.track}</span>
                        <span style={{ fontSize: '.78rem', color: 'var(--neu-text-primary)', flex: 1 }}>
                          {s.topic || 'General study'}
                        </span>
                        <span style={{ fontSize: '.72rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>
                          {s.hours}h · {s.start_time}–{s.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      <div className="card-grid animate-in delay-2" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="stat-card">
          <div className="stat-value">{data.yd_done}/{data.yd_total}</div>
          <div className="stat-label">Tasks Done Yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pct}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      <div className="card animate-in delay-3" style={{ maxWidth: 500, margin: '24px auto', textAlign: 'center' }}>
        <div className="card-header">How's your energy today?</div>
        <div className="mood-selector">
          {[1,2,3,4,5].map(i => (
            <button key={i} className={`mood-btn${mood === i ? ' selected' : ''}`}
              onClick={() => saveMood(i)}>{emojis[i]}</button>
          ))}
        </div>
        {mood > 0 && (
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={generatePlan} style={{ width: '100%' }}>✨ Generate my plan</button>
            <p style={{ fontSize: '.75rem', color: 'var(--neu-text-secondary)', marginTop: 8 }}>Auto-fills empty planner slots around your routines.</p>
          </div>
        )}
      </div>

      {todayTasks.length > 0 && (
        <div className="card animate-in" style={{ maxWidth: 600, margin: '24px auto', animationDelay: '.4s', opacity: 0 }}>
          <div className="card-header">📋 Today's Prep Tasks</div>
          <div className="sidebar-tasks">
            {todayTasks.map((t, idx) => (
              <div className="task-item" key={idx}>
                <div>
                  <div className="task-text"><strong>{t.track}</strong>: {t.text}</div>
                  {t.sub && <div className="task-sub">{t.sub}</div>}
                </div>
                {t.time && <span className="pill pill-routine">{t.time}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center animate-in" style={{ marginTop: 32, animationDelay: '.5s', opacity: 0, paddingBottom: 40 }}>
        <Link to="/planner" className="start-btn" style={{ display: 'inline-block', marginBottom: 16 }}>🚀 Start My Day</Link>
        <br/>
        <button className="btn btn-secondary" onClick={handlePushDay} style={{ fontSize: '.8rem', opacity: 0.8 }}>😓 Not feeling it — push to tomorrow</button>
      </div>
    </>
  )
}
