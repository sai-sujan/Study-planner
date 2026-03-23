import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══ Highlight storage ═══ */
const HL_STORE_KEY = 'dp_blog_highlights_v1'
function loadStore() { try { return JSON.parse(localStorage.getItem(HL_STORE_KEY)) || {} } catch { return {} } }
function saveStore(data) { localStorage.setItem(HL_STORE_KEY, JSON.stringify(data)) }

const COLORS = [
  { name: 'Yellow', value: '#fde68a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Pink', value: '#fecaca' },
]


export default function BlogHighlighter({ storageKey, topicContext, children }) {
  const contentRef = useRef(null)   // wraps only the blog content (children)
  const wrapperRef = useRef(null)   // wraps everything including popups
  const [highlights, setHighlights] = useState([])
  const [selPopup, setSelPopup] = useState(null)
  const [hlPopup, setHlPopup] = useState(null)
  const [explainBox, setExplainBox] = useState(null)
  const [chatMessages, setChatMessages] = useState([])  // [{role:'ai'|'user', text}]
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)
  const chatEndRef = useRef(null)
  const hlRef = useRef([])          // mirror of highlights for DOM event handlers
  hlRef.current = highlights

  // Load highlights
  useEffect(() => {
    const all = loadStore()
    setHighlights(all[storageKey] || [])
    setSelPopup(null)
    setHlPopup(null)
    setExplainBox(null)
  }, [storageKey])

  const updateHighlights = useCallback((newHl) => {
    setHighlights(newHl)
    const all = loadStore()
    all[storageKey] = newHl
    saveStore(all)
  }, [storageKey])

  // ── Apply highlights to DOM — only when highlights array changes ──
  useEffect(() => {
    if (!contentRef.current) return
    applyHighlightsToDOM(contentRef.current, highlights)
  }, [highlights, children]) // eslint-disable-line

  function applyHighlightsToDOM(container, hls) {
    // 1. Unwrap existing highlight spans
    container.querySelectorAll('[data-hl-id]').forEach(el => {
      const parent = el.parentNode
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    })
    container.normalize()

    // 2. Apply each highlight
    for (const hl of hls) {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const p = node.parentElement
          if (!p) return NodeFilter.FILTER_REJECT
          if (p.closest('pre') || p.hasAttribute('data-hl-id'))
            return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }
      })
      const matches = []
      while (walker.nextNode()) {
        const node = walker.currentNode
        const idx = node.textContent.indexOf(hl.text)
        if (idx !== -1) matches.push({ node, idx })
      }
      for (const { node, idx } of matches.reverse()) {
        const before = node.textContent.slice(0, idx)
        const matchText = node.textContent.slice(idx, idx + hl.text.length)
        const after = node.textContent.slice(idx + hl.text.length)

        const span = document.createElement('span')
        span.setAttribute('data-hl-id', hl.id)
        span.style.cssText = `background:${hl.color};border-radius:3px;padding:1px 3px;cursor:pointer;transition:filter .15s;${hl.explanation ? 'border-bottom:2px dotted rgba(0,0,0,0.25);' : ''}`
        span.textContent = matchText
        span.onmouseenter = () => { span.style.filter = 'brightness(0.88)' }
        span.onmouseleave = () => { span.style.filter = '' }
        span.onclick = (e) => {
          e.stopPropagation()
          const hlId = span.getAttribute('data-hl-id')
          const found = hlRef.current.find(h => h.id === hlId)
          if (!found) return
          const wRect = wrapperRef.current.getBoundingClientRect()
          const sRect = span.getBoundingClientRect()
          const posX = sRect.left - wRect.left + sRect.width / 2
          const posY = sRect.bottom - wRect.top + 4
          setSelPopup(null)
          if (found.explanation) {
            // Open chat box with existing explanation + full chat history
            setHlPopup(null)
            setExplainBox({ x: posX, y: posY, text: found.text, loading: false, explanation: found.explanation, hlId: found.id })
            setChatMessages(found.chatHistory || [{ role: 'ai', text: found.explanation }])
            setChatInput('')
            setShowChatInput(true)
          } else {
            // No explanation — show color/remove popup
            setExplainBox(null)
            setHlPopup({ hl: found, x: posX, y: posY })
          }
        }

        const parent = node.parentNode
        if (after) parent.insertBefore(document.createTextNode(after), node.nextSibling)
        parent.insertBefore(span, node.nextSibling)
        if (before) {
          node.textContent = before
        } else {
          parent.removeChild(node)
        }
      }
    }
  }

  // ── Handle text selection ──
  const handleMouseUp = useCallback((e) => {
    // Ignore clicks on highlights or popups
    if (e.target.closest('[data-hl-id]') || e.target.closest('.bh-popup')) return

    setTimeout(() => {
      const sel = window.getSelection()
      const text = sel?.toString().trim()
      if (!text || text.length < 2) { setSelPopup(null); return }
      // Make sure selection is inside the content area (not popups)
      if (!contentRef.current?.contains(sel.anchorNode)) { setSelPopup(null); return }
      try {
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) { setSelPopup(null); return }
        const wRect = wrapperRef.current.getBoundingClientRect()
        setSelPopup({
          text,
          x: rect.left - wRect.left + rect.width / 2,
          y: rect.top - wRect.top - 8,
        })
        setHlPopup(null)
      } catch { /* ignore */ }
    }, 30)
  }, [])

  // Close popups on outside click
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest('.bh-popup')) return
      if (e.target.closest('[data-hl-id]')) return
      // Clicked inside blog content — only close hlPopup, not selPopup (mouseup handles that)
      if (contentRef.current?.contains(e.target)) {
        setHlPopup(null)
        return
      }
      // Clicked fully outside
      setSelPopup(null)
      setHlPopup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addHighlight = useCallback((color) => {
    if (!selPopup) return
    const id = Date.now().toString(36)
    updateHighlights([...highlights, { id, text: selPopup.text, color, explanation: '' }])
    setSelPopup(null)
    window.getSelection()?.removeAllRanges()
  }, [selPopup, highlights, updateHighlights])

  const explainSelection = useCallback(async () => {
    if (!selPopup) return
    const text = selPopup.text
    const id = Date.now().toString(36)
    const color = '#fde68a'
    const updated = [...highlights, { id, text, color, explanation: '' }]
    updateHighlights(updated)
    setExplainBox({ x: selPopup.x, y: selPopup.y, text, loading: true, explanation: '', hlId: id })
    setChatMessages([])
    setChatInput('')
    setShowChatInput(false)
    setSelPopup(null)
    window.getSelection()?.removeAllRanges()
    try {
      const res = await fetch('/api/explain-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, topic: topicContext || '' }),
      })
      const data = await res.json()
      const explanation = data.explanation || data.error || 'Could not explain'
      const initialChat = [{ role: 'ai', text: explanation }]
      updateHighlights(updated.map(h => h.id === id ? { ...h, explanation, chatHistory: initialChat } : h))
      setExplainBox(prev => prev ? { ...prev, loading: false, explanation } : null)
      setChatMessages(initialChat)
    } catch (e) {
      const errMsg = `Error: ${e.message}`
      const errChat = [{ role: 'ai', text: errMsg }]
      setExplainBox(prev => prev ? { ...prev, loading: false, explanation: errMsg } : null)
      setChatMessages(errChat)
    }
  }, [selPopup, highlights, updateHighlights, topicContext])

  // Continue chat — send follow-up question
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading || !explainBox) return
    const userMsg = chatInput.trim()
    const newMessages = [...chatMessages, { role: 'user', text: userMsg }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    // Build conversation context for the AI
    const convoContext = newMessages.map(m => m.role === 'user' ? `User: ${m.text}` : `AI: ${m.text}`).join('\n')

    try {
      const res = await fetch('/api/explain-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Follow-up conversation about "${explainBox.text}":\n${convoContext}\nUser: ${userMsg}`,
          topic: topicContext || '',
        }),
      })
      const data = await res.json()
      const reply = data.explanation || data.error || 'No response'
      setChatMessages(prev => {
        const updated = [...prev, { role: 'ai', text: reply }]
        // Persist chat history to highlight
        if (explainBox.hlId) {
          updateHighlights(highlights.map(h => h.id === explainBox.hlId ? { ...h, chatHistory: updated } : h))
        }
        return updated
      })
    } catch (e) {
      setChatMessages(prev => {
        const updated = [...prev, { role: 'ai', text: `Error: ${e.message}` }]
        if (explainBox.hlId) {
          updateHighlights(highlights.map(h => h.id === explainBox.hlId ? { ...h, chatHistory: updated } : h))
        }
        return updated
      })
    }
    setChatLoading(false)
  }, [chatInput, chatLoading, chatMessages, explainBox, topicContext, highlights, updateHighlights])

  // Auto-scroll chat to bottom (only within the chat container, not the page)
  useEffect(() => {
    const el = chatEndRef.current?.parentElement
    if (el) el.scrollTop = el.scrollHeight
  }, [chatMessages, chatLoading])

  const removeHighlight = useCallback((hlId) => {
    updateHighlights(highlights.filter(h => h.id !== hlId))
    setHlPopup(null)
    setExplainBox(null)
  }, [highlights, updateHighlights])

  const changeColor = useCallback((hlId, newColor) => {
    updateHighlights(highlights.map(h => h.id === hlId ? { ...h, color: newColor } : h))
    setHlPopup(null)
  }, [highlights, updateHighlights])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Blog content — only this area detects selection */}
      <div ref={contentRef} onMouseUp={handleMouseUp}>
        {children}
      </div>

      {/* ── Selection popup ── */}
      {selPopup && (
        <div className="bh-popup" style={{
          position: 'absolute',
          left: selPopup.x, top: selPopup.y,
          transform: 'translate(-50%, -100%)',
          background: 'var(--neu-bg)', borderRadius: 12,
          padding: '6px 10px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,58,237,0.15)',
          display: 'flex', alignItems: 'center', gap: 6,
          zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {COLORS.map(c => (
            <button
              key={c.value}
              title={`Highlight ${c.name}`}
              onClick={() => addHighlight(c.value)}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.1)',
                background: c.value, cursor: 'pointer',
                transition: 'transform .1s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            />
          ))}
          <div style={{ width: 1, height: 18, background: 'rgba(163,177,198,0.3)', margin: '0 2px' }} />
          <button
            onClick={explainSelection}
            style={{
              padding: '4px 12px', borderRadius: 999, border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontSize: '.7rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >🧠 Explain</button>
        </div>
      )}

      {/* ── Highlight click popup ── */}
      {hlPopup && (
        <div className="bh-popup" style={{
          position: 'absolute',
          left: hlPopup.x, top: hlPopup.y,
          transform: 'translateX(-50%)',
          background: 'var(--neu-bg)', borderRadius: 12,
          padding: '6px 10px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 6,
          zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {COLORS.map(c => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => changeColor(hlPopup.hl.id, c.value)}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                border: hlPopup.hl.color === c.value ? '2px solid var(--neu-accent)' : '2px solid rgba(0,0,0,0.1)',
                background: c.value, cursor: 'pointer',
              }}
            />
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(163,177,198,0.3)' }} />
          <button
            onClick={() => removeHighlight(hlPopup.hl.id)}
            title="Remove"
            style={{
              width: 20, height: 20, borderRadius: '50%', border: 'none',
              background: '#fecaca', color: '#dc2626',
              fontSize: '.7rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
      )}

      {/* ── Explain box with chat ── */}
      {explainBox && (
        <div className="bh-popup" style={{
          position: 'absolute',
          left: Math.max(10, (explainBox.x || 0) - 150),
          top: (explainBox.y || 0) + 30,
          width: 310,
          maxHeight: 420,
          background: 'var(--neu-bg)', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,58,237,0.12)',
          borderLeft: '4px solid #2563eb',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px 8px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: '.65rem', fontWeight: 700, color: '#2563eb',
                textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'monospace',
              }}>Explanation</span>
              {/* Color dots + remove for managing highlight */}
              {explainBox.hlId && (
                <>
                  <div style={{ width: 1, height: 14, background: 'rgba(163,177,198,0.3)', margin: '0 2px' }} />
                  {COLORS.map(c => (
                    <button key={c.value} title={c.name} onClick={() => changeColor(explainBox.hlId, c.value)} style={{
                      width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(0,0,0,0.1)',
                      background: c.value, cursor: 'pointer', padding: 0,
                    }} />
                  ))}
                  <button title="Remove highlight" onClick={() => removeHighlight(explainBox.hlId)} style={{
                    width: 14, height: 14, borderRadius: '50%', border: 'none',
                    background: '#fecaca', color: '#dc2626', fontSize: '.5rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}>✕</button>
                </>
              )}
            </div>
            <button
              onClick={() => { setExplainBox(null); setShowChatInput(false); setChatMessages([]); setChatInput('') }}
              style={{
                width: 20, height: 20, borderRadius: '50%', border: 'none',
                background: 'var(--neu-bg)', cursor: 'pointer',
                color: 'var(--neu-text-secondary)', fontSize: '.68rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)',
              }}
            >✕</button>
          </div>

          {/* Selected text */}
          <div style={{
            fontSize: '.68rem', color: '#7c3aed', fontWeight: 600,
            padding: '0 14px 6px', fontStyle: 'italic',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>"{explainBox.text}"</div>

          {/* Chat messages area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0 14px',
            minHeight: 40, maxHeight: 280,
          }}>
            {explainBox.loading ? (
              <div style={{ color: 'var(--neu-text-secondary)', fontSize: '.78rem', padding: '8px 0' }}>Thinking...</div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: 8,
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontSize: '.78rem', lineHeight: 1.6,
                  background: msg.role === 'user' ? 'rgba(37,99,235,0.08)' : 'transparent',
                  borderLeft: msg.role === 'user' ? '3px solid #2563eb' : 'none',
                  color: 'var(--neu-text-primary)',
                }}>
                  {msg.role === 'user' && (
                    <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#2563eb', marginBottom: 2, fontFamily: 'monospace' }}>YOU</div>
                  )}
                  {msg.text}
                </div>
              ))
            )}
            {chatLoading && (
              <div style={{ color: 'var(--neu-text-secondary)', fontSize: '.76rem', padding: '4px 10px' }}>Thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Continue button / Chat input */}
          {!explainBox.loading && (
            <div style={{ padding: '8px 14px 10px', flexShrink: 0, borderTop: '1px solid rgba(163,177,198,0.15)' }}>
              {!showChatInput ? (
                <button
                  onClick={() => setShowChatInput(true)}
                  style={{
                    width: '100%', padding: '6px 0', borderRadius: 999, border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#fff', fontSize: '.7rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 5,
                  }}
                >💬 Continue Chat</button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
                    placeholder="Ask a follow-up..."
                    autoFocus
                    style={{
                      flex: 1, padding: '6px 10px', borderRadius: 10,
                      border: '1px solid rgba(37,99,235,0.3)',
                      background: 'var(--neu-bg)', outline: 'none',
                      fontSize: '.74rem', color: 'var(--neu-text-primary)',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      padding: '6px 10px', borderRadius: 10, border: 'none',
                      background: chatInput.trim() ? '#2563eb' : 'rgba(163,177,198,0.3)',
                      color: '#fff', fontSize: '.72rem', fontWeight: 700,
                      cursor: chatInput.trim() ? 'pointer' : 'default',
                    }}
                  >→</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
