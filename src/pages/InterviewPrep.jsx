import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DOCS = [
  {
    id: 'technical',
    file: '/docs/01_technical_interview_qa.md',
    icon: '🧠',
    title: 'Technical Interview Q&A',
    subtitle: '50 questions — RAG, Fine-tuning, Agents, Prompt Eng, MLOps, System Design',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.12)',
    tags: ['RAG', 'Fine-tuning', 'Agents', 'Prompt Eng', 'MLOps', 'System Design', 'Responsible AI'],
  },
  {
    id: 'behavioral',
    file: '/docs/02_experience_behavioral_qa.md',
    icon: '💬',
    title: 'Experience & Behavioral Q&A',
    subtitle: 'Tell me about yourself, STAR stories, tricky questions',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.12)',
    tags: ['Intro Pitch', 'Compass Group', 'Grootan', 'Behavioral', 'STAR', 'Gaps'],
  },
  {
    id: 'projects',
    file: '/docs/03_project_stories_architecture.md',
    icon: '🏗️',
    title: 'Project Stories & Architecture',
    subtitle: 'Deep dive: architecture, decisions, impact, lessons learned',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.12)',
    tags: ['Multi-Agent', 'Hybrid RAG', 'ID Auth', 'Credit Default', 'Cross-Project Patterns'],
  },
]

export { DOCS }

export default function InterviewPrep() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Back */}
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => navigate('/genai')}
        style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        ← Back to Roadmap
      </button>

      {/* Header */}
      <div style={{
        background: 'var(--neu-bg)', borderRadius: 24, padding: '28px 32px', marginBottom: 28,
        boxShadow: '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)',
        borderLeft: '5px solid #7c3aed',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(124,58,237,0.08)', filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem',
            background: 'var(--neu-bg)',
            boxShadow: 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)',
          }}>
            🎯
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-.03em', color: '#7c3aed', margin: 0 }}>
              Interview Questions on Resume
            </h1>
            <div style={{ fontSize: '.8rem', color: 'var(--neu-text-secondary)', marginTop: 4, fontFamily: 'monospace' }}>
              3 sections · Technical · Behavioral · Project Stories
            </div>
          </div>
        </div>
      </div>

      {/* Practice Simulator CTA */}
      <div
        onClick={() => navigate('/practice')}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          borderRadius: 20, padding: '22px 28px', marginBottom: 24,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '6px 6px 16px rgba(124,58,237,0.3), -4px -4px 12px var(--neu-shadow-light)',
          transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem' }}>🎙️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Interview Practice Simulator</div>
          <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            Practice with camera + mic · AI confidence analysis · Real-time feedback
          </div>
        </div>
        <div style={{ marginLeft: 'auto', color: '#fff', fontSize: '1.4rem' }}>→</div>
      </div>

      {/* Doc cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DOCS.map(doc => (
          <div
            key={doc.id}
            onClick={() => navigate(`/interview/${doc.id}`)}
            style={{
              background: 'var(--neu-bg)', borderRadius: 20, padding: '24px 28px',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
              borderLeft: `4px solid ${doc.color}`,
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '8px 8px 20px var(--neu-shadow-dark), -8px -8px 20px var(--neu-shadow-light)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)' }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 120, height: 120, borderRadius: '50%',
              background: doc.bg, filter: 'blur(30px)', pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, position: 'relative' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                background: doc.bg,
                boxShadow: `0 0 0 2px ${doc.color}33`,
              }}>
                {doc.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: doc.color }}>
                  {doc.title}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--neu-text-secondary)', marginTop: 2 }}>
                  {doc.subtitle}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', color: doc.color, fontSize: '1.2rem', opacity: 0.5 }}>→</div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, position: 'relative' }}>
              {doc.tags.map(tag => (
                <span key={tag} style={{
                  background: doc.bg, color: doc.color,
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: '.68rem', fontWeight: 600, fontFamily: 'monospace',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
