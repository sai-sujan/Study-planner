import { useState, useEffect } from 'react'

const FEATHER = '𑁍' // Krishna's peacock feather — using decorative Vedic symbol
// Fallback: we'll use a styled peacock feather via CSS + emoji combo

const AFFIRMATIONS = {
  dsa: [
    "Every problem you solve today is one fewer in your interview. You're getting stronger.",
    "Struggle is growth. If it feels hard, that means you're learning.",
    "Think step by step. Break it down. You've solved harder things before.",
    "Future you will crush interviews because present you is putting in the work right now.",
    "You're not just coding — you're training your engineering mind for the career you deserve.",
    "One problem at a time. One pattern at a time. That's how champions are built.",
    "I am becoming a world-class problem solver. Every problem sharpens me.",
    "This code I write today is building the career I want tomorrow.",
  ],
  genai: [
    "You're learning the most in-demand skill in tech right now. This knowledge changes everything.",
    "Read to understand, not to finish. Depth beats speed. You're building real expertise.",
    "Imagine explaining this confidently in an interview. That's exactly where you're headed.",
    "Every concept you absorb today is ammunition for your interviews. Keep going.",
    "AI engineering is your future. Every minute you spend here is an investment in yourself.",
    "This knowledge compounds. Today's reading powers tomorrow's breakthroughs.",
    "I am becoming the AI engineer companies fight to hire.",
  ],
  python: [
    "Python mastery = career leverage. Every line you write opens doors.",
    "You're sharpening the tool you'll use every single day as an engineer.",
    "Practice makes permanent. You're wiring these patterns into your brain right now.",
    "Code with intention. Understand the why, not just the how. That's what sets you apart.",
    "Strong Python skills open every door in AI/ML. You're building that strength right now.",
    "I am disciplined. I am consistent. That is why I will succeed.",
  ],
  study: [
    "This session is making you a stronger AI/Data Science engineer. Stay focused.",
    "You don't need to be perfect. You just need to understand and improve. That's enough.",
    "I'm learning this so I can explain it in an interview. That's the mindset.",
    "Every hour you invest now saves you months of struggle later. This is worth it.",
    "You're not just studying — you're building the career you've always wanted.",
    "I learn fast. I work hard. I stay focused. This is my time.",
  ],
  prep: [
    "Preparation is where confidence is built. You're doing the work most people skip.",
    "When interview day comes, you'll be ready because you prepared today.",
    "Every task you complete here gets you one step closer to your dream job.",
    "I am exactly where I need to be. My preparation is my power.",
  ],
  emotions: [
    "Stay calm. A focused mind is more powerful than a frustrated one.",
    "Control your reactions. That's the sign of a strong engineer and a strong person.",
    "Patience is not waiting — it's staying calm while working hard.",
    "Your calmness is your superpower. Protect your inner peace.",
    "Emotions are signals, not commands. Acknowledge them, then choose wisely.",
    "Discipline your emotions and your results will follow.",
  ],
}

export default function AffirmationBanner({ context = 'general' }) {
  const [affirmation, setAffirmation] = useState(null)

  useEffect(() => {
    // ~25% chance to show an emotional control quote instead
    const pool = Math.random() < 0.25
      ? AFFIRMATIONS.emotions
      : (AFFIRMATIONS[context] || AFFIRMATIONS.study)
    setAffirmation(pool[Math.floor(Math.random() * pool.length)])
  }, [context])

  if (!affirmation) return null

  return (
    <div className="affirmation-banner">
      <img src="/buddy-icons/peacock_feather.png" alt="" className="affirmation-feather" style={{ transform: 'scaleX(-1)' }} />
      <span>{affirmation}</span>
      <img src="/buddy-icons/peacock_feather.png" alt="" className="affirmation-feather" />
    </div>
  )
}
