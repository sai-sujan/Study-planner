import { useState, useEffect, useRef, useCallback } from 'react'

const SPEEDS = [
  { label: '0.5x', ms: 1200 },
  { label: '1x',   ms: 600 },
  { label: '2x',   ms: 300 },
  { label: '4x',   ms: 150 },
]

const POINTER_COLORS = [
  '#e11d48', '#2563eb', '#16a34a', '#ea580c', '#7c3aed',
  '#0891b2', '#ca8a04', '#9333ea',
]

export default function DSAVisualizer({ code, stepColor }) {
  const [snapshots, setSnapshots] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasRun, setHasRun] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const timerRef = useRef(null)
  const pointerColorMap = useRef({})
  const pointerColorIdx = useRef(0)
  const barsRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  // Playback
  useEffect(() => {
    clearInterval(timerRef.current)
    if (playing && snapshots.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= snapshots.length - 1) { setPlaying(false); return prev }
          return prev + 1
        })
      }, SPEEDS[speedIdx].ms)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, speedIdx, snapshots.length])

  const runVisualize = useCallback(async () => {
    setLoading(true)
    setError('')
    setSnapshots([])
    setCurrentStep(0)
    setPlaying(false)
    setHasRun(true)
    pointerColorMap.current = {}
    pointerColorIdx.current = 0
    try {
      const body = { code }
      if (customInput.trim()) body.customInput = customInput.trim()
      const res = await fetch('/api/dsa/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.snapshots?.length > 0) {
        // Pre-assign pointer colors
        for (const snap of data.snapshots) {
          if (snap.pointers) {
            Object.keys(snap.pointers).forEach(name => {
              if (!(name in pointerColorMap.current)) {
                pointerColorMap.current[name] = POINTER_COLORS[pointerColorIdx.current % POINTER_COLORS.length]
                pointerColorIdx.current++
              }
            })
          }
        }
        setSnapshots(data.snapshots)
      } else {
        setError('No array operations detected. Make sure your function uses list variables.')
      }
    } catch (e) {
      setError(`Failed: ${e.message}`)
    }
    setLoading(false)
  }, [code, customInput])

  const snap = snapshots[currentStep]

  // Primary array = largest
  const arrayEntries = snap ? Object.entries(snap.arrays) : []
  const primaryEntry = arrayEntries.length > 0
    ? arrayEntries.reduce((a, b) => b[1].length > a[1].length ? b : a)
    : null

  // ── Landing ──
  if (!hasRun) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 16,
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '.85rem' }}>Algorithm Visualizer</div>
        <div style={{ fontSize: '.72rem', fontFamily: 'monospace', marginBottom: 14, lineHeight: 1.6, opacity: .8 }}>
          Traces array mutations & pointer positions step-by-step.
        </div>

        <button
          onClick={() => setShowCustomInput(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '.66rem', color: stepColor || '#2563eb', marginBottom: 6,
            fontFamily: 'monospace', textDecoration: 'underline',
          }}
        >
          {showCustomInput ? 'Hide custom input' : 'Custom test input (optional)'}
        </button>

        {showCustomInput && (
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="e.g. [2, 0, 1, 2, 1, 0]"
            style={{
              width: '90%', maxWidth: 260, marginBottom: 10, padding: '5px 10px',
              fontSize: '.72rem', fontFamily: '"JetBrains Mono", monospace',
              borderRadius: 8, border: '1px solid rgba(163,177,198,0.3)',
              background: 'var(--neu-bg)', color: 'var(--neu-text-primary)',
            }}
          />
        )}

        <button
          className="btn btn-primary"
          onClick={runVisualize}
          disabled={loading}
          style={{ fontSize: '.82rem', padding: '8px 22px' }}
        >
          {loading ? '⏳ Tracing…' : '▶ Visualize'}
        </button>
      </div>
    )
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neu-text-secondary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>⏳</div>
        <div style={{ fontSize: '.78rem' }}>Tracing algorithm…</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>⚠️</div>
      <div style={{ fontSize: '.76rem', color: '#ef4444', marginBottom: 10, maxWidth: 260, lineHeight: 1.5 }}>
        {error.length > 200 ? error.slice(0, 200) + '…' : error}
      </div>
      <button className="btn btn-primary btn-sm" onClick={runVisualize}>Retry</button>
    </div>
  )

  if (snapshots.length === 0) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--neu-text-secondary)', textAlign: 'center', padding: 16 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🤷</div>
      <div style={{ fontSize: '.76rem', marginBottom: 10 }}>No array operations captured.</div>
      <button className="btn btn-primary btn-sm" onClick={runVisualize}>Re-run</button>
    </div>
  )

  // ── Visualization ──
  const arr = primaryEntry[1]
  const maxVal = Math.max(...arr.map(Math.abs), 1)
  const highlights = snap?.highlights?.[primaryEntry[0]] || []
  const highlightSet = new Set(highlights)
  const movedPtrs = new Set(snap?.movedPointers || [])
  const arrayChanged = snap?.arrayChanged ?? true

  // Group pointers by index for stacking
  const pointersByIdx = {}
  if (snap?.pointers) {
    Object.entries(snap.pointers).forEach(([name, idx]) => {
      if (idx < 0 || idx >= arr.length) return
      const key = String(idx)
      if (!pointersByIdx[key]) pointersByIdx[key] = []
      pointersByIdx[key].push(name)
    })
  }

  const ptrCount = snap?.pointers ? Object.keys(snap.pointers).length : 0
  const maxStack = Object.keys(pointersByIdx).length > 0
    ? Math.max(...Object.values(pointersByIdx).map(a => a.length))
    : 0

  // Step description
  let stepDesc = ''
  if (arrayChanged && highlights.length > 0) stepDesc = `Swap/set idx ${highlights.join(', ')}`
  else if (movedPtrs.size > 0) stepDesc = `${[...movedPtrs].join(', ')} moved`
  else if (currentStep === 0) stepDesc = 'Initial state'
  else stepDesc = 'No change'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '5px 0',
        borderBottom: '1px solid rgba(163,177,198,0.12)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <button onClick={() => { setCurrentStep(0); setPlaying(false) }} disabled={currentStep === 0} style={ctrlBtn} title="Reset">⏮</button>
        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0} style={ctrlBtn} title="Prev">◀</button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{ ...ctrlBtn, background: playing ? `${stepColor || '#2563eb'}22` : undefined, color: playing ? (stepColor || '#2563eb') : undefined }}
        >{playing ? '⏸' : '▶'}</button>
        <button onClick={() => setCurrentStep(s => Math.min(snapshots.length - 1, s + 1))} disabled={currentStep >= snapshots.length - 1} style={ctrlBtn} title="Next">▶</button>
        <button onClick={() => { setCurrentStep(snapshots.length - 1); setPlaying(false) }} disabled={currentStep >= snapshots.length - 1} style={ctrlBtn} title="End">⏭</button>

        <div style={{ width: 1, height: 14, background: 'rgba(163,177,198,0.15)', margin: '0 2px' }} />

        {SPEEDS.map((s, i) => (
          <button key={s.label} onClick={() => setSpeedIdx(i)} style={{
            ...ctrlBtn, fontSize: '.55rem', width: 24, height: 24,
            fontWeight: i === speedIdx ? 700 : 400,
            color: i === speedIdx ? (stepColor || '#2563eb') : 'var(--neu-text-secondary)',
            background: i === speedIdx ? `${stepColor || '#2563eb'}12` : undefined,
          }}>{s.label}</button>
        ))}

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '.58rem', fontFamily: 'monospace', color: 'var(--neu-text-secondary)' }}>
          {currentStep + 1}/{snapshots.length}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={runVisualize} style={{ fontSize: '.56rem', padding: '1px 6px' }}>↻</button>
      </div>

      {/* ── Slider ── */}
      <div style={{ padding: '3px 0 1px', flexShrink: 0 }}>
        <input type="range" min={0} max={snapshots.length - 1} value={currentStep}
          onChange={e => { setCurrentStep(Number(e.target.value)); setPlaying(false) }}
          style={{ width: '100%', accentColor: stepColor || '#2563eb', height: 3 }}
        />
      </div>

      {/* ── Main Viz Area (flex-grow) ── */}
      <div ref={barsRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

        {/* Array label */}
        <div style={{
          fontSize: '.58rem', fontWeight: 700, color: 'var(--neu-text-secondary)',
          fontFamily: 'monospace', padding: '4px 0 2px', flexShrink: 0,
          textTransform: 'uppercase', letterSpacing: '.04em',
        }}>
          {primaryEntry[0]}[{arr.length}]{snap.line ? ` · L${snap.line}` : ''}
        </div>

        {/* Bars + Values — fills all available space */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'flex-end',
          gap: arr.length > 30 ? 1 : arr.length > 15 ? 2 : 3,
          padding: '0 2px', minHeight: 40,
        }}>
          {arr.map((val, i) => {
            // Use percentage of flex container height
            // For small ranges (0-2), ensure minimum differentiation
            const barPct = maxVal === 0 ? 50 : Math.max(8, (Math.abs(val) / maxVal) * 100)
            const isHighlighted = highlightSet.has(i)
            const isPointed = snap.pointers && Object.values(snap.pointers).includes(i)
            const isMoved = isPointed && Object.entries(snap.pointers).some(
              ([name, idx]) => idx === i && movedPtrs.has(name)
            )

            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                maxWidth: 48, minWidth: 0, height: '100%', justifyContent: 'flex-end',
              }}>
                {/* Value on top of bar */}
                {arr.length <= 25 && (
                  <div style={{
                    fontSize: arr.length <= 10 ? '.7rem' : '.58rem',
                    fontFamily: 'monospace', marginBottom: 2, lineHeight: 1,
                    color: isHighlighted ? (stepColor || '#2563eb') : 'var(--neu-text-secondary)',
                    fontWeight: isHighlighted ? 800 : 500,
                  }}>
                    {val}
                  </div>
                )}
                {/* Bar */}
                <div style={{
                  width: '100%',
                  height: `${barPct}%`,
                  minHeight: 6,
                  borderRadius: '4px 4px 0 0',
                  background: isHighlighted
                    ? `linear-gradient(180deg, ${stepColor || '#2563eb'}, ${stepColor || '#2563eb'}99)`
                    : isMoved
                      ? `${stepColor || '#2563eb'}55`
                      : isPointed
                        ? `${stepColor || '#2563eb'}30`
                        : 'rgba(163,177,198,0.28)',
                  transition: 'height .2s ease, background .15s ease',
                  boxShadow: isHighlighted ? `0 0 10px ${stepColor || '#2563eb'}40` : 'none',
                }} />
              </div>
            )
          })}
        </div>

        {/* Index row */}
        {arr.length <= 30 && (
          <div style={{
            display: 'flex', gap: arr.length > 15 ? 2 : 3,
            padding: '1px 2px', flexShrink: 0,
          }}>
            {arr.map((_, i) => (
              <div key={i} style={{
                flex: 1, maxWidth: 48, textAlign: 'center',
                fontSize: '.46rem', fontFamily: 'monospace',
                color: highlightSet.has(i) ? (stepColor || '#2563eb') : 'rgba(163,177,198,0.45)',
              }}>
                {i}
              </div>
            ))}
          </div>
        )}

        {/* Pointer arrows — group overlapping pointers */}
        {ptrCount > 0 && (
          <div style={{
            flexShrink: 0, position: 'relative',
            height: 14 + maxStack * 12,
            margin: '2px 2px 0',
          }}>
            {Object.entries(pointersByIdx).map(([idxStr, names]) => {
              const idx = Number(idxStr)
              const pct = arr.length > 1 ? (idx / (arr.length - 1)) * 100 : 50

              return (
                <div key={idxStr} style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: 'left .2s ease',
                  top: 0,
                }}>
                  <div style={{
                    fontSize: '.5rem', lineHeight: 1,
                    color: pointerColorMap.current[names[0]] || '#2563eb',
                  }}>▲</div>
                  {names.map((name) => {
                    const pColor = pointerColorMap.current[name] || '#2563eb'
                    const moved = movedPtrs.has(name)
                    return (
                      <div key={name} style={{
                        fontSize: '.5rem', fontWeight: 700, fontFamily: 'monospace',
                        color: pColor, whiteSpace: 'nowrap', lineHeight: 1.3,
                        background: moved ? `${pColor}22` : `${pColor}0a`,
                        padding: '0 3px', borderRadius: 2,
                        border: moved ? `1px solid ${pColor}40` : '1px solid transparent',
                      }}>
                        {name}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* Secondary arrays */}
        {arrayEntries.length > 1 && arrayEntries
          .filter(([name]) => name !== primaryEntry[0])
          .map(([name, secArr]) => {
            const secMax = Math.max(...secArr.map(Math.abs), 1)
            const secHL = new Set(snap?.highlights?.[name] || [])
            return (
              <div key={name} style={{ marginTop: 8, flexShrink: 0 }}>
                <div style={{ fontSize: '.54rem', fontWeight: 700, color: 'var(--neu-text-secondary)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 2 }}>
                  {name}[{secArr.length}]
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: secArr.length > 30 ? 1 : 2, height: 40, padding: '0 2px' }}>
                  {secArr.map((val, i) => (
                    <div key={i} style={{
                      flex: 1, maxWidth: 40,
                      height: `${Math.max(8, (Math.abs(val) / secMax) * 100)}%`,
                      minHeight: 3, borderRadius: '2px 2px 0 0',
                      background: secHL.has(i) ? (stepColor || '#2563eb') : 'rgba(163,177,198,0.22)',
                      transition: 'height .15s ease',
                    }} />
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid rgba(163,177,198,0.12)',
        padding: '4px 0', flexShrink: 0,
        fontSize: '.58rem', fontFamily: 'monospace',
        color: 'var(--neu-text-secondary)', lineHeight: 1.4,
        display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
      }}>
        <span style={{
          background: arrayChanged && highlights.length > 0
            ? `${stepColor || '#2563eb'}15`
            : movedPtrs.size > 0 ? 'rgba(234,88,12,0.1)' : 'rgba(163,177,198,0.08)',
          color: arrayChanged && highlights.length > 0
            ? (stepColor || '#2563eb')
            : movedPtrs.size > 0 ? '#ea580c' : 'var(--neu-text-secondary)',
          padding: '1px 5px', borderRadius: 3, fontWeight: 600,
        }}>
          {stepDesc}
        </span>
        {ptrCount > 0 && (
          <span>
            {Object.entries(snap.pointers).map(([n, v]) => {
              const pc = pointerColorMap.current[n] || '#2563eb'
              return (
                <span key={n} style={{ color: pc, fontWeight: movedPtrs.has(n) ? 700 : 400, marginRight: 5 }}>
                  {n}={v}
                </span>
              )
            })}
          </span>
        )}
      </div>
    </div>
  )
}

const ctrlBtn = {
  width: 24, height: 24, borderRadius: '50%', border: 'none',
  background: 'var(--neu-bg)', cursor: 'pointer',
  color: 'var(--neu-text-secondary)', fontSize: '.64rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)',
}
