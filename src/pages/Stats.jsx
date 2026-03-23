import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import { getLocalDate } from '../utils/dateUtils'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const trackColors = { DSA: '#2979FF', GenAI: 'rgba(41,121,255,0.7)', SysDesign: 'rgba(41,121,255,0.5)', DS: 'rgba(41,121,255,0.35)', LeetCode: 'rgba(41,121,255,0.85)', Other: '#8896a4' }
const chartScales = {
  x: { ticks: { color: '#8896a4' }, grid: { color: 'rgba(163,177,198,0.3)' } },
  y: { ticks: { color: '#8896a4' }, grid: { color: 'rgba(163,177,198,0.3)' }, beginAtZero: true }
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [leetCount, setLeetCount] = useState('')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  const logLeet = async () => {
    const count = parseInt(leetCount)
    if (!count || count <= 0) { alert('Enter a valid number'); return }
    const today = getLocalDate()
    const now = new Date().toTimeString().slice(0, 5)
    await fetch('/api/log_study', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, start_time: now, end_time: now, track: 'LeetCode', topic: `${count} problems solved`, hours: 0 })
    })
    alert(`Logged ${count} LeetCode problems!`)
    setLeetCount('')
  }

  if (!stats) return <div className="text-center mt-lg" style={{ color: 'var(--neu-text-secondary)' }}>Loading...</div>

  // Chart data
  const trackKeys = Object.keys(stats.track_hours)
  const donutData = {
    labels: trackKeys,
    datasets: [{ data: trackKeys.map(t => stats.track_hours[t]), backgroundColor: trackKeys.map(t => trackColors[t] || '#8896a4'), borderWidth: 0, hoverOffset: 8 }]
  }

  const dailyDates = Object.keys(stats.daily_hours).sort()
  const dailyData = {
    labels: dailyDates.map(d => d.slice(5)),
    datasets: [{
      label: 'Study Hours', data: dailyDates.map(d => stats.daily_hours[d]),
      borderColor: '#2979FF', backgroundColor: 'rgba(41,121,255,0.15)',
      fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#2979FF'
    }]
  }

  const compDates = Object.keys(stats.task_completion).sort()
  const compData = {
    labels: compDates.map(d => d.slice(5)),
    datasets: [{
      label: 'Completion %', data: compDates.map(d => stats.task_completion[d]),
      backgroundColor: compDates.map(d => { const v = stats.task_completion[d]; return v >= 80 ? '#2979FF' : v >= 50 ? 'rgba(41,121,255,0.5)' : 'rgba(163,177,198,0.5)' }),
      borderRadius: 4
    }]
  }

  const moodDates = Object.keys(stats.moods).sort()
  const moodData = {
    labels: moodDates.map(d => d.slice(5)),
    datasets: [{
      label: 'Energy Level', data: moodDates.map(d => stats.moods[d]),
      borderColor: '#2979FF', backgroundColor: 'rgba(41,121,255,0.1)',
      fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#2979FF'
    }]
  }

  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>📊 Stats Dashboard</h2>

      <div className="card-grid animate-in">
        <div className="stat-card"><div className="stat-value">{stats.total_hours}</div><div className="stat-label">Total Study Hours</div></div>
        <div className="stat-card"><div className="stat-value">{stats.days_tracked}</div><div className="stat-label">Days Tracked</div></div>
        <div className="stat-card"><div className="stat-value">{stats.avg_daily}</div><div className="stat-label">Avg Daily Hours</div></div>
        <div className="stat-card"><div className="stat-value">{stats.streak}</div><div className="stat-label">Current Streak 🔥</div></div>
      </div>

      <div className="charts-grid animate-in delay-1">
        <div className="chart-container">
          <div className="card-header">Hours by Track (All Time)</div>
          {trackKeys.length > 0 ? (
            <Doughnut data={donutData} options={{
              responsive: true, cutout: '65%',
              plugins: { legend: { position: 'bottom', labels: { color: '#8896a4', padding: 16 } } }
            }} />
          ) : <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>

        <div className="chart-container">
          <div className="card-header">Daily Study Hours (Last 14 Days)</div>
          {dailyDates.length > 0 ? (
            <Line data={dailyData} options={{ responsive: true, plugins: { legend: { labels: { color: '#8896a4' } } }, scales: chartScales }} />
          ) : <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>

        <div className="chart-container">
          <div className="card-header">Task Completion % by Day</div>
          {compDates.length > 0 ? (
            <Bar data={compData} options={{ responsive: true, plugins: { legend: { labels: { color: '#8896a4' } } }, scales: { ...chartScales, y: { ...chartScales.y, max: 100 } } }} />
          ) : <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>

        <div className="chart-container">
          <div className="card-header">Energy / Mood Trend</div>
          {moodDates.length > 0 ? (
            <Line data={moodData} options={{ responsive: true, plugins: { legend: { labels: { color: '#8896a4' } } }, scales: { ...chartScales, y: { ...chartScales.y, max: 5, min: 1 } } }} />
          ) : <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>
      </div>

      <div className="card mt-lg animate-in delay-2" style={{ maxWidth: 500 }}>
        <div className="card-header">🧩 LeetCode Counter</div>
        <p style={{ fontSize: '.82rem', color: 'var(--neu-text-secondary)', marginBottom: 12 }}>Log problems solved today as a study session.</p>
        <div className="flex gap-sm items-center">
          <input type="number" value={leetCount} placeholder="Problems solved" min="0" style={{ width: 160 }}
            onChange={e => setLeetCount(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={logLeet}>Log</button>
        </div>
      </div>
    </>
  )
}
