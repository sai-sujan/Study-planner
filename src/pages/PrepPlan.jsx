import { useState, useEffect } from 'react'
import { trackMeta, trackOrder, DAILY_LIFE, STORAGE_KEY, loadChecks, taskId } from '../data/prepData'

/* ─── THE PLAN (exported for dashboard) ─── */
/* DSA follows Striver's A2Z DSA Sheet (takeuforward.org)
   Weekdays (Mon–Fri): DSA + System Design only
   Weekends (Sat–Sun): DSA + System Design + Gen AI + DS Revision */
export const PLAN = [
  {
    week: 0, subtitle: "Pre-work — Striver Step 1 Basics (completed)",
    days: [
      { day:0, label:"Wednesday", theme:"Striver Step 1 — Patterns (16/16 done)", tasks:[
        {track:"dsa",text:"Pattern 1–4: Square, triangle, right-angle, inverted",sub:"Striver A2Z Step 1 — nested loops basics",time:"30m"},
        {track:"dsa",text:"Pattern 5–8: Inverted numbered, pyramid, diamond start",sub:"Striver A2Z Step 1 — symmetry patterns",time:"30m"},
        {track:"dsa",text:"Pattern 9–12: Half diamond, number pyramid, binary",sub:"Striver A2Z Step 1 — number-based patterns",time:"30m"},
        {track:"dsa",text:"Pattern 13–16: Increasing letters, reverse letters, alpha triangle, butterfly",sub:"Striver A2Z Step 1 — character patterns",time:"30m"},
      ]},
    ]
  },
  {
    week: 1, subtitle: "Foundation Sprint — Striver Arrays/LL + System Design",
    days: [
      { day:1, label:"Thursday", theme:"Striver Arrays I + ML Systems Intro", tasks:[
        {track:"dsa",text:"Sort an array of 0s, 1s, 2s (Striver A2Z Step 3.1)",sub:"Dutch National Flag — 3 pointer approach",time:"25m"},
        {track:"dsa",text:"Next Permutation (Striver A2Z Step 3.2)",sub:"Medium — find breakpoint + swap + reverse",time:"30m"},
        {track:"dsa",text:"Kadane's Algorithm — Max Subarray Sum (#53)",sub:"Striver A2Z Step 3.2 — track maxEnding",time:"25m"},
        {track:"dsa",text:"Set Matrix Zeros (#73)",sub:"Striver A2Z Step 3.1 — in-place using 1st row/col as markers",time:"30m"},
        {track:"sys",text:"Read Chip Huyen — Ch 1: Overview of ML Systems",sub:"Book: Designing ML Systems",time:"60m"},
        {track:"sys",text:"Study: How Pinterest's visual search works",sub:"Search 'Pinterest Visual Search engineering blog'",time:"60m"},
      ]},
      { day:2, label:"Friday", theme:"Striver Arrays II + Visual Search Design", tasks:[
        {track:"dsa",text:"🔁 Redo Set Matrix Zeros & Kadane's from memory",sub:"Revision: Day 1 — timed 10 min each",time:"20m"},
        {track:"dsa",text:"Best Time to Buy/Sell Stock (#121)",sub:"Striver A2Z Step 3.2 — track min price so far",time:"25m"},
        {track:"dsa",text:"Rotate Matrix by 90 degrees (#48)",sub:"Striver A2Z Step 3.2 — transpose then reverse rows",time:"25m"},
        {track:"dsa",text:"Merge Overlapping Intervals (#56)",sub:"Striver A2Z Step 3.2 — sort by start, merge",time:"35m"},
        {track:"sys",text:"🔁 Re-summarise Ch 1 key concepts from yesterday",sub:"Revision: write 5 takeaways from memory",time:"15m"},
        {track:"sys",text:"Design a visual search system (Pinterest Lens)",sub:"Candidate generation, reranking, A/B testing layer",time:"75m"},
      ]},
      { day:3, label:"Saturday", theme:"Striver Arrays III + Attention/BERT + DS Fundamentals", tasks:[
        {track:"dsa",text:"🔁 Redo Merge Intervals & Rotate Matrix from memory",sub:"Revision: Day 2 — 15 min total, no hints",time:"15m"},
        {track:"dsa",text:"Majority Element (#169)",sub:"Striver A2Z Step 3.2 — Moore's Voting Algorithm",time:"20m"},
        {track:"dsa",text:"Two Sum (#1)",sub:"Striver A2Z Step 3.1 — hashmap pattern",time:"20m"},
        {track:"dsa",text:"3Sum (#15)",sub:"Striver A2Z Step 3.2 — sort + two pointer, skip duplicates",time:"40m"},
        {track:"dsa",text:"Longest Consecutive Sequence (#128)",sub:"Striver A2Z Step 3.2 — HashSet, find sequence starts",time:"30m"},
        {track:"gen",text:"Read 'Attention is All You Need' (Vaswani 2017)",sub:"Focus: self-attention, Q/K/V matrices",time:"60m"},
        {track:"gen",text:"Implement scaled dot-product attention in Python",sub:"Just the math, no framework",time:"45m"},
        {track:"gen",text:"Study BERT architecture in depth",sub:"Pre-training objectives: MLM + NSP",time:"60m"},
        {track:"gen",text:"Compare BERT vs GPT: bidirectional vs causal",sub:"Write a 1-page comparison note",time:"30m"},
        {track:"sys",text:"🔁 Redo Pinterest visual search design (timed 20 min)",sub:"Revision: Day 2 — no notes, just draw the pipeline",time:"20m"},
        {track:"ds",text:"Revise: Bias-variance tradeoff + overfitting",sub:"Write 5 bullet points from memory",time:"30m"},
        {track:"ds",text:"Revise: Precision, Recall, F1, ROC-AUC",sub:"Know when to use each metric",time:"25m"},
        {track:"ds",text:"Revise: L1 vs L2 regularization, dropout",sub:"Explain each in 2 sentences",time:"20m"},
      ]},
      { day:4, label:"Sunday", theme:"Striver LL I + GPT/RAG + SQL Basics", tasks:[
        {track:"dsa",text:"🔁 Redo 3Sum & Longest Consecutive from memory",sub:"Revision: Day 3 — 20 min total, no hints",time:"20m"},
        {track:"dsa",text:"Reverse a Linked List (#206)",sub:"Striver A2Z Step 6.2 — iterative 3-pointer",time:"20m"},
        {track:"dsa",text:"Find Middle of Linked List (#876)",sub:"Striver A2Z Step 6.2 — slow/fast pointer (tortoise-hare)",time:"15m"},
        {track:"dsa",text:"Merge Two Sorted Lists (#21)",sub:"Striver A2Z Step 6.2 — dummy head technique",time:"25m"},
        {track:"dsa",text:"Remove Nth Node From End (#19)",sub:"Striver A2Z Step 6.3 — two pointer with gap",time:"25m"},
        {track:"gen",text:"Study GPT-2/GPT-3 architecture (causal attention)",sub:"Understand autoregressive generation",time:"60m"},
        {track:"gen",text:"Read about Scaling Laws (Kaplan 2020)",sub:"Key insight: compute, data, params tradeoffs",time:"45m"},
        {track:"gen",text:"Deep dive: RAG (Retrieval Augmented Generation)",sub:"Chunking strategies, embedding models, retrieval",time:"60m"},
        {track:"gen",text:"Vector similarity: cosine, dot product, L2 + reranking",sub:"When to use each in retrieval, cross-encoder reranking",time:"30m"},
        {track:"sys",text:"Design Uber ETA prediction system",sub:"Features → model → real-time serving → fallbacks",time:"75m"},
        {track:"ds",text:"SQL: Window functions — ROW_NUMBER, RANK, DENSE_RANK",sub:"Practice 3 problems on StrataScratch",time:"25m"},
        {track:"ds",text:"SQL: CTEs and complex JOINs",sub:"Practice: 'Find users active in Jan but not Feb'",time:"20m"},
      ]},
      { day:5, label:"Monday", theme:"Striver Linked List II + Feature Stores", tasks:[
        {track:"dsa",text:"🔁 Redo Reverse LL & Remove Nth from memory",sub:"Revision: Day 4 — 10 min each, no hints",time:"20m"},
        {track:"dsa",text:"Detect Cycle in Linked List (#141)",sub:"Striver A2Z Step 6.3 — Floyd's cycle detection",time:"20m"},
        {track:"dsa",text:"Find Start of Cycle in LL (#142)",sub:"Striver A2Z Step 6.3 — slow/fast + reset to head",time:"25m"},
        {track:"dsa",text:"Palindrome Linked List (#234)",sub:"Striver A2Z Step 6.3 — find mid, reverse 2nd half, compare",time:"30m"},
        {track:"dsa",text:"Add Two Numbers (#2)",sub:"Striver A2Z Step 6.2 — carry propagation",time:"30m"},
        {track:"sys",text:"🔁 Redo Uber ETA design verbally (15 min, no notes)",sub:"Revision: Day 4 — catch what you missed",time:"15m"},
        {track:"sys",text:"Study feature stores: offline vs online, Feast",sub:"Search 'Uber Michelangelo feature store'",time:"55m"},
      ]},
      { day:6, label:"Tuesday", theme:"Striver Recursion + Binary Search + Snap Design", tasks:[
        {track:"dsa",text:"🔁 Redo Palindrome LL & Cycle Detection from memory",sub:"Revision: Day 5 — 15 min total, no hints",time:"15m"},
        {track:"dsa",text:"Subsets (#78)",sub:"Striver A2Z Step 7.1 — power set via recursion/bit manipulation",time:"25m"},
        {track:"dsa",text:"Combination Sum (#39)",sub:"Striver A2Z Step 7.2 — backtracking, allow repeats",time:"35m"},
        {track:"dsa",text:"Search in Rotated Sorted Array (#33)",sub:"Striver A2Z Step 4 — modified binary search",time:"35m"},
        {track:"sys",text:"🔁 What is a feature store? When would you use one?",sub:"Revision: Day 5 — explain in 3 sentences",time:"10m"},
        {track:"sys",text:"Design Snap AR filter / face detection system",sub:"Focus: real-time, on-device, latency constraints",time:"75m"},
      ]},
      { day:7, label:"Wednesday", theme:"Week 1 Review + Mock Day", tasks:[
        {track:"dsa",text:"🔁 Redo 3 hardest Striver problems from Week 1 (timed)",sub:"Revision: pick from 3Sum, Merge Intervals, Combination Sum",time:"60m"},
        {track:"dsa",text:"🔁 Explain time/space complexity for each solution aloud",sub:"Revision: Big-O for every Week 1 problem",time:"15m"},
        {track:"sys",text:"🔁 Mock: Design LinkedIn feed ranking (45 min, timed)",sub:"Revision + new: no notes, speak it out loud",time:"45m"},
        {track:"sys",text:"🔁 Compare: Uber ETA vs Snap AR — what's different?",sub:"Revision: Days 4 & 6 — offline vs real-time",time:"20m"},
      ]},
    ]
  },
  {
    week: 2, subtitle: "Depth Sprint — Striver Trees/Graphs/DP + System Design Mocks",
    days: [
      { day:8, label:"Thursday", theme:"Striver Stack & Queue + Fraud Detection", tasks:[
        {track:"dsa",text:"🔁 Redo Search in Rotated & Combination Sum (Day 6)",sub:"Revision: 15 min total, no hints",time:"15m"},
        {track:"dsa",text:"Valid Parentheses (#20)",sub:"Striver A2Z Step 9.1 — stack matching pattern",time:"20m"},
        {track:"dsa",text:"Next Greater Element I (#496)",sub:"Striver A2Z Step 9.2 — monotonic stack",time:"30m"},
        {track:"dsa",text:"Min Stack (#155)",sub:"Striver A2Z Step 9.1 — track min at each level",time:"25m"},
        {track:"dsa",text:"LRU Cache (#146)",sub:"Striver A2Z Step 9 — HashMap + Doubly Linked List",time:"40m"},
        {track:"sys",text:"🔁 Redo Snap AR design from memory (Day 6)",sub:"Revision: add one thing you missed",time:"20m"},
        {track:"sys",text:"Design a fraud detection system (Stripe)",sub:"Features: velocity, graph signals, anomaly scores",time:"60m"},
      ]},
      { day:9, label:"Friday", theme:"Striver Binary Trees I + Image Embeddings", tasks:[
        {track:"dsa",text:"🔁 Redo LRU Cache & Min Stack from memory",sub:"Revision: Day 8 — 15 min, no hints",time:"15m"},
        {track:"dsa",text:"Binary Tree Inorder Traversal (#94)",sub:"Striver A2Z Step 13.1 — iterative with stack",time:"20m"},
        {track:"dsa",text:"Maximum Depth of Binary Tree (#104)",sub:"Striver A2Z Step 13.2 — DFS recursion",time:"15m"},
        {track:"dsa",text:"Diameter of Binary Tree (#543)",sub:"Striver A2Z Step 13.2 — track maxDiameter in DFS",time:"25m"},
        {track:"dsa",text:"Binary Tree Level Order Traversal (#102)",sub:"Striver A2Z Step 13.1 — BFS with queue",time:"30m"},
        {track:"sys",text:"🔁 Redo fraud detection design (Day 8 — 20 min)",sub:"Revision: add graph-based fraud signals",time:"20m"},
        {track:"sys",text:"Design image embedding pipeline (Pinterest/Snap)",sub:"Batch embed → index → ANN search → rerank",time:"60m"},
      ]},
      { day:10, label:"Saturday", theme:"Striver Trees II + Fine-tuning/Diffusion + DS Deep Dive", tasks:[
        {track:"dsa",text:"🔁 Redo Diameter & Level Order from memory",sub:"Revision: Day 9 — 15 min, no hints",time:"15m"},
        {track:"dsa",text:"Lowest Common Ancestor (#236)",sub:"Striver A2Z Step 13.3 — recursive DFS",time:"30m"},
        {track:"dsa",text:"Maximum Path Sum (#124)",sub:"Striver A2Z Step 13.3 — track global max in DFS",time:"35m"},
        {track:"dsa",text:"Validate BST (#98)",sub:"Striver A2Z Step 14 — inorder must be sorted / min-max range",time:"25m"},
        {track:"dsa",text:"Kth Smallest in BST (#230)",sub:"Striver A2Z Step 14 — inorder traversal count",time:"25m"},
        {track:"gen",text:"Study fine-tuning: full vs LoRA vs PEFT",sub:"Understand parameter efficiency",time:"60m"},
        {track:"gen",text:"Instruction tuning + RLHF overview",sub:"SFT → reward model → PPO pipeline",time:"45m"},
        {track:"gen",text:"Study Diffusion Models: DDPM, DDIM conceptually",sub:"Forward (add noise) vs reverse (denoise)",time:"60m"},
        {track:"gen",text:"Understand Stable Diffusion architecture",sub:"VAE + UNet + CLIP text encoder",time:"50m"},
        {track:"sys",text:"🔁 Redo image embedding pipeline (Day 9 — 20 min)",sub:"Revision: add monitoring + drift detection",time:"20m"},
        {track:"sys",text:"Design Spotify music recommendation",sub:"Collaborative filtering + content + cold start",time:"60m"},
        {track:"ds",text:"Revise: Bayes theorem + conditional probability",sub:"Classic ML interview question",time:"25m"},
        {track:"ds",text:"Revise: Gradient boosting, XGBoost, SHAP",sub:"Be ready to explain feature importance",time:"20m"},
        {track:"ds",text:"SQL: Rolling aggregations, top-N per group",sub:"'Top 3 items sold per category per week'",time:"20m"},
        {track:"ds",text:"SQL: Rolling 7-day retention query from scratch",sub:"Write it, run it on any SQL IDE",time:"20m"},
      ]},
      { day:11, label:"Sunday", theme:"Striver Graphs + Multimodal/LLM Inference + Stats", tasks:[
        {track:"dsa",text:"🔁 Redo LCA & Validate BST from memory",sub:"Revision: Day 10 — 15 min, no hints",time:"15m"},
        {track:"dsa",text:"Number of Islands (#200)",sub:"Striver A2Z Step 15 — BFS/DFS on grid",time:"30m"},
        {track:"dsa",text:"Rotten Oranges (#994)",sub:"Striver A2Z Step 15 — multi-source BFS",time:"30m"},
        {track:"dsa",text:"Course Schedule (#207)",sub:"Striver A2Z Step 15 — topological sort / cycle detection",time:"35m"},
        {track:"gen",text:"Study CLIP (Contrastive Language-Image Pretraining)",sub:"How image-text joint embeddings work",time:"60m"},
        {track:"gen",text:"Vision Transformer (ViT) — patches, positions",sub:"How standard transformer is applied to images",time:"45m"},
        {track:"gen",text:"LLM inference: KV cache, speed-up mechanics",sub:"Draw the memory layout",time:"45m"},
        {track:"gen",text:"Quantization: INT8, INT4 + Speculative decoding",sub:"Quality vs speed tradeoffs, draft model parallelism",time:"45m"},
        {track:"sys",text:"🔁 Redo Spotify recsys design (Day 10 — 20 min)",sub:"Revision: how do you handle cold start?",time:"20m"},
        {track:"sys",text:"Design Airbnb search ranking system",sub:"Query understanding → candidate gen → ranking → diversity",time:"60m"},
        {track:"ds",text:"Revise: t-test, chi-square, A/B testing",sub:"Classic interview question at LinkedIn + Uber",time:"20m"},
        {track:"ds",text:"SQL: Complex self-joins + duplicate detection",sub:"'Find duplicate transactions within 5 min'",time:"20m"},
        {track:"ds",text:"LLM evaluation: BLEU, ROUGE, Perplexity",sub:"Know limitations of each",time:"25m"},
      ]},
      { day:12, label:"Monday", theme:"Striver DP I + Model Serving Design", tasks:[
        {track:"dsa",text:"🔁 Redo Number of Islands & Course Schedule",sub:"Revision: Day 11 — 20 min total, no hints",time:"20m"},
        {track:"dsa",text:"Climbing Stairs (#70)",sub:"Striver A2Z Step 16 — base DP, Fibonacci pattern",time:"15m"},
        {track:"dsa",text:"House Robber (#198)",sub:"Striver A2Z Step 16 — pick/skip DP pattern",time:"25m"},
        {track:"dsa",text:"Coin Change (#322)",sub:"Striver A2Z Step 16 — unbounded knapsack DP",time:"35m"},
        {track:"dsa",text:"Longest Increasing Subsequence (#300)",sub:"Striver A2Z Step 16 — O(n log n) with patience sort",time:"35m"},
        {track:"sys",text:"🔁 Redo Airbnb search design (Day 11 — 20 min)",sub:"Revision: what features go into ranking?",time:"20m"},
        {track:"sys",text:"Design a real-time ML model serving system",sub:"Latency SLA, A/B testing, shadow mode, rollback",time:"60m"},
      ]},
      { day:13, label:"Tuesday", theme:"Striver DP II + System Design Mocks", tasks:[
        {track:"dsa",text:"🔁 Redo Coin Change & LIS from memory (timed)",sub:"Revision: Day 12 — 15 min each, no hints",time:"30m"},
        {track:"dsa",text:"Longest Common Subsequence (#1143)",sub:"Striver A2Z Step 16 — 2D DP, classic pattern",time:"35m"},
        {track:"dsa",text:"0/1 Knapsack (GFG)",sub:"Striver A2Z Step 16 — pick/skip with weight constraint",time:"35m"},
        {track:"dsa",text:"Edit Distance (#72)",sub:"Striver A2Z Step 16 — 2D DP on strings, insert/delete/replace",time:"40m"},
        {track:"sys",text:"🔁 Timed mock: design any system (45 min)",sub:"Revision: pick the one you felt weakest on",time:"45m"},
        {track:"sys",text:"🔁 2nd system design mock (different company)",sub:"Revision: record yourself or do with a friend",time:"45m"},
      ]},
      { day:14, label:"Wednesday", theme:"Consolidation + Full Review", tasks:[
        {track:"dsa",text:"🔁 Recode every Striver problem you got wrong",sub:"Revision: from scratch, no looking at old solution",time:"60m"},
        {track:"dsa",text:"🔁 Pattern drill: arrays → LL → stack → tree → graph → DP",sub:"Revision: name the technique for each pattern aloud",time:"15m"},
        {track:"dsa",text:"🔁 Timed mock: 2 random Striver mediums (25 min each)",sub:"Revision: simulate real interview conditions",time:"50m"},
        {track:"sys",text:"🔁 Review all 7 system designs you practiced",sub:"Revision: write 3 bullet improvements for each",time:"45m"},
        {track:"sys",text:"🔁 Pick weakest system design + redo it clean",sub:"Revision: 30 min, no notes",time:"30m"},
      ]},
    ]
  }
]

function saveChecks(checks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checks)) } catch {}
}

// FEATURE: Daily Time Total parser — 2026-03-19
function parseTime(timeStr) {
  if (!timeStr) return 0
  if (timeStr.includes('m')) return parseInt(timeStr) || 0
  if (timeStr.includes('hr')) return (parseFloat(timeStr) || 0) * 60
  return parseInt(timeStr) || 0
}

export default function PrepPlan() {
  const [checks, setChecks] = useState(loadChecks)
  const [openDays, setOpenDays] = useState(new Set([1]))
  const [currentDayNum, setCurrentDayNum] = useState(1)

  // FEATURE: Move Task / Skip Task — 2026-03-19
  const [moves, setMoves] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dp_prep_moves_v1')) || {} }
    catch { return {} }
  })

  // FEATURE: Collapsible Prep Days — 2026-03-19
  useEffect(() => {
    fetch('/api/briefing').then(r => r.json()).then(data => {
      const offset = parseInt(localStorage.getItem('dp_prep_offset') || '0', 10)
      const todayDay = Math.max(1, data.day_num - offset)
      setCurrentDayNum(todayDay)
      
      const newOpen = new Set([todayDay])
      PLAN.forEach(w => w.days.forEach(d => {
        if (d.day >= todayDay) newOpen.add(d.day)
      }))
      setOpenDays(newOpen)

      setTimeout(() => {
        const el = document.getElementById(`day-card-${todayDay}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    })
  }, [])

  const handleMove = (tId, action, dayNum) => {
    const newMoves = { ...moves }
    if (action === 'skip') newMoves[tId] = { status: 'skipped' }
    else if (action === 'tomorrow') newMoves[tId] = { target_day: dayNum + 1 }
    else if (action === 'dayN') newMoves[tId] = { target_day: dayNum + 2 }
    setMoves(newMoves)
    localStorage.setItem('dp_prep_moves_v1', JSON.stringify(newMoves))
  }

  const toggle = (id) => {
    setChecks(prev => {
      const next = { ...prev, [id]: !prev[id] }
      saveChecks(next)
      return next
    })
  }

  const toggleDay = (day) => {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })
  }

  const resetAll = () => {
    if (!confirm('Reset all checkboxes?')) return
    setChecks({}); saveChecks({})
  }

  // Pre-calculate moves
  const movedTo = {}
  PLAN.forEach(w => w.days.forEach(d => d.tasks.forEach((t, i) => {
    const tId = taskId(w.week, d.day, t.track, i)
    const m = moves[tId]
    if (m && m.status !== 'skipped' && m.target_day) {
      if (!movedTo[m.target_day]) movedTo[m.target_day] = []
      movedTo[m.target_day].push({ ...t, tId, isMoved: true })
    }
  })))

  // Merge daily life tasks and apply moves into each day
  const mergedPlan = PLAN.map(w => ({
    ...w,
    days: w.days.map(d => {
      let baseTasks = d.tasks.map((t, i) => {
        const tId = taskId(w.week, d.day, t.track, i)
        const m = moves[tId] || {}
        return { ...t, tId, isSkipped: m.status === 'skipped', isMovedOut: !!m.target_day }
      })
      
      let incoming = movedTo[d.day] || []
      let lifeTasks = DAILY_LIFE.map((t, i) => ({ 
        ...t, 
        tId: taskId(w.week, d.day, t.track, d.tasks.length + i) 
      }))
      
      return {
        ...d,
        tasks: [...baseTasks, ...incoming, ...lifeTasks].filter(t => !t.isMovedOut)
      }
    })
  }))

  // Count totals
  let totalTasks = 0, totalDone = 0
  mergedPlan.forEach(w => w.days.forEach(d => d.tasks.forEach(t => {
    if (t.isSkipped) return
    totalTasks++
    if (checks[t.tId]) totalDone++
  })))
  const pct = totalTasks ? Math.round(totalDone / totalTasks * 100) : 0

  return (
    <div className="prep-plan">
      {/* Header */}
      <div className="prep-header">
        <h1>2-Week Big Tech Prep</h1>
        <p>DSA (Striver A2Z) + SYSTEM DESIGN daily · GEN AI + DS on weekends</p>
      </div>

      {/* About Note */}
      <div className="prep-note">
        <h3>// ABOUT THIS PLAN</h3>
        <p><strong>Weekdays</strong>: DSA (Striver A2Z) + System Design only. <strong>Weekends</strong>: all 4 tracks — Gen AI + DS Revision added. Each day has <strong>spaced revision</strong> (🔁). <strong>Food Prep</strong> and <strong>Gym</strong> repeat daily.</p>
      </div>

      {/* Overall Progress */}
      <div className="prep-progress-wrap">
        <div className="prep-progress-label">
          <span>Overall progress</span>
          <span>{totalDone} / {totalTasks} tasks ({pct}%)</span>
        </div>
        <div className="prep-progress-track">
          <div className="prep-progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      {/* Legend */}
      <div className="prep-legend">
        {trackOrder.map(t => (
          <div className="prep-legend-item" key={t}>
            <div className="prep-legend-dot" style={{ background: trackMeta[t].color }}></div>
            <span>{trackMeta[t].label} ({trackMeta[t].time})</span>
          </div>
        ))}
      </div>

      {/* Weeks */}
      {[...mergedPlan].reverse().map(week => (
        <div className="prep-week" key={week.week}>
          <div className="prep-week-title">
            Week {week.week}
            <span className="prep-week-badge">{week.subtitle}</span>
          </div>

          {[...week.days].reverse().map(day => {
            const dayTasks = day.tasks
            let dayDone = 0
            dayTasks.forEach(t => { if (!t.isSkipped && checks[t.tId]) dayDone++ })
            
            const activeTasksCount = dayTasks.filter(t => !t.isSkipped).length
            const allDone = dayDone === activeTasksCount && activeTasksCount > 0
            const isOpen = openDays.has(day.day)

            // FEATURE: Daily Time Total — 2026-03-19
            let dayMins = 0
            dayTasks.forEach(t => {
              if (!t.isSkipped && !checks[t.tId]) dayMins += parseTime(t.time)
            })
            const hrs = Math.floor(dayMins / 60)
            const mins = dayMins % 60
            const timeStr = hrs > 0 ? `~${hrs}h ${mins}m pending` : `~${mins}m pending`

            // Group tasks by track
            const groups = {}
            dayTasks.forEach((t, i) => {
              if (!groups[t.track]) groups[t.track] = []
              groups[t.track].push({ ...t, idx: i })
            })

            return (
              <div id={`day-card-${day.day}`} className={`prep-day-card${allDone ? ' all-done' : ''}`} key={day.day} style={{ opacity: day.day > currentDayNum ? 0.6 : 1 }}>
                <div className="prep-day-header" onClick={() => toggleDay(day.day)}>
                  <div className="prep-day-name">
                    <span>{day.label}</span>
                    <span className="prep-day-num">Day {day.day} · {day.theme} — {timeStr}</span>
                  </div>
                  <div className="prep-day-prog">
                    {allDone && <span style={{ color: '#4ade80' }}>✓</span>}
                    <span>{dayDone}/{dayTasks.length}</span>
                    <span className="prep-chevron">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="prep-day-body">
                    {trackOrder.map(tr => {
                      if (!groups[tr]) return null
                      const meta = trackMeta[tr]
                      return (
                        <div className="prep-track-group" key={tr}>
                          <span className={`prep-track-label ${meta.cls}`}
                                style={{ background: meta.bg, color: meta.color }}>
                            {meta.icon} {meta.label}
                          </span>
                          {groups[tr].map(task => {
                            const done = !!checks[task.tId]
                            return (
                              <label className={`prep-task${done ? ' done' : ''}${task.isSkipped ? ' skipped' : ''} group`} key={task.tId} onClick={e => { e.preventDefault(); toggle(task.tId) }}>
                                <input type="checkbox" checked={done} readOnly />
                                <span className="prep-task-text" style={{ flex: 1 }}>
                                  {task.text}
                                  {task.sub && <span className="prep-task-sub">{task.sub}</span>}
                                </span>
                                {!task.isSkipped && !task.tId.includes('_food_') && !task.tId.includes('_gym_') && (
                                  <div className="task-actions" onClick={e => e.stopPropagation()}>
                                    <span className="task-action-btn" onClick={() => handleMove(task.tId, 'tomorrow', day.day)}>➡ Tmrw</span>
                                    <span className="task-action-btn" onClick={() => handleMove(task.tId, 'dayN', day.day)}>➡ +2</span>
                                    <span className="task-action-btn" onClick={() => handleMove(task.tId, 'skip', day.day)}>🚫 Skip</span>
                                  </div>
                                )}
                                {task.time && <span className="prep-time-chip">{task.time}</span>}
                              </label>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <button className="prep-reset-btn" onClick={resetAll}>reset all checkboxes</button>
    </div>
  )
}

