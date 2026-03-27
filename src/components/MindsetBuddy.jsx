import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

// ── Affirmation Data ─────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { emoji: '😴', label: 'Tired', level: 1 },
  { emoji: '😟', label: 'Stressed', level: 2 },
  { emoji: '😐', label: 'Okay', level: 3 },
  { emoji: '🙂', label: 'Good', level: 4 },
  { emoji: '😊', label: 'Great', level: 5 },
  { emoji: '🔥', label: 'On Fire', level: 6 },
]

const CONTEXT_AFFIRMATIONS = {
  dsa: [
    "Every problem you solve today is one fewer in your interview.",
    "Struggle = growth. This is exactly how you get better.",
    "Think step by step. Break it down. You've got this.",
    "You're not just solving a problem — you're training your engineering brain.",
    "Future you will crush interviews because present you is putting in the work.",
    "One problem at a time. That's all it takes.",
    "This is your path to becoming a strong engineer. Keep going.",
    "Don't rush the solution. Understand it. That's what sticks.",
    "I am becoming a world-class problem solver. Every problem sharpens me.",
    "This code I write today is building the career I want tomorrow.",
  ],
  genai: [
    "You're learning the most in-demand skill in tech right now.",
    "Every concept you absorb today is ammunition for your interviews.",
    "Read to understand, not to finish. Depth beats speed.",
    "You're building the knowledge that will set you apart.",
    "AI engineering is your future. This reading is an investment.",
    "Imagine explaining this confidently in an interview. That's where you're headed.",
    "Stay curious. The best engineers never stop learning.",
    "This knowledge compounds. Today's reading powers tomorrow's breakthroughs.",
    "I attract opportunities because I am prepared. My skills grow every day.",
    "I am becoming the AI engineer companies fight to hire.",
  ],
  python: [
    "Python mastery = career leverage. Every line you write matters.",
    "You're sharpening the tool you'll use every day as an engineer.",
    "Code with intention. Understand why, not just how.",
    "Strong Python skills open every door in AI/ML. Keep building.",
    "Practice makes permanent. You're wiring this into your brain.",
    "Write it, run it, break it, fix it. That's how you learn.",
    "I am disciplined. I am consistent. That is why I will succeed.",
    "My Python skills are growing stronger with every session.",
  ],
  study: [
    "This session is making you a stronger AI/Data Science engineer.",
    "You're focused, and you're getting better right now.",
    "I'm learning this so I can explain it in an interview.",
    "Show up. Stay focused. The results will follow.",
    "Every hour you invest now saves you months of struggle later.",
    "You're not just studying — you're building your dream career.",
    "I don't need to be perfect. I just need to understand and improve.",
    "I learn fast. I work hard. I stay focused. This is my time.",
  ],
  prep: [
    "Preparation is where confidence is built. You're doing the work most people skip.",
    "When interview day comes, you'll be ready because you prepared today.",
    "Every task you complete here gets you one step closer to your dream job.",
    "I am exactly where I need to be. My preparation is my power.",
  ],
  general: [
    "You showed up today. That already puts you ahead.",
    "Small consistent effort beats occasional bursts. You're on track.",
    "Trust the process. Your hard work is compounding.",
    "Today's discipline is tomorrow's freedom.",
    "You're doing what most people only talk about.",
    "Stay the course. Great things take time.",
    "I attract opportunities because I am prepared.",
    "My dream job is already on its way to me.",
    "Control your emotions. They are tools, not your master.",
    "A calm mind solves problems faster than a stressed one.",
    "Breathe. Reset. Respond, don't react. That's true strength.",
  ],
  emotions: [
    "Your emotions are valid, but they don't control you. You choose how to respond.",
    "Stay calm. A focused mind is more powerful than a frustrated one.",
    "When frustration rises, pause. Breathe. Then continue with clarity.",
    "Control your reactions. That's the sign of a strong engineer and a strong person.",
    "Don't let a hard problem steal your peace. Step back, then step forward.",
    "Patience is not waiting — it's staying calm while working hard.",
    "Emotions are signals, not commands. Acknowledge them, then choose wisely.",
    "A moment of anger can undo hours of progress. Stay composed.",
    "The best engineers are emotionally intelligent. Master your mind, master your craft.",
    "Frustration means you care. Channel it into persistence, not panic.",
    "Stay even-tempered. Your calmness is your superpower.",
    "When things go wrong, breathe. Every setback is a setup for a comeback.",
    "You are bigger than any emotion you feel right now. Rise above it.",
    "Inner peace is the foundation of outer success. Protect it.",
    "Discipline your emotions and your results will follow.",
  ],
}

const MANIFEST_SENTENCES = [
  "I am becoming a world-class AI engineer.",
  "I solve hard problems with clarity and confidence.",
  "I am disciplined. I am consistent. I am unstoppable.",
  "My dream job is already on its way to me.",
  "I attract opportunities because I am prepared.",
  "My skills grow stronger every single day.",
  "I am exactly where I need to be right now.",
  "I learn fast. I work hard. I stay focused.",
  "I am becoming the engineer companies fight to hire.",
  "Every session brings me closer to my goal.",
  "I don't compare. I don't rush. I trust my process.",
  "Results are inevitable when I put in the work.",
  "I show up when it's hard. That is why I will succeed.",
  "This is my time. I am building something great.",
  "Confidence comes from preparation, and I am preparing every day.",
  "I am capable of achieving anything I set my mind to.",
  "The universe is aligning opportunities for me right now.",
  "I radiate confidence, skill, and determination.",
  "I am in control of my emotions. They serve me, not the other way around.",
  "I respond with calmness. I act with intention. I am unshakable.",
  "My peace of mind is non-negotiable. I protect it fiercely.",
  "I stay calm under pressure. That is my greatest strength.",
  "I master my emotions so I can master my life.",
]

const MOOD_RESPONSES = {
  1: [
    "Rest is part of the process. Even a short focused session counts.",
    "You showed up even when tired. That's discipline. Do what you can.",
    "10 focused minutes > 0 minutes. Start small, see what happens.",
  ],
  2: [
    "Take a breath. You don't need to be perfect. Just improve.",
    "Stress means you care. Channel it into one small task.",
    "Break it down. One thing at a time. You've handled harder.",
  ],
  3: [
    "Good enough to start. Momentum will carry you forward.",
    "Okay is fine. Let's turn it into a productive session.",
    "You're here, you're ready. Let's make some progress.",
  ],
  4: [
    "Great energy! Channel this into deep work.",
    "You're in a good spot. Make this session count!",
    "Feeling good + focused effort = real progress. Let's go.",
  ],
  5: [
    "Love this energy! Time to crush it.",
    "This is your moment. Dive deep and learn something amazing.",
    "Great mood = great output. Make the most of this!",
  ],
  6: [
    "🔥 Unstoppable! Push your limits today.",
    "This is the energy that builds careers. Go all in!",
    "You're ON. This is when breakthroughs happen!",
  ],
}

const CHECKIN_QUESTIONS = [
  "Hey! How are you feeling right now?",
  "Quick check-in — how's your energy?",
  "How are you doing? Let me know.",
  "Taking a moment — how do you feel?",
  "Checking in on you. How's the vibe?",
]

// Custom icons — place your images in public/buddy-icons/
const BUDDY_ICONS = [
  '/buddy-icons/icon1.png',
  '/buddy-icons/icon2.png',
  '/buddy-icons/icon3.png',
]

const STORAGE_KEY = 'dp_mindset_buddy_v1'

function loadBuddyData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { moods: [], lastCheckin: 0 } }
  catch { return { moods: [], lastCheckin: 0 } }
}

function saveBuddyData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getContext(pathname) {
  if (pathname.startsWith('/dsa')) return 'dsa'
  if (pathname.startsWith('/genai') || pathname.startsWith('/blogs')) return 'genai'
  if (pathname.startsWith('/python')) return 'python'
  if (pathname.startsWith('/study')) return 'study'
  if (pathname.startsWith('/prep')) return 'prep'
  return 'general'
}

function formatTime(ts) {
  const d = new Date(ts)
  const h = d.getHours(), m = d.getMinutes()
  return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MindsetBuddy() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [pulse, setPulse] = useState(false)
  const [buddyData, setBuddyData] = useState(loadBuddyData)
  const [waitingMood, setWaitingMood] = useState(false)
  const [popupText, setPopupText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const chatEndRef = useRef(null)
  const timerRef = useRef(null)
  const popupTimerRef = useRef(null)
  const lastContextRef = useRef('')
  const hasGreetedRef = useRef(false)

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight
    }
  }, [messages, open])

  // Cycle through custom icons
  const [iconIdx, setIconIdx] = useState(0)
  const [iconLoaded, setIconLoaded] = useState([false, false, false])

  useEffect(() => {
    // Preload icons and track which ones exist
    BUDDY_ICONS.forEach((src, i) => {
      const img = new Image()
      img.onload = () => setIconLoaded(prev => { const n = [...prev]; n[i] = true; return n })
      img.src = src
    })
  }, [])

  // Rotate icon every 45 seconds
  useEffect(() => {
    const available = BUDDY_ICONS.map((_, i) => i).filter(i => iconLoaded[i])
    if (available.length <= 1) return
    const intv = setInterval(() => {
      setIconIdx(prev => {
        const avail = BUDDY_ICONS.map((_, i) => i).filter(i => iconLoaded[i])
        if (avail.length === 0) return 0
        const currentPos = avail.indexOf(prev)
        return avail[(currentPos + 1) % avail.length]
      })
    }, 45000)
    return () => clearInterval(intv)
  }, [iconLoaded])

  const hasCustomIcon = iconLoaded.some(Boolean)

  // Auto-popup affirmation on every page change
  useEffect(() => {
    const ctx = getContext(location.pathname)
    const pool = [...(CONTEXT_AFFIRMATIONS[ctx] || CONTEXT_AFFIRMATIONS.general)]
    // Mix in manifest + emotional control sentences
    const r = Math.random()
    let text
    if (r < 0.4) text = pick(pool)
    else if (r < 0.7) text = pick(MANIFEST_SENTENCES)
    else text = pick(CONTEXT_AFFIRMATIONS.emotions)

    // Show popup bubble from the feather
    clearTimeout(popupTimerRef.current)
    setTimeout(() => {
      setPopupText(text)
      setShowPopup(true)
      // Auto-hide after 6 seconds
      popupTimerRef.current = setTimeout(() => setShowPopup(false), 6000)
    }, 1200)

    // Also add to chat if context changed
    if (ctx !== lastContextRef.current && ctx !== 'general') {
      lastContextRef.current = ctx
      const labels = { dsa: 'DSA Problem Solving', genai: 'Gen AI Learning', python: 'Python Practice', study: 'Study Session', prep: 'Interview Prep' }
      setTimeout(() => {
        setMessages(prev => [...prev, {
          from: 'buddy',
          text: `📍 ${labels[ctx]}\n\n${text}`,
          time: Date.now(),
          type: 'affirmation',
        }])
      }, 1500)
    }

    return () => clearTimeout(popupTimerRef.current)
  }, [location.pathname])

  // Initial greeting
  useEffect(() => {
    if (hasGreetedRef.current) return
    hasGreetedRef.current = true
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const now = Date.now()
    const data = loadBuddyData()
    const hoursSince = (now - (data.lastCheckin || 0)) / 3600000

    setTimeout(() => {
      setMessages([{
        from: 'buddy',
        text: `${greeting}! 🌟 Ready to make progress today?`,
        time: now,
      }])

      if (hoursSince > 2) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            from: 'buddy',
            text: pick(CHECKIN_QUESTIONS),
            time: Date.now(),
            type: 'checkin',
          }])
          setWaitingMood(true)
          setPulse(true)
        }, 5000)
      }
    }, 2000)
  }, [])

  // Periodic manifesting nudges every 20-30 min
  useEffect(() => {
    const scheduleNudge = () => {
      const delay = (20 + Math.random() * 10) * 60 * 1000
      timerRef.current = setTimeout(() => {
        const manifest = pick(MANIFEST_SENTENCES)
        setPopupText(manifest)
        setShowPopup(true)
        popupTimerRef.current = setTimeout(() => setShowPopup(false), 6000)

        setMessages(prev => [...prev, {
          from: 'buddy',
          text: `✨ ${manifest}`,
          time: Date.now(),
          type: 'manifest',
        }])
        setPulse(true)
        scheduleNudge()
      }, delay)
    }
    scheduleNudge()
    return () => clearTimeout(timerRef.current)
  }, [])

  // Periodic mood check-in every 90 min
  useEffect(() => {
    const checkinInterval = setInterval(() => {
      const data = loadBuddyData()
      const hoursSince = (Date.now() - (data.lastCheckin || 0)) / 3600000
      if (hoursSince >= 1.5 && !waitingMood) {
        setMessages(prev => [...prev, {
          from: 'buddy',
          text: pick(CHECKIN_QUESTIONS),
          time: Date.now(),
          type: 'checkin',
        }])
        setWaitingMood(true)
        setPulse(true)
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(checkinInterval)
  }, [waitingMood])

  const handleMoodSelect = useCallback((mood) => {
    const now = Date.now()
    setMessages(prev => [...prev, {
      from: 'user',
      text: `${mood.emoji} ${mood.label}`,
      time: now,
    }])

    const data = loadBuddyData()
    data.moods.push({ level: mood.level, label: mood.label, time: now })
    if (data.moods.length > 100) data.moods = data.moods.slice(-100)
    data.lastCheckin = now
    saveBuddyData(data)
    setBuddyData(data)
    setWaitingMood(false)

    setTimeout(() => {
      const response = pick(MOOD_RESPONSES[mood.level] || MOOD_RESPONSES[3])
      setMessages(prev => [...prev, {
        from: 'buddy',
        text: response,
        time: Date.now(),
      }])
    }, 600)
  }, [])

  const requestAffirmation = useCallback(() => {
    const ctx = getContext(location.pathname)
    setMessages(prev => [...prev,
      { from: 'user', text: 'Motivate me 💪', time: Date.now() },
    ])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'buddy',
        text: pick(CONTEXT_AFFIRMATIONS[ctx]),
        time: Date.now(),
        type: 'affirmation',
      }])
    }, 400)
  }, [location.pathname])

  const requestManifest = useCallback(() => {
    const manifests = [
      "I am becoming a world-class AI engineer.\nI solve hard problems with clarity.\nI am confident, focused, and unstoppable.",
      "I attract opportunities because I am prepared.\nMy skills grow stronger every single day.\nI am exactly where I need to be.",
      "I am disciplined. I am consistent.\nI show up when it's hard.\nThat is why I will succeed.",
      "My dream job is already on its way to me.\nI am building the skills to deserve it.\nEvery session brings me closer.",
      "I learn fast. I work hard. I stay focused.\nI am becoming the engineer companies fight to hire.\nThis is my time.",
      "I don't compare. I don't rush.\nI trust my process and put in the work.\nResults are inevitable.",
    ]
    setMessages(prev => [...prev,
      { from: 'user', text: 'Help me manifest ✨', time: Date.now() },
    ])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'buddy',
        text: `✨ Close your eyes for 5 seconds. Breathe. Then read this slowly:\n\n${pick(manifests)}`,
        time: Date.now(),
        type: 'manifest',
      }])
    }, 500)
  }, [])

  const todaysMoods = buddyData.moods?.filter(m => {
    const d = new Date(m.time)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }) || []

  return (
    <>
      {/* Auto-popup bubble — shows on page change */}
      {showPopup && !open && (
        <div className="mindset-popup" onClick={() => { setShowPopup(false); setOpen(true) }}>
          <div className="mindset-popup-text">{popupText}</div>
          <div className="mindset-popup-arrow" />
        </div>
      )}

      {/* Floating feather button */}
      <button
        className={`mindset-fab${pulse && !open ? ' pulse' : ''}`}
        onClick={() => { setOpen(o => !o); setPulse(false); setShowPopup(false) }}
        title="Mindset Buddy"
      >
        {open ? '✕' : hasCustomIcon ? (
          <img
            src={BUDDY_ICONS[iconIdx]}
            alt=""
            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', transition: 'opacity .3s' }}
          />
        ) : (
          <span style={{ filter: 'hue-rotate(120deg) saturate(1.5)' }}>🪶</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="mindset-panel">
          {/* Header */}
          <div className="mindset-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem', filter: 'hue-rotate(120deg) saturate(1.5)' }}>🪶</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.85rem' }}>Mindset Buddy</div>
                <div style={{ fontSize: '.65rem', opacity: 0.7 }}>Your focus & motivation companion</div>
              </div>
            </div>
            {todaysMoods.length > 0 && (
              <div style={{ fontSize: '.65rem', opacity: 0.8 }}>
                Today: {todaysMoods.map((m, i) => (
                  <span key={i} title={`${m.label} at ${formatTime(m.time)}`}>
                    {MOOD_OPTIONS.find(o => o.level === m.level)?.emoji || '😐'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="mindset-messages" ref={chatEndRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`mindset-msg ${msg.from}${msg.type === 'manifest' ? ' manifest' : ''}${msg.type === 'affirmation' ? ' affirmation' : ''}`}>
                <div className="mindset-msg-text">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>
                      {line.startsWith('📍 ')
                        ? <strong>{line}</strong>
                        : line}
                      {j < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <div className="mindset-msg-time">{formatTime(msg.time)}</div>
              </div>
            ))}

            {/* Mood picker */}
            {waitingMood && (
              <div className="mindset-mood-picker">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.level}
                    className="mindset-mood-btn"
                    onClick={() => handleMoodSelect(m)}
                    title={m.label}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{m.emoji}</span>
                    <span style={{ fontSize: '.55rem', fontWeight: 600 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="mindset-actions">
            <button onClick={requestAffirmation} className="mindset-action-btn">
              💪 Motivate me
            </button>
            <button onClick={requestManifest} className="mindset-action-btn manifest">
              ✨ Manifest
            </button>
            <button onClick={() => {
              setMessages(prev => [...prev, {
                from: 'buddy',
                text: pick(CHECKIN_QUESTIONS),
                time: Date.now(),
                type: 'checkin',
              }])
              setWaitingMood(true)
            }} className="mindset-action-btn">
              🫀 Check-in
            </button>
          </div>
        </div>
      )}
    </>
  )
}
