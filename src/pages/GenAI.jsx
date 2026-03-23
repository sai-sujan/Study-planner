import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTIONS, STORAGE_KEY, loadChecks, saveChecks, itemId } from '../data/genAIData'

function sectionProgress(section, checks) {
  let total = 0, done = 0
  section.subsections.forEach(sub =>
    sub.items.forEach((_, i) => {
      total++
      if (checks[itemId(section.id, sub.label, i)]) done++
    })
  )
  return { total, done, pct: total ? Math.round(done / total * 100) : 0 }
}

export default function GenAI() {
  const [checks, setChecks] = useState(loadChecks)
  const navigate = useNavigate()

  // Keep in sync with localStorage (detail page writes here too)
  useEffect(() => {
    const sync = () => setChecks(loadChecks())
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('focus', sync); window.removeEventListener('storage', sync) }
  }, [])

  let totalItems = 0, doneItems = 0
  SECTIONS.forEach(s => {
    const p = sectionProgress(s, checks)
    totalItems += p.total
    doneItems += p.done
  })
  const overallPct = totalItems ? Math.round(doneItems / totalItems * 100) : 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="prep-header">
        <h1>🤖 Gen AI Engineer Roadmap</h1>
        <p>PRODUCTION FOCUS · BUILD, SHIP & SCALE AI APPLICATIONS · Click a topic to study it</p>
      </div>

      {/* ── Overall Progress ── */}
      <div className="prep-progress-wrap" style={{ marginBottom: 32 }}>
        <div className="prep-progress-label">
          <span>Overall progress</span>
          <span>{doneItems} / {totalItems} topics ({overallPct}%)</span>
        </div>
        <div className="prep-progress-track">
          <div className="prep-progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* ── Section Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {SECTIONS.map(s => {
          const { total, done, pct } = sectionProgress(s, checks)
          const allDone = total > 0 && done === total

          return (
            <div
              key={s.id}
              onClick={() => navigate(`/genai/${s.id}`)}
              style={{
                background: 'var(--neu-bg)',
                borderRadius: 20,
                padding: '20px 22px',
                cursor: 'pointer',
                transition: 'transform .18s, box-shadow .18s',
                boxShadow: allDone
                  ? `inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light), 0 0 0 2px ${s.color}`
                  : '7px 7px 14px var(--neu-shadow-dark), -7px -7px 14px var(--neu-shadow-light)',
                borderLeft: `4px solid ${s.color}`,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `10px 10px 20px var(--neu-shadow-dark), -10px -10px 20px var(--neu-shadow-light), 0 0 0 2px ${s.color}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = allDone
                  ? `inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light), 0 0 0 2px ${s.color}`
                  : '7px 7px 14px var(--neu-shadow-dark), -7px -7px 14px var(--neu-shadow-light)'
              }}
            >
              {/* Subtle bg glow */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: s.bg, filter: 'blur(24px)', pointerEvents: 'none'
              }} />

              {/* Icon + title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                  background: 'var(--neu-bg)',
                  boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
                }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--neu-text-primary)', lineHeight: 1.3 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--neu-text-secondary)', marginTop: 2 }}>
                    {s.subsections.length} sections · {total} topics
                  </div>
                </div>
                {allDone && (
                  <span style={{
                    fontSize: '.7rem', fontWeight: 700, color: '#4ade80',
                    background: 'rgba(74,222,128,0.12)', padding: '3px 8px',
                    borderRadius: 999, flexShrink: 0,
                  }}>✓ Done</span>
                )}
              </div>

              {/* Subsection tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {s.subsections.map(sub => (
                  <span key={sub.label} style={{
                    fontSize: '.64rem', padding: '2px 8px',
                    borderRadius: 999, background: s.bg, color: s.color,
                    fontWeight: 600,
                  }}>
                    {sub.label}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  flex: 1, height: 7, background: 'var(--neu-bg)', borderRadius: 999, overflow: 'hidden',
                  boxShadow: 'inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)',
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: `linear-gradient(90deg, ${s.color}99, ${s.color})`,
                    borderRadius: 999, transition: 'width .4s ease',
                    boxShadow: `0 2px 6px ${s.color}55`,
                  }} />
                </div>
                <span style={{ fontSize: '.72rem', fontFamily: 'monospace', color: s.color, fontWeight: 700, minWidth: 36 }}>
                  {pct}%
                </span>
              </div>
              <div style={{ fontSize: '.68rem', color: 'var(--neu-text-secondary)', marginTop: 5, fontFamily: 'monospace' }}>
                {done} / {total} completed
              </div>

              {/* Arrow hint */}
              <div style={{
                position: 'absolute', bottom: 16, right: 16,
                fontSize: '.75rem', color: s.color, opacity: 0.6,
              }}>→</div>
            </div>
          )
        })}

        {/* ── Interview Questions on Resume — special card ── */}
        <div
          onClick={() => navigate('/interview')}
          style={{
            background: 'var(--neu-bg)',
            borderRadius: 20,
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'transform .18s, box-shadow .18s',
            boxShadow: '7px 7px 14px var(--neu-shadow-dark), -7px -7px 14px var(--neu-shadow-light)',
            borderLeft: '4px solid #7c3aed',
            position: 'relative',
            overflow: 'hidden',
            gridColumn: 'span 1',
            background: 'linear-gradient(135deg, var(--neu-bg) 0%, var(--neu-bg) 100%)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '10px 10px 20px var(--neu-shadow-dark), -10px -10px 20px var(--neu-shadow-light), 0 0 0 2px #7c3aed'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '7px 7px 14px var(--neu-shadow-dark), -7px -7px 14px var(--neu-shadow-light)'
          }}
        >
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(124,58,237,0.08)', filter: 'blur(24px)', pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
              background: 'var(--neu-bg)',
              boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
            }}>
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--neu-text-primary)', lineHeight: 1.3 }}>
                Interview Questions on Resume
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--neu-text-secondary)', marginTop: 2 }}>
                3 sections · Technical · Behavioral · Projects
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {['Technical Q&A', 'Behavioral', 'Project Stories'].map(tag => (
              <span key={tag} style={{
                fontSize: '.64rem', padding: '2px 8px',
                borderRadius: 999, background: 'rgba(124,58,237,0.12)', color: '#7c3aed',
                fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ fontSize: '.78rem', color: 'var(--neu-text-secondary)', lineHeight: 1.5 }}>
            Resume-based interview prep — Q&A, STAR stories, architecture deep dives
          </div>

          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            fontSize: '.75rem', color: '#7c3aed', opacity: 0.6,
          }}>→</div>
        </div>
      </div>
    </div>
  )
}
