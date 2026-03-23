/* ════════════════════════════════════════════════════════════════════════════
   Day Planner — Frontend Logic (app.js)
   Shared functions used across multiple pages.
   ════════════════════════════════════════════════════════════════════════════ */

// ── Planner page: save hour block ────────────────────────────────────────────
function saveBlock(date, hour, taskTitle, category, isDone) {
    fetch('/api/save_block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            date: date,
            hour: hour,
            task_title: taskTitle,
            category: category,
            is_done: isDone
        })
    }).then(r => r.json()).then(data => {
        if (data.ok) flashSaved(document.getElementById('hour-row-' + hour));
    }).catch(err => console.error('Save block error:', err));
}

// ── Planner page: save prep task ─────────────────────────────────────────────
function saveTask(date, taskId, taskText, track, isDone) {
    fetch('/api/save_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            date: date,
            task_id: taskId,
            task_text: taskText,
            track: track,
            is_done: isDone
        })
    }).then(r => r.json()).catch(err => console.error('Save task error:', err));
}

// ── Export day summary ───────────────────────────────────────────────────────
function exportDay(date) {
    window.location.href = '/api/export_day/' + date;
}

// ── Visual feedback: brief green flash on save ───────────────────────────────
function flashSaved(el) {
    if (!el) return;
    el.style.transition = 'background .2s';
    const orig = el.style.background;
    el.style.background = 'rgba(52,211,153,.1)';
    setTimeout(() => { el.style.background = orig; }, 600);
}

// ── Update nav date on client side ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const dateLabel = document.querySelector('.date-label');
    if (dateLabel && !dateLabel.textContent.trim()) {
        dateLabel.textContent = new Date().toISOString().split('T')[0];
    }
});
