import { useState, useEffect, useRef } from 'react'
import { getLocalDate } from '../utils/dateUtils'

const HOUR_HEIGHT = 64
const START_HOUR = 6
const END_HOUR = 23
const TOTAL_HOURS = END_HOUR - START_HOUR + 1
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const CAT_COLORS = {
  general:  { bg: 'rgba(41,121,255,0.12)', border: '#2979FF', text: '#2979FF' },
  study:    { bg: 'rgba(41,121,255,0.15)', border: '#2979FF', text: '#1a6aef' },
  work:     { bg: 'rgba(251,191,36,0.15)', border: '#d69e2e', text: '#b7791f' },
  health:   { bg: 'rgba(52,211,153,0.15)', border: '#38a169', text: '#276749' },
  personal: { bg: 'rgba(251,113,133,0.12)', border: '#e53e3e', text: '#c53030' },
}

const ROUTINE_COLORS = {
  coral:  { bg: 'rgba(251,113,133,0.15)', border: '#e53e3e', text: '#c53030' },
  amber:  { bg: 'rgba(251,191,36,0.15)', border: '#d69e2e', text: '#b7791f' },
  green:  { bg: 'rgba(52,211,153,0.15)', border: '#38a169', text: '#276749' },
  gray:   { bg: 'rgba(163,177,198,0.15)', border: '#8896a4', text: '#4a5568' },
}

function getMonday(d) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(dt.setDate(diff))
}

function dateStr(d) {
  return getLocalDate(d)
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export default function WeekView() {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const todayStr = dateStr(todayDate)

  const [weekStart, setWeekStart] = useState(() => getMonday(todayDate))
  const [weekData, setWeekData] = useState({})
  const [miniDate, setMiniDate] = useState(new Date(todayDate))
  const scrollRef = useRef(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    const fetchAll = async () => {
      const data = {}
      await Promise.all(
        weekDays.map(async (d) => {
          const ds = dateStr(d)
          const res = await fetch(`/api/planner/${ds}`)
          data[ds] = await res.json()
        })
      )
      setWeekData(data)
    }
    fetchAll()
  }, [weekStart])

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date().getHours()
      const offset = Math.max(0, (now - START_HOUR - 1)) * HOUR_HEIGHT
      scrollRef.current.scrollTop = offset
    }
  }, [])

  const goToday = () => {
    setWeekStart(getMonday(todayDate))
    setMiniDate(new Date(todayDate))
  }
  const goPrev = () => setWeekStart(prev => addDays(prev, -7))
  const goNext = () => setWeekStart(prev => addDays(prev, 7))

  // Mini calendar
  const miniMonth = miniDate.getMonth()
  const miniYear = miniDate.getFullYear()
  const firstOfMonth = new Date(miniYear, miniMonth, 1)
  const startDay = firstOfMonth.getDay()
  const daysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate()
  const miniCells = []
  for (let i = 0; i < startDay; i++) miniCells.push(null)
  for (let i = 1; i <= daysInMonth; i++) miniCells.push(i)

  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const nowLineTop = (currentHour - START_HOUR) * HOUR_HEIGHT + (currentMinute / 60) * HOUR_HEIGHT

  // Build event blocks for a day
  const getEvents = (dayStr) => {
    const dayData = weekData[dayStr]
    if (!dayData) return []
    const events = []

    // Task blocks
    const blocks = dayData.blocks || {}
    Object.entries(blocks).forEach(([hourStr, block]) => {
      if (!block.task_title) return
      const h = parseInt(hourStr)
      if (h < START_HOUR || h > END_HOUR) return
      const colors = CAT_COLORS[block.category] || CAT_COLORS.general
      events.push({
        top: (h - START_HOUR) * HOUR_HEIGHT,
        height: HOUR_HEIGHT - 2,
        title: block.task_title,
        sub: `${h > 12 ? h - 12 : h || 12}${h < 12 ? 'AM' : 'PM'}`,
        done: block.is_done,
        ...colors,
        type: 'task',
      })
    })

    // Routines
    const routines = dayData.routines || {}
    Object.entries(routines).forEach(([hourStr, rArr]) => {
      rArr.forEach((r) => {
        const [hStr, mStr] = r.start_time.split(':')
        const h = parseInt(hStr)
        const m = parseInt(mStr || '0')
        if (h < START_HOUR || h > END_HOUR) return
        const durationHours = r.duration_mins / 60
        const blockHeight = Math.max(durationHours * HOUR_HEIGHT, 28)
        const colors = ROUTINE_COLORS[r.color] || ROUTINE_COLORS.gray
        events.push({
          top: (h - START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT,
          height: blockHeight - 2,
          title: r.label,
          sub: `${r.start_time} · ${r.duration_mins}m`,
          done: false,
          ...colors,
          type: 'routine',
        })
      })
    })

    return events
  }

  const weekEndDate = addDays(weekStart, 6)
  const headerMonth = weekStart.getMonth() === weekEndDate.getMonth()
    ? MONTH_NAMES[weekStart.getMonth()]
    : `${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} – ${MONTH_NAMES[weekEndDate.getMonth()].slice(0, 3)}`

  return (
    <div className="week-view">
      {/* ── Sidebar ── */}
      <div className="wv-sidebar">
        {/* Mini Calendar */}
        <div className="wv-mini-cal">
          <div className="wv-mini-header">
            <button className="wv-mini-nav" onClick={() => setMiniDate(new Date(miniYear, miniMonth - 1, 1))}>‹</button>
            <span className="wv-mini-title">{MONTH_NAMES[miniMonth].slice(0, 3)} {miniYear}</span>
            <button className="wv-mini-nav" onClick={() => setMiniDate(new Date(miniYear, miniMonth + 1, 1))}>›</button>
          </div>
          <div className="wv-mini-grid">
            {DAY_NAMES.map(d => <div className="wv-mini-day-label" key={d}>{d[0]}</div>)}
            {miniCells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const cellDate = new Date(miniYear, miniMonth, day)
              const cellStr = dateStr(cellDate)
              const isToday = cellStr === todayStr
              const isInWeek = cellDate >= weekStart && cellDate <= weekEndDate
              return (
                <div
                  key={i}
                  className={`wv-mini-cell${isToday ? ' today' : ''}${isInWeek ? ' in-week' : ''}`}
                  onClick={() => {
                    setWeekStart(getMonday(cellDate))
                    setMiniDate(cellDate)
                  }}
                >{day}</div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="wv-legend">
          <div className="wv-legend-title">Categories</div>
          {Object.entries(CAT_COLORS).map(([cat, c]) => (
            <div className="wv-legend-item" key={cat}>
              <span className="wv-legend-dot" style={{ background: c.border }}></span>
              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
            </div>
          ))}
          <div className="wv-legend-title" style={{ marginTop: 12 }}>Routines</div>
          {Object.entries(ROUTINE_COLORS).map(([cat, c]) => (
            <div className="wv-legend-item" key={cat}>
              <span className="wv-legend-dot" style={{ background: c.border }}></span>
              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="wv-main">
        {/* Top bar */}
        <div className="wv-topbar">
          <div className="wv-topbar-left">
            <h2 className="wv-month-label">{headerMonth} {weekStart.getFullYear()}</h2>
          </div>
          <div className="wv-topbar-right">
            <button className="btn btn-secondary btn-sm" onClick={goPrev}>‹</button>
            <button className="btn btn-primary btn-sm" onClick={goToday}>Today</button>
            <button className="btn btn-secondary btn-sm" onClick={goNext}>›</button>
          </div>
        </div>

        {/* Day headers */}
        <div className="wv-day-headers">
          <div className="wv-time-gutter-header"></div>
          {weekDays.map((d, i) => {
            const ds = dateStr(d)
            const isToday = ds === todayStr
            return (
              <div className={`wv-day-header${isToday ? ' today' : ''}`} key={i}>
                <span className="wv-day-name">{DAY_NAMES[d.getDay()]}</span>
                <span className={`wv-day-num${isToday ? ' today' : ''}`}>{d.getDate()}</span>
              </div>
            )
          })}
        </div>

        {/* Scrollable grid */}
        <div className="wv-scroll" ref={scrollRef}>
          <div className="wv-grid" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
            {/* Time gutter */}
            <div className="wv-time-gutter">
              {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                const h = i + START_HOUR
                const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
                return (
                  <div className="wv-time-label" key={h} style={{ top: i * HOUR_HEIGHT }}>
                    {label}
                  </div>
                )
              })}
            </div>

            {/* Day columns */}
            {weekDays.map((d, colIdx) => {
              const ds = dateStr(d)
              const isToday = ds === todayStr
              const events = getEvents(ds)

              return (
                <div className={`wv-day-col${isToday ? ' today' : ''}`} key={colIdx}>
                  {/* Hour lines */}
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div className="wv-hour-line" key={i} style={{ top: i * HOUR_HEIGHT }} />
                  ))}

                  {/* Now indicator */}
                  {isToday && currentHour >= START_HOUR && currentHour <= END_HOUR && (
                    <div className="wv-now-line" style={{ top: nowLineTop }}>
                      <div className="wv-now-dot" />
                    </div>
                  )}

                  {/* Events */}
                  {events.map((ev, j) => (
                    <div
                      className={`wv-event${ev.done ? ' done' : ''}`}
                      key={j}
                      style={{
                        top: ev.top,
                        height: ev.height,
                        background: ev.bg,
                        borderLeft: `3px solid ${ev.border}`,
                      }}
                    >
                      <div className="wv-event-title" style={{ color: ev.text }}>
                        {ev.done && '✓ '}{ev.title}
                      </div>
                      <div className="wv-event-time">{ev.sub}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
