import { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

// FEATURE: Link Session to Prep Task — 2026-03-19
import { PLAN } from './PrepPlan'
import { loadChecks, STORAGE_KEY, taskId as getTaskId } from '../data/prepData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const trackColors = { DSA: '#2979FF', GenAI: 'rgba(41,121,255,0.7)', SysDesign: 'rgba(41,121,255,0.5)', DS: 'rgba(41,121,255,0.35)', LeetCode: 'rgba(41,121,255,0.85)', Other: '#8896a4' }
const tracks = ['DSA', 'GenAI', 'SysDesign', 'DS', 'LeetCode', 'Other']

export default function Study() {
  const today = new Date().toISOString().split('T')[0]
  const [sessions, setSessions] = useState([])
  const [weeklyData, setWeeklyData] = useState({})
  const [stats, setStats] = useState(null)
  
  // FEATURE: Link Session to Prep Task — 2026-03-19
  const [form, setForm] = useState({ start_time: '09:00', end_time: '10:00', track: 'DSA', topic: '', linked_task: '' })
  
  // FEATURE: Live Timer / Pomodoro Mode — 2026-03-19
  const [timerState, setTimerState] = useState('idle')
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const timerInterval = useRef(null)

  const [todayTasks, setTodayTasks] = useState([])

  const load = () => {
    fetch(`/api/study_sessions/${today}`).then(r => r.json()).then(setSessions)
    fetch('/api/study_weekly').then(r => r.json()).then(setWeeklyData)
    fetch('/api/stats').then(r => r.json()).then(setStats)

    // Load unfinished prep tasks
    fetch('/api/briefing').then(r => r.json()).then(data => {
      const offset = parseInt(localStorage.getItem('dp_prep_offset') || '0', 10)
      const effectiveDayNum = Math.max(1, data.day_num - offset)
      let tks = [], weekN = 1
      for (const w of PLAN) {
        const d = w.days.find(day => day.day === effectiveDayNum)
        if (d) { tks = d.tasks; weekN = w.week; break }
      }
      const checks = loadChecks()
      const moves = JSON.parse(localStorage.getItem('dp_prep_moves_v1') || '{}')
      const formatted = tks.map((t, i) => {
        const tId = getTaskId(weekN, effectiveDayNum, t.track, i)
        return { ...t, tId, isDone: !!checks[tId], isSkipped: moves[tId]?.status === 'skipped', isMovedOut: !!moves[tId]?.target_day }
      }).filter(t => !t.isDone && !t.isSkipped && !t.isMovedOut)
      setTodayTasks(formatted)
    })
  }
  useEffect(load, [today])

  // Timer controls
  const startTimer = (mode) => {
    const now = new Date()
    const hm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setForm(prev => ({ ...prev, start_time: hm, end_time: hm }))
    setTimerState(mode)
    if (mode === 'pomodoro') setTimerSeconds(25 * 60)
    else setTimerSeconds(0)
    
    if (timerInterval.current) clearInterval(timerInterval.current)
    timerInterval.current = setInterval(() => {
      setTimerSeconds(s => mode === 'pomodoro' ? Math.max(0, s - 1) : s + 1)
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerInterval.current)
    const now = new Date()
    const hm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setForm(prev => ({ ...prev, end_time: hm }))
    setTimerState('idle')
  }

  const calcHours = () => {
    const [sh, sm] = form.start_time.split(':').map(Number)
    const [eh, em] = form.end_time.split(':').map(Number)
    let hrs = (eh * 60 + em - sh * 60 - sm) / 60
    if (hrs < 0) hrs += 24
    return Math.round(hrs * 10) / 10
  }

  const logSession = async () => {
    const hours = calcHours()
    if (hours <= 0) { alert('End time must be after start time'); return }
    await fetch('/api/log_study', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, ...form, hours })
    })

    if (form.linked_task) {
      const checks = loadChecks()
      checks[form.linked_task] = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checks))
    }

    setForm({ ...form, topic: '', linked_task: '' })
    load()
  }

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return
    await fetch(`/api/delete_study/${id}`, { method: 'DELETE' })
    load()
  }

  // Chart data
  const dates = Object.keys(weeklyData).sort()
  const chartData = {
    labels: dates.map(d => d.slice(5)),
    datasets: tracks.filter(t => dates.some(d => weeklyData[d]?.[t])).map(t => ({
      label: t,
      data: dates.map(d => weeklyData[d]?.[t] || 0),
      backgroundColor: trackColors[t],
      borderRadius: 4,
    }))
  }

  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0')
  const s = (timerSeconds % 60).toString().padStart(2, '0')

  return (
    <>
      <div className="flex justify-between items-center mb-md">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>📚 Study Tracker</h2>
        <div className="streak-badge">🔥 {stats?.streak || 0} day streak</div>
      </div>

      <div className="card mb-md animate-in">
        {timerState === 'idle' ? (
           <div className="flex justify-between items-center rounded mb-md neu-pressed" style={{ padding: '16px', marginBottom: 20 }}>
             <div>
               <h3 style={{ margin:0, fontSize: '1.1rem' }}>⏱️ Live Timer</h3>
               <p style={{ margin: '4px 0 0', fontSize: '.8rem', color: 'var(--neu-text-secondary)' }}>Start a timer to automatically fill log times.</p>
             </div>
             <div className="flex gap-sm">
               <button className="btn btn-secondary" onClick={() => startTimer('running')}>▶ Start Stopwatch</button>
               <button className="btn btn-primary" onClick={() => startTimer('pomodoro')}>🍅 Pomodoro (25m)</button>
             </div>
           </div>
        ) : (
           <div className="text-center neu-pressed-accent" style={{ padding: '30px', borderRadius: 20, marginBottom: 20 }}>
             <div style={{ fontSize: '4.5rem', fontWeight: 800, fontFamily: 'monospace', color: timerState === 'pomodoro' && timerSeconds === 0 ? '#e53e3e' : 'var(--neu-accent)' }}>
               {m}:{s}
             </div>
             <p style={{ color: 'var(--neu-text-secondary)', marginBottom: 24, fontSize: '.9rem' }}>
               {timerState === 'pomodoro' ? 'Pomodoro Session' : 'Stopwatch Session'} started at {form.start_time}
             </p>
             <button className="btn btn-danger" style={{ padding: '14px 32px', fontSize: '1rem' }} onClick={stopTimer}>⏹ Stop & Log Time</button>
           </div>
        )}

        <div className="card-header">📝 Log Study Session</div>
        <div className="study-form">
          <div><label>Start Time</label><input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></div>
          <div><label>End Time</label><input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></div>
          <div><label>Track</label><select value={form.track} onChange={e => setForm({ ...form, track: e.target.value })}>
            {tracks.map(t => <option key={t} value={t}>{t}</option>)}
          </select></div>
          <div><label>Topic</label><input type="text" value={form.topic} placeholder="e.g. Binary Trees" onChange={e => setForm({ ...form, topic: e.target.value })} /></div>
          <div><label>Link / Reference</label><input type="text" value={form.linked_task} placeholder="e.g. topic name, article link, or notes" onChange={e => setForm({ ...form, linked_task: e.target.value })} /></div>
          <div><label>&nbsp;</label><button className="btn btn-primary" onClick={logSession} style={{ width: '100%' }}>Log Session</button></div>
        </div>
        <div style={{ marginTop: 12, fontSize: '.82rem', color: 'var(--neu-text-secondary)' }}>
          Auto-calculated: <strong>{calcHours()}</strong> hours
        </div>
      </div>

      <div className="card mb-md animate-in delay-1">
        <div className="card-header">📋 Today's Sessions — {today}</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Track</th><th>Topic</th><th>Hours</th><th></th></tr></thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--neu-text-secondary)', padding: 24 }}>No sessions logged today. Start studying! 💪</td></tr>
              ) : sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.start_time} – {s.end_time}</td>
                  <td><span className="pill pill-routine">{s.track}</span></td>
                  <td>{s.topic}</td>
                  <td>{s.hours}h</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteSession(s.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="card animate-in delay-2">
            <div className="card-header">📊 Weekly Progress</div>
            {stats && Object.keys(stats.weekly_track).length > 0 ? (
              <div className="flex flex-col gap-sm">
                {Object.entries(stats.weekly_track).map(([track, hrs]) => (
                  <div className="track-card" key={track}>
                    <div className="track-name">{track}</div>
                    <div className="track-hours">{hrs.toFixed(1)} / 14 hrs this week</div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, hrs / 14 * 100)}%` }}></div></div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--neu-text-secondary)', fontSize: '.85rem' }}>No study data this week yet.</p>}
          </div>
        </div>
        <div style={{ flex: 2, minWidth: 400 }}>
          <div className="chart-container animate-in delay-3">
            <div className="card-header">Weekly Study Hours</div>
            {dates.length > 0 ? (
              <Bar data={chartData} options={{
                responsive: true,
                plugins: { legend: { labels: { color: '#8896a4' } } },
                scales: {
                  x: { ticks: { color: '#8896a4' }, grid: { color: 'rgba(163,177,198,0.3)' } },
                  y: { ticks: { color: '#8896a4' }, grid: { color: 'rgba(163,177,198,0.3)' }, beginAtZero: true }
                }
              }} />
            ) : <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>}
          </div>
        </div>
      </div>
    </>
  )
}
