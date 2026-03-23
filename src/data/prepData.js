/* Shared prep plan data + track metadata */

export const trackMeta = {
  dsa:  { label: 'DSA · Coding',   cls: 'prep-track-dsa',  color: '#2979FF', bg: 'rgba(41,121,255,0.1)',  time: '2 hrs',   icon: '💻' },
  gen:  { label: 'Gen AI',         cls: 'prep-track-gen',  color: '#2979FF', bg: 'rgba(41,121,255,0.08)', time: '2.5 hrs', icon: '🤖' },
  sys:  { label: 'System Design',  cls: 'prep-track-sys',  color: '#2979FF', bg: 'rgba(41,121,255,0.06)', time: '1.5 hrs', icon: '🏗️' },
  ds:   { label: 'DS Revision',    cls: 'prep-track-ds',   color: '#2979FF', bg: 'rgba(41,121,255,0.05)', time: '30 min',  icon: '📊' },
  food: { label: 'Food Prep',      cls: 'prep-track-food', color: '#8896a4', bg: 'rgba(163,177,198,0.12)', time: 'daily',   icon: '🍳' },
  gym:  { label: 'Gym',            cls: 'prep-track-gym',  color: '#8896a4', bg: 'rgba(163,177,198,0.12)', time: 'daily',   icon: '💪' },
}

export const trackOrder = ['dsa', 'gen', 'sys', 'ds', 'food', 'gym']

export const DAILY_LIFE = [
  { track: 'food', text: 'Meal prep / cook', sub: 'Breakfast, lunch, dinner — plan ahead', time: '45m' },
  { track: 'food', text: 'Hydration + snacks', sub: 'Track water intake, prepare healthy snacks', time: '10m' },
  { track: 'gym', text: 'Workout session', sub: 'Gym, run, or home workout', time: '60m' },
  { track: 'gym', text: 'Stretch + cooldown', sub: '10 min post-workout or evening stretch', time: '10m' },
]

export const STORAGE_KEY = 'prep_plan_checks_v1'

export function loadChecks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export function taskId(w, d, track, i) {
  return `w${w}_d${d}_${track}_${i}`
}

export function getTrackStats(plan, checks) {
  const mergedPlan = plan.map(w => ({
    ...w,
    days: w.days.map(d => ({ ...d, tasks: [...d.tasks, ...DAILY_LIFE] }))
  }))

  let totalTasks = 0, totalDone = 0
  const stats = {}
  trackOrder.forEach(t => { stats[t] = { total: 0, done: 0 } })

  mergedPlan.forEach(w => w.days.forEach(d => d.tasks.forEach((t, i) => {
    totalTasks++
    if (stats[t.track]) stats[t.track].total++
    if (checks[taskId(w.week, d.day, t.track, i)]) {
      totalDone++
      if (stats[t.track]) stats[t.track].done++
    }
  })))

  return { stats, totalTasks, totalDone, mergedPlan }
}
