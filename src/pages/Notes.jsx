import { useState, useEffect, useRef, useCallback } from 'react'

export default function Notes() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [fullNotes, setFullNotes] = useState('')
  const [keyLearnings, setKeyLearnings] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [pastNotes, setPastNotes] = useState([])
  const timerRef = useRef(null)

  const loadNotes = useCallback((day) => {
    setSelectedDate(day)
    fetch(`/api/notes/${day}`).then(r => r.json()).then(d => {
      setFullNotes(d.full_notes || '')
      setKeyLearnings(d.key_learnings || '')
      if (d.last_saved) setSavedAt(d.last_saved.split(' ')[1]?.slice(0, 5))
      else setSavedAt(null)
    })
  }, [])

  const loadPastNotes = useCallback(() => {
    fetch('/api/notes_list').then(r => r.json()).then(setPastNotes)
  }, [])

  useEffect(() => { loadNotes(today); loadPastNotes() }, [today, loadNotes, loadPastNotes])

  const saveNotes = useCallback(() => {
    fetch('/api/save_notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, full_notes: fullNotes, key_learnings: keyLearnings })
    }).then(r => r.json()).then(d => {
      setSavedAt(d.saved_at)
      loadPastNotes()
    })
  }, [selectedDate, fullNotes, keyLearnings, loadPastNotes])

  const startAutoSave = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(saveNotes, 15000)
  }, [saveNotes])

  return (
    <>
      <div className="flex justify-between items-center mb-md">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>📝 Daily Notes</h2>
        <div className="flex items-center gap-sm">
          <input type="date" value={selectedDate} onChange={e => loadNotes(e.target.value)} style={{ width: 'auto' }} />
          {savedAt && (
            <div className="save-indicator">
              <span className="dot"></span> Saved at {savedAt}
            </div>
          )}
        </div>
      </div>

      <div className="notes-layout">
        <div className="flex flex-col gap-md">
          <div className="card animate-in">
            <div className="card-header">📄 Full Notes</div>
            <textarea value={fullNotes} placeholder="Write your thoughts, observations, progress notes for the day..."
              style={{ minHeight: 220 }}
              onChange={e => { setFullNotes(e.target.value); startAutoSave() }}
              onBlur={saveNotes} />
          </div>
          <div className="card animate-in delay-1">
            <div className="card-header">💡 Key Learnings (Bullet Points)</div>
            <textarea value={keyLearnings}
              placeholder={"- Learned about binary trees\n- Understood time complexity of BFS\n- Need to practice DP problems"}
              style={{ minHeight: 150 }}
              onChange={e => { setKeyLearnings(e.target.value); startAutoSave() }}
              onBlur={saveNotes} />
          </div>
        </div>

        <div className="card animate-in delay-2" style={{ alignSelf: 'start' }}>
          <div className="card-header">📚 Past Notes</div>
          <div className="past-notes-list">
            {pastNotes.length === 0 ? (
              <p style={{ color: 'var(--neu-text-secondary)', fontSize: '.85rem', padding: 12 }}>No notes yet. Start writing!</p>
            ) : pastNotes.map(p => (
              <div className="past-note-item" key={p.date} onClick={() => loadNotes(p.date)}>
                <div className="pn-date">{p.date}</div>
                <div className="pn-preview">{p.preview || 'Empty note'}{p.preview?.length >= 80 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
