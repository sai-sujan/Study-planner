import { useState, useEffect, useCallback } from 'react'
import { PLAN } from './PrepPlan'
import { taskId } from '../data/prepData'
import { getLocalDate } from '../utils/dateUtils'

const categories = ['general', 'study', 'work', 'health', 'personal']

export default function Planner() {
  const today = getLocalDate()
  const [data, setData] = useState(null)

  // FEATURE: Task Carry-Over — 2026-03-19
  const [carryOverTasks, setCarryOverTasks] = useState([])
  const [showCarryOver, setShowCarryOver] = useState(false)

  // FEATURE: Drag-to-Reschedule — 2026-03-19
  const [draggedHour, setDraggedHour] = useState(null)
  const [dragOverHour, setDragOverHour] = useState(null)

  useEffect(() => {
    fetch(`/api/planner/${today}`).then(r => r.json()).then(setData)

    const yDate = new Date()
    yDate.setDate(yDate.getDate() - 1)
    const yesterday = getLocalDate(yDate)
    
    if (!localStorage.getItem(`dp_carryover_dismissed_${today}`)) {
      fetch(`/api/day_data/${yesterday}`).then(r => r.json()).then(yd => {
        const tasks = (yd.blocks || []).filter(b => b.task_title && !b.is_done)
        if (tasks.length > 0) {
          setCarryOverTasks(tasks)
          setShowCarryOver(true)
        }
      })
    }
  }, [today])

  const saveBlock = useCallback((hour, field, value) => {
    if (!data) return
    const block = data.blocks[String(hour)] || {}
    const updated = {
      date: today, hour,
      task_title: field === 'task_title' ? value : (block.task_title || ''),
      category: field === 'category' ? value : (block.category || 'general'),
      is_done: field === 'is_done' ? value : (block.is_done || 0),
    }
    // Optimistic update
    setData(prev => ({
      ...prev,
      blocks: { ...prev.blocks, [String(hour)]: { ...block, ...updated } }
    }))
    fetch('/api/save_block', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
  }, [data, today])

  const saveTask = (taskId, taskText, track, isDone) => {
    fetch('/api/save_task', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, task_id: taskId, task_text: taskText, track, is_done: isDone ? 1 : 0 })
    })
  }

  // FEATURE: Task Carry-Over — 2026-03-19
  const handleCarryOver = async () => {
    if (!data) return
    const currentHour = new Date().getHours()
    
    let availableHours = []
    const hours = Array.from({ length: 18 }, (_, i) => i + 6)
    for (let h of hours) {
      if (h >= currentHour) {
        const block = data.blocks[String(h)] || {}
        const routinesArr = data.routines[String(h)]
        if (!block.task_title && (!routinesArr || routinesArr.length === 0)) {
          availableHours.push(h)
        }
      }
    }

    let updates = []
    for (let i = 0; i < Math.min(carryOverTasks.length, availableHours.length); i++) {
        const h = availableHours[i]
        const oldTask = carryOverTasks[i]
        updates.push(fetch('/api/save_block', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: today, hour: h,
                task_title: oldTask.task_title,
                category: oldTask.category,
                is_done: 0
            })
        }))
    }
    await Promise.all(updates)
    
    setShowCarryOver(false)
    localStorage.setItem(`dp_carryover_dismissed_${today}`, '1')
    fetch(`/api/planner/${today}`).then(r => r.json()).then(setData)
  }

  const dismissCarryOver = () => {
    setShowCarryOver(false)
    localStorage.setItem(`dp_carryover_dismissed_${today}`, '1')
  }

  // FEATURE: Drag-to-Reschedule — 2026-03-19
  const handleDrop = async (e, targetHour) => {
    e.preventDefault()
    setDragOverHour(null)
    if (!draggedHour || draggedHour === targetHour) {
      setDraggedHour(null)
      return
    }

    const sourceBlock = data.blocks[String(draggedHour)] || {}
    const targetBlock = data.blocks[String(targetHour)] || {}

    const newSource = {
      date: today, hour: draggedHour,
      task_title: targetBlock.task_title || '',
      category: targetBlock.category || 'general',
      is_done: targetBlock.is_done || 0
    }
    const newTarget = {
      date: today, hour: targetHour,
      task_title: sourceBlock.task_title || '',
      category: sourceBlock.category || 'general',
      is_done: sourceBlock.is_done || 0
    }

    setData(prev => ({
      ...prev,
      blocks: { 
        ...prev.blocks, 
        [String(draggedHour)]: newSource,
        [String(targetHour)]: newTarget
      }
    }))

    await Promise.all([
      fetch('/api/save_block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSource) }),
      fetch('/api/save_block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTarget) })
    ])
    setDraggedHour(null)
  }

  if (!data) return <div className="text-center mt-lg" style={{ color: 'var(--neu-text-secondary)' }}>Loading...</div>

  // Compute effective day based on Push-Day offset (Feature: Push-Day)
  const offset = parseInt(localStorage.getItem('dp_prep_offset') || '0', 10)
  const effectiveDayNum = data ? Math.max(1, data.day_num - offset) : 1
  let todayTasks = []
  for (const w of PLAN) {
    const d = w.days.find(day => day.day === effectiveDayNum)
    if (d) { todayTasks = d.tasks; break }
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 6)

  return (
    <>
      <div className="flex justify-between items-center mb-md">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>📅 Daily Planner</h2>
        <div className="flex gap-sm items-center">
          <span style={{ fontSize: '.85rem', color: 'var(--neu-text-secondary)' }}>{today}</span>
          <a href={`/api/export_day/${today}`} className="btn btn-secondary btn-sm">📤 Export</a>
        </div>
      </div>

      {showCarryOver && (
        <div className="card mb-md animate-in neu-pressed-accent">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--neu-accent)', marginBottom: 4 }}>Unfinished Tasks</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--neu-text-secondary)' }}>You have {carryOverTasks.length} unfinished tasks from yesterday. Carry them over?</p>
            </div>
            <div className="flex gap-sm">
              <button className="btn btn-primary" onClick={handleCarryOver}>Carry over</button>
              <button className="btn btn-secondary" onClick={dismissCarryOver}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div className="planner-layout">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {hours.map(h => {
            const block = data.blocks[String(h)] || {}
            const routinesArr = data.routines[String(h)]
            const isCurrent = h === data.current_hour
            const isPastUndone = h < data.current_hour && !block.is_done && block.task_title && (!routinesArr || routinesArr.length === 0)
            const label = `${(h > 12 ? h - 12 : h || 12).toString().padStart(2, '0')}:00 ${h < 12 ? 'AM' : 'PM'}`

            const isDraggable = !routinesArr || routinesArr.length === 0
            const dropStyle = dragOverHour === h ? { borderTop: '2px solid #2979FF' } : {}

            if (!isDraggable) {
              const primaryColor = routinesArr[0].color
              return (
                <div key={h} className={`hour-row routine-row routine-${primaryColor}`} style={{ alignItems: 'start' }}>
                  <div className="hour-label" style={{ paddingTop: 8 }}>{label}</div>
                  <div className="routine-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: 4 }}>
                    {routinesArr.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-sm">
                        <span className={`pill pill-${r.color}`}>● {r.start_time}</span>
                        <span className="routine-label" style={{ fontSize: '.85rem' }}>{r.label}</span>
                        <span className="routine-duration" style={{ fontSize: '.7rem' }}>({r.duration_mins}m)</span>
                      </div>
                    ))}
                    <div className="routine-task-field" style={{ marginTop: 2 }}>
                      <input type="text" className="inline-input" placeholder="Add task or notes..."
                        defaultValue={block.task_title || ''}
                        style={{ width: '100%', fontSize: '.8rem', padding: '6px 10px' }}
                        onBlur={e => saveBlock(h, 'task_title', e.target.value)} />
                    </div>
                  </div>
                  <div></div>
                  <div></div>
                </div>
              )
            }

            return (
              <div key={h} 
                   className={`hour-row${isCurrent ? ' current' : ''}${isPastUndone ? ' past-undone' : ''}`}
                   style={{ ...dropStyle, cursor: isDraggable ? 'grab' : 'default', opacity: draggedHour === h ? 0.5 : 1 }}
                   draggable={isDraggable}
                   onDragStart={(e) => { setDraggedHour(h); e.dataTransfer.effectAllowed = 'move' }}
                   onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                   onDragEnter={(e) => { e.preventDefault(); setDragOverHour(h) }}
                   onDragLeave={(e) => { e.preventDefault(); if (dragOverHour === h) setDragOverHour(null) }}
                   onDrop={(e) => handleDrop(e, h)}
              >
                <div className="hour-label">{label}</div>
                <div>
                  <input type="text" placeholder={`What's at ${label}?`}
                    defaultValue={block.task_title || ''}
                    onBlur={e => saveBlock(h, 'task_title', e.target.value)} />
                </div>
                <div>
                  <select value={block.category || 'general'}
                    onChange={e => saveBlock(h, 'category', e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="checkbox-wrap">
                  <input type="checkbox" checked={!!block.is_done}
                    onChange={e => saveBlock(h, 'is_done', e.target.checked ? 1 : 0)} />
                </div>
              </div>
            )
          })}
        </div>

        <div>
          <div className="card">
            <div className="card-header">📋 Today's Prep Tasks</div>
            {todayTasks.length > 0 ? (
              <div className="sidebar-tasks">
                {todayTasks.map((t, i) => {
                  // Find week containing this day
                  let weekNum = 1
                  for (const w of PLAN) if (w.days.some(d => d.day === effectiveDayNum)) { weekNum = w.week; break }
                  const tId = taskId(weekNum, effectiveDayNum, t.track, i)
                  const isChecked = localStorage.getItem('dp_checks') ? JSON.parse(localStorage.getItem('dp_checks'))[tId] : false

                  return (
                    <div className="task-item" key={i}>
                      <div className="checkbox-wrap">
                        <input type="checkbox" defaultChecked={isChecked}
                          onChange={e => saveTask(tId, t.text, t.track, e.target.checked)} />
                      </div>
                      <div>
                        <div className="task-text"><strong>{t.track}</strong>: {t.text}</div>
                        {t.sub && <div className="task-sub">{t.sub}</div>}
                        {t.time && <span className="pill pill-routine" style={{ marginTop: 4 }}>{t.time}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--neu-text-secondary)', fontSize: '.85rem' }}>No prep tasks for today. Ask me to generate your weekly plan!</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
