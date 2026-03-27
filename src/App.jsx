import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { getLocalDate } from './utils/dateUtils'
import MindsetBuddy from './components/MindsetBuddy'

const tabs = [
  { to: '/',        icon: '🌅', label: 'Briefing' },
  { to: '/today',   icon: '📌', label: 'Today' },
  { to: '/planner', icon: '📅', label: 'Planner' },
  { to: '/week',    icon: '📆', label: 'Week' },
  { to: '/routine', icon: '🔄', label: 'Routine' },
  { to: '/study',   icon: '📚', label: 'Study' },
  { to: '/prep',    icon: '🎯', label: 'Prep' },
  { to: '/history', icon: '🗓️', label: 'History' },
  { to: '/notes',   icon: '📝', label: 'Notes' },
  { to: '/stats',   icon: '📊', label: 'Stats' },
  { to: '/dsa',     icon: '🗂️', label: 'DSA' },
  { to: '/python',  icon: '🐍', label: 'Python' },
  { to: '/genai',   icon: '🤖', label: 'Gen AI' },
  { to: '/systemdesign', icon: '🏗️', label: 'Sys Design' },
  { to: '/blogs',    icon: '📚', label: 'Blogs' },
  { to: '/practice', icon: '🎙️', label: 'Practice' },
]

export default function App() {
  const today = getLocalDate()

  // FEATURE: Dark Mode Toggle
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dp_dark_mode') === '1')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('dp_dark_mode', darkMode ? '1' : '0')
  }, [darkMode])

  // FEATURE: Focus Mode — 2026-03-19
  const [focusMode, setFocusMode] = useState(false)
  const [focusData, setFocusData] = useState(null)

  useEffect(() => {
    if (!focusMode) return
    const fetchFocus = () => fetch(`/api/planner/${today}`).then(r => r.json()).then(setFocusData)
    fetchFocus()
    const intv = setInterval(fetchFocus, 60000)
    return () => clearInterval(intv)
  }, [focusMode, today])

  // FEATURE: Keyboard Quick Add Modal — 2026-03-19
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickForm, setQuickForm] = useState({ hour: new Date().getHours(), task_title: '', category: 'general' })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQuickAdd(false)
        setFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const submitQuickAdd = async (e) => {
    e.preventDefault()
    await fetch('/api/save_block', {
       method: 'POST', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ date: today, is_done: 0, ...quickForm })
    })
    setShowQuickAdd(false)
  }

  return (
    <>
      <nav className="navbar" id="main-nav">
        <div className="nav-brand">
          <span className="nav-logo">📋</span>
          <span className="nav-title">Day Planner</span>
        </div>
        <div className="nav-links">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{t.icon}</span> {t.label}
            </NavLink>
          ))}
        </div>
        <div className="flex gap-sm items-center">
          <button className="btn btn-primary btn-sm" onClick={() => setFocusMode(true)}>🎯 Focus</button>
          <button
            className="btn-icon"
            style={{ width: 36, height: 36, minWidth: 36, fontSize: '1rem' }}
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >{darkMode ? '☀️' : '🌙'}</button>
          <div className="nav-date" style={{ marginLeft: 8 }}>{today}</div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>

      {/* FEATURE: Focus Mode — 2026-03-19 */}
      {focusMode && (
        <div className="focus-overlay animate-in">
          <button className="btn btn-secondary" style={{ position: 'absolute', top: 32, right: 32 }} onClick={() => setFocusMode(false)}>Exit Focus (ESC)</button>
          
          {focusData ? (
            <div className="focus-content">
              <h1 style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--neu-accent)' }}>Stay Focused.</h1>
              
              <div className="focus-card active">
                <div className="focus-card-header">Current Hour ({focusData.current_hour}:00)</div>
                <div className="focus-card-body">
                  {focusData.blocks[String(focusData.current_hour)]?.task_title || 'Free time / No task scheduled'}
                </div>
              </div>

              <div className="focus-card next">
                <div className="focus-card-header">Next Up ({(focusData.current_hour + 1) % 24}:00)</div>
                <div className="focus-card-body">
                  {focusData.blocks[String(focusData.current_hour + 1)]?.task_title || 'Free time / No task scheduled'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ marginTop: '20vh' }}>Loading focus data...</div>
          )}
        </div>
      )}

      {/* FEATURE: Keyboard Quick Add Modal — 2026-03-19 */}
      {/* FEATURE: Mindset Buddy */}
      <MindsetBuddy />

      {showQuickAdd && (
        <div className="modal-backdrop" onClick={() => setShowQuickAdd(false)}>
          <div className="card modal-content animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="card-header">⚡ Quick Add Task</div>
            <form onSubmit={submitQuickAdd} className="study-form">
              <div>
                <label>Hour</label>
                <select value={quickForm.hour} autoFocus onChange={e => setQuickForm({ ...quickForm, hour: parseInt(e.target.value) })}>
                  {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Task</label>
                <input type="text" value={quickForm.task_title} required placeholder="What do you need to do?" onChange={e => setQuickForm({ ...quickForm, task_title: e.target.value })} />
              </div>
              <div>
                <label>Category</label>
                <select value={quickForm.category} onChange={e => setQuickForm({ ...quickForm, category: e.target.value })}>
                  {['general', 'study', 'work', 'health', 'personal'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-sm" style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
