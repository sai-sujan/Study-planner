import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SECTIONS, loadChecks, saveChecks, itemId } from '../data/genAIData'
import GenAIBlog from './GenAIBlog'
import TopicBlog from './TopicBlog'

export default function GenAIDetail() {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const section = SECTIONS.find(s => s.id === sectionId)

  const [checks, setChecks] = useState(loadChecks)
  const [showBlog, setShowBlog] = useState(false)
  const [topicBlog, setTopicBlog] = useState(null) // { topicName } or null
  const [savedBlogs, setSavedBlogs] = useState(new Set()) // topic names that have saved blogs
  const [openSubs, setOpenSubs] = useState(() => {
    const o = new Set()
    if (section) section.subsections.forEach(sub => o.add(sub.label))
    return o
  })
  const [search, setSearch] = useState('')

  // Sync checks across tabs / overview page
  useEffect(() => {
    const sync = () => setChecks(loadChecks())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  // Load which topics have saved blogs
  useEffect(() => {
    fetch('http://localhost:5050/api/genai/topic-blogs')
      .then(r => r.json())
      .then(list => {
        const names = new Set(list.filter(b => b.section_id === sectionId).map(b => b.topic_name))
        setSavedBlogs(names)
      })
      .catch(() => {})
  }, [sectionId, topicBlog]) // refetch when a blog modal closes (topicBlog changes)

  const toggle = useCallback((id) => {
    setChecks(prev => {
      const next = { ...prev, [id]: !prev[id] }
      saveChecks(next)
      return next
    })
  }, [])

  const toggleSub = (label) => {
    setOpenSubs(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const expandAll = () => setOpenSubs(new Set(section?.subsections.map(s => s.label) ?? []))
  const collapseAll = () => setOpenSubs(new Set())

  const markAllSection = (done) => {
    setChecks(prev => {
      const next = { ...prev }
      section.subsections.forEach(sub =>
        sub.items.forEach((_, i) => { next[itemId(section.id, sub.label, i)] = done })
      )
      saveChecks(next)
      return next
    })
  }

  if (!section) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤔</div>
        <div style={{ color: 'var(--neu-text-secondary)', marginBottom: 24 }}>Section not found.</div>
        <button className="btn btn-primary" onClick={() => navigate('/genai')}>← Back to Roadmap</button>
      </div>
    )
  }

  // Progress for this section
  let total = 0, done = 0
  section.subsections.forEach(sub => sub.items.forEach((_, i) => {
    total++; if (checks[itemId(section.id, sub.label, i)]) done++
  }))
  const pct = total ? Math.round(done / total * 100) : 0

  const q = search.toLowerCase()

  // All sections for the sidebar nav
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Back button ── */}
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => navigate('/genai')}
        style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        ← All Topics
      </button>

      {/* ── Header ── */}
      <div style={{
        background: 'var(--neu-bg)',
        borderRadius: 24,
        padding: '28px 32px',
        marginBottom: 24,
        boxShadow: '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)',
        borderLeft: `5px solid ${section.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: section.bg, filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        {/* Blog button pinned top-right of header card */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowBlog(true)}
          style={{ position: 'absolute', top: 20, right: 20, gap: 6, zIndex: 1 }}
        >
          📝 Generate Blog
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem',
            background: 'var(--neu-bg)',
            boxShadow: 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)',
          }}>
            {section.icon}
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-.03em', color: section.color, margin: 0 }}>
              {section.title}
            </h1>
            <div style={{ fontSize: '.8rem', color: 'var(--neu-text-secondary)', marginTop: 4, fontFamily: 'monospace' }}>
              {section.subsections.length} sections · {total} topics
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="prep-progress-label" style={{ marginBottom: 6 }}>
          <span style={{ color: 'var(--neu-text-secondary)', fontSize: '.8rem' }}>Progress</span>
          <span style={{ color: section.color, fontFamily: 'monospace', fontWeight: 700 }}>{done} / {total} ({pct}%)</span>
        </div>
        <div className="prep-progress-track">
          <div className="prep-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${section.color}90, ${section.color})` }} />
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex gap-sm items-center" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍  Search within this topic…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button className="btn btn-secondary btn-sm" onClick={expandAll}>Expand All</button>
        <button className="btn btn-secondary btn-sm" onClick={collapseAll}>Collapse All</button>
        <button className="btn btn-secondary btn-sm" onClick={() => markAllSection(true)}>✓ Mark all done</button>
        <button className="btn btn-secondary btn-sm" onClick={() => markAllSection(false)}>↺ Uncheck all</button>
      </div>

      {/* ── Other sections quick nav ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {SECTIONS.filter(s => s.id !== section.id).map(s => {
          let st = 0, sd = 0
          s.subsections.forEach(sub => sub.items.forEach((_, i) => {
            st++; if (checks[itemId(s.id, sub.label, i)]) sd++
          }))
          const sp = st ? Math.round(sd / st * 100) : 0
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/genai/${s.id}`)}
              style={{
                background: 'var(--neu-bg)',
                border: 'none',
                borderRadius: 999,
                padding: '5px 12px',
                fontSize: '.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--neu-text-secondary)',
                boxShadow: '3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = s.color }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--neu-text-secondary)' }}
            >
              {s.icon} {s.title}
              <span style={{ fontFamily: 'monospace', opacity: .7 }}>{sp}%</span>
            </button>
          )
        })}
      </div>

      {/* ── Subsections ── */}
      {section.subsections.map(sub => {
        const filteredItems = q
          ? sub.items.map((item, i) => ({ item, i })).filter(({ item }) => item.toLowerCase().includes(q))
          : sub.items.map((item, i) => ({ item, i }))

        if (q && filteredItems.length === 0) return null

        const isOpen = openSubs.has(sub.label)
        let subDone = 0
        sub.items.forEach((_, i) => { if (checks[itemId(section.id, sub.label, i)]) subDone++ })
        const subPct = sub.items.length ? Math.round(subDone / sub.items.length * 100) : 0
        const allSubDone = subDone === sub.items.length && sub.items.length > 0

        return (
          <div
            key={sub.label}
            className={`prep-day-card${allSubDone ? ' all-done' : ''}`}
            style={{ marginBottom: 14 }}
          >
            {/* Subsection Header */}
            <div className="prep-day-header" onClick={() => toggleSub(sub.label)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="prep-track-label"
                  style={{ background: section.bg, color: section.color, margin: 0, fontSize: '.8rem' }}
                >
                  {sub.label}
                </span>
                {allSubDone && <span style={{ color: '#4ade80', fontSize: '.75rem' }}>✓ Completed!</span>}
              </div>
              <div className="prep-day-prog">
                <span style={{ fontFamily: 'monospace', fontSize: '.72rem', color: section.color }}>{subDone}/{sub.items.length}</span>
                <div style={{
                  width: 52, height: 5, background: 'var(--neu-bg)', borderRadius: 999, overflow: 'hidden',
                  boxShadow: 'inset 2px 2px 3px var(--neu-shadow-dark), inset -2px -2px 3px var(--neu-shadow-light)'
                }}>
                  <div style={{ width: `${subPct}%`, height: '100%', background: section.color, borderRadius: 999, transition: 'width .3s' }} />
                </div>
                <span className="prep-chevron">{isOpen ? '▾' : '▸'}</span>
              </div>
            </div>

            {/* Items list */}
            {(isOpen || q) && (
              <div className="prep-day-body">
                {filteredItems.map(({ item, i }) => {
                  const id = itemId(section.id, sub.label, i)
                  const isDone = !!checks[id]
                  const hasBlog = savedBlogs.has(item)
                  return (
                    <div
                      key={id}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <label
                        className={`prep-task${isDone ? ' done' : ''}`}
                        onClick={e => { e.preventDefault(); toggle(id) }}
                        style={{ paddingLeft: 4, flex: 1, marginBottom: 0 }}
                      >
                        <input type="checkbox" checked={isDone} readOnly />
                        <span className="prep-task-text" style={{ fontSize: '.88rem' }}>
                          {item}
                        </span>
                      </label>
                      <button
                        title={hasBlog ? `Read blog: ${item}` : `Generate blog: ${item}`}
                        onClick={e => { e.stopPropagation(); setTopicBlog({ topicName: item }) }}
                        style={{
                          flexShrink: 0,
                          width: 30, height: 30, borderRadius: '50%',
                          background: hasBlog ? `${section.color}18` : 'var(--neu-bg)',
                          border: hasBlog ? `1.5px solid ${section.color}55` : 'none',
                          cursor: 'pointer',
                          color: hasBlog ? section.color : 'var(--neu-text-secondary)',
                          fontSize: '.75rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: hasBlog
                            ? 'none'
                            : '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)',
                          transition: 'all .15s',
                          opacity: hasBlog ? 1 : 0.6,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = section.color }}
                        onMouseLeave={e => { if (!hasBlog) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = 'var(--neu-text-secondary)' } }}
                      >
                        📝
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Section blog modal ── */}
      {showBlog && <GenAIBlog section={section} onClose={() => setShowBlog(false)} />}

      {/* ── Topic blog modal ── */}
      {topicBlog && (
        <TopicBlog
          topicName={topicBlog.topicName}
          sectionId={section.id}
          sectionTitle={section.title}
          sectionColor={section.color}
          sectionIcon={section.icon}
          onClose={() => setTopicBlog(null)}
        />
      )}

      {/* ── Bottom nav ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
        {(() => {
          const idx = SECTIONS.findIndex(s => s.id === sectionId)
          const prev = SECTIONS[idx - 1]
          const next = SECTIONS[idx + 1]
          return (
            <>
              {prev ? (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/genai/${prev.id}`)}>
                  ← {prev.icon} {prev.title}
                </button>
              ) : <span />}
              {next ? (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/genai/${next.id}`)}>
                  {next.icon} {next.title} →
                </button>
              ) : <span />}
            </>
          )
        })()}
      </div>
    </div>
  )
}
