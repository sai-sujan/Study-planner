import { useState, useEffect } from 'react'

const colorOptions = [
  { value: 'coral', label: '🟠 Coral — Personal/Self-care' },
  { value: 'amber', label: '🟡 Amber — Food/Rest' },
  { value: 'green', label: '🟢 Green — Health/Exercise' },
  { value: 'gray',  label: '⚪ Gray — Admin' },
]

export default function Routine() {
  const [routines, setRoutines] = useState([])
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [form, setForm] = useState({ start_time: '09:00', duration_mins: 30, label: '', color: 'coral', notes: '' })

  const load = () => fetch('/api/routines').then(r => r.json()).then(setRoutines)
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.label) { alert('Please enter a label'); return }
    await fetch('/api/routine', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ start_time: '09:00', duration_mins: 30, label: '', color: 'coral', notes: '' })
    load()
  }

  const startEdit = (r) => {
    setEditId(r.id)
    setEditData({ start_time: r.start_time, duration_mins: r.duration_mins, label: r.label, color: r.color, notes: r.notes || '' })
  }

  const saveEdit = async () => {
    await fetch(`/api/routine/${editId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    })
    setEditId(null)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this routine?')) return
    await fetch(`/api/routine/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <div className="flex justify-between items-center mb-md">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🔄 Daily Routines</h2>
        <p style={{ fontSize: '.82rem', color: 'var(--neu-text-secondary)' }}>These repeat every day automatically.</p>
      </div>

      <div className="card mb-md animate-in">
        <div className="card-header">➕ Add New Routine</div>
        <div className="routine-form">
          <div><label>Time</label><input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></div>
          <div><label>Duration</label><input type="number" value={form.duration_mins} min="5" max="480" onChange={e => setForm({ ...form, duration_mins: parseInt(e.target.value) || 30 })} /></div>
          <div><label>Label</label><input type="text" value={form.label} placeholder="e.g. Gym workout" onChange={e => setForm({ ...form, label: e.target.value })} /></div>
          <div><label>Color</label><select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>
            {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select></div>
          <div><label>Notes</label><input type="text" value={form.notes} placeholder="Optional notes" onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div><label>&nbsp;</label><button className="btn btn-primary" onClick={add}>Add</button></div>
        </div>
      </div>

      <div className="flex gap-md mb-md" style={{ flexWrap: 'wrap' }}>
        <span className="pill pill-coral"><span className="color-dot coral"></span> Personal / Self-care</span>
        <span className="pill pill-amber"><span className="color-dot amber"></span> Food / Rest</span>
        <span className="pill pill-green"><span className="color-dot green"></span> Health / Exercise</span>
        <span className="pill pill-gray"><span className="color-dot gray"></span> Admin</span>
      </div>

      <div className="card animate-in delay-1">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Duration</th><th>Label</th><th>Color</th><th>Notes</th><th style={{ width: 140 }}>Actions</th></tr></thead>
            <tbody>
              {routines.map(r => (
                <tr key={r.id}>
                  {editId === r.id ? (
                    <>
                      <td><input type="time" className="inline-input" value={editData.start_time} onChange={e => setEditData({ ...editData, start_time: e.target.value })} /></td>
                      <td><input type="number" className="inline-input" value={editData.duration_mins} min="5" style={{ width: 70 }} onChange={e => setEditData({ ...editData, duration_mins: parseInt(e.target.value) || 30 })} /></td>
                      <td><input type="text" className="inline-input" value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} /></td>
                      <td><select className="inline-input" value={editData.color} onChange={e => setEditData({ ...editData, color: e.target.value })}>
                        {colorOptions.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                      </select></td>
                      <td><input type="text" className="inline-input" value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} /></td>
                      <td>
                        <div className="flex gap-sm">
                          <button className="btn btn-primary btn-sm" onClick={saveEdit}>💾 Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>✖</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{r.start_time}</td>
                      <td>{r.duration_mins} min</td>
                      <td>{r.label}</td>
                      <td><span className={`color-dot ${r.color}`}></span> {r.color}</td>
                      <td>{r.notes || '—'}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>🗑</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
