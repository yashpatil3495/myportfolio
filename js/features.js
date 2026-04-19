/* =========================================================
   NEW FEATURES — v5
   ========================================================= */

/* ─── 2. PROJECT FILTER BAR ─── */
(function() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    if (isPointerFine) {
      btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('magnetic'));
      btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('magnetic'));
    }
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat === filter) {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });
})();

/* ─── 3. PROJECT MODAL / LIGHTBOX ─── */
function openModal(card) {
  try {
    const data = JSON.parse(card.dataset.modal);
    const modal = document.getElementById('project-modal');
    document.getElementById('modal-hero').style.background = data.gradient;
    document.getElementById('modal-emoji').textContent = data.emoji;
    document.getElementById('modal-cat').textContent = data.category;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-problem').textContent = data.problem;
    document.getElementById('modal-solution').textContent = data.solution;
    const tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML = data.tags.map(t => `<span class="tech-tag">${t}</span>`).join('');
    document.getElementById('modal-links').innerHTML = `
      <a href="${data.live}" target="_blank" rel="noopener noreferrer" class="card-link primary magnetic" style="cursor:none;" data-label="Open">Live Demo ↗</a>
      <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="card-link secondary magnetic" style="cursor:none;" data-label="Code">GitHub</a>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch(e) { console.error('Modal error', e); }
}
function closeModal() {
  document.getElementById('project-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─── 4. SKILLS RADAR CHART ─── */
(function() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 480, H = 480, cx = W/2, cy = H/2, R = 170;
  const skills = [
    { label: 'Frontend',    value: 0.92, color: '#e8a832' },
    { label: 'UI/UX',       value: 0.82, color: '#2abfb3' },
    { label: 'AI / ML',     value: 0.78, color: '#c94a2a' },
    { label: 'Backend',     value: 0.58, color: '#fad06e' },
    { label: 'Systems',     value: 0.72, color: '#9b7fe8' },
    { label: 'Creative Dev',value: 0.85, color: '#e8a832' },
  ];
  const N = skills.length;
  const step = (Math.PI * 2) / N;
  const offset = -Math.PI / 2;

  function polarX(i, r) { return cx + Math.cos(offset + i * step) * r; }
  function polarY(i, r) { return cy + Math.sin(offset + i * step) * r; }

  let animated = 0;
  const targetTime = 1600;
  let startTime = null;
  let started = false;

  function draw(progress) {
    ctx.clearRect(0, 0, W, H);

    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (R / 5) * ring;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        i === 0 ? ctx.moveTo(polarX(i, r), polarY(i, r))
                : ctx.lineTo(polarX(i, r), polarY(i, r));
      }
      ctx.closePath();
      ctx.strokeStyle = ring === 5 ? 'rgba(232,168,50,0.25)' : 'rgba(232,168,50,0.1)';
      ctx.lineWidth = ring === 5 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Spokes
    for (let i = 0; i < N; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(polarX(i, R), polarY(i, R));
      ctx.strokeStyle = 'rgba(232,168,50,0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Filled radar shape
    ctx.beginPath();
    skills.forEach((s, i) => {
      const r = s.value * R * progress;
      i === 0 ? ctx.moveTo(polarX(i, r), polarY(i, r))
              : ctx.lineTo(polarX(i, r), polarY(i, r));
    });
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(232,168,50,0.35)');
    grad.addColorStop(1, 'rgba(232,168,50,0.06)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,168,50,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots & labels
    skills.forEach((s, i) => {
      const r = s.value * R * progress;
      const x = polarX(i, r), y = polarY(i, r);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Labels
      const lx = polarX(i, R + 28), ly = polarY(i, R + 28);
      ctx.fillStyle = 'rgba(240,230,204,0.85)';
      ctx.font = 'bold 11px "DM Mono", monospace';
      ctx.textAlign = lx < cx - 10 ? 'right' : lx > cx + 10 ? 'left' : 'center';
      ctx.textBaseline = ly < cy - 10 ? 'bottom' : ly > cy + 10 ? 'top' : 'middle';
      ctx.fillText(s.label, lx, ly);

      // Percent
      ctx.fillStyle = s.color;
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillText(Math.round(s.value * 100 * progress) + '%', lx, ly + (ly < cy ? -13 : 13));
    });
  }

  function animate(ts) {
    if (!startTime) startTime = ts;
    const prog = Math.min((ts - startTime) / targetTime, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    draw(ease);
    if (prog < 1) requestAnimationFrame(animate);
  }

  // Trigger on scroll into view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(canvas);
  draw(0); // initial static
})();

/* ─── 5. ANIMATED CV DOWNLOAD BUTTON ─── */
function triggerCVDownload() {
  const btn = document.getElementById('cv-download-btn');
  if (!btn || btn.classList.contains('filling')) return;
  btn.classList.add('filling');
  btn.querySelector('.btn-cv-text').textContent = 'Preparing…';

  const CV_URL = 'assets/Yash_Patil_CV.pdf';

  setTimeout(() => {
    // Check whether the PDF actually exists before triggering download
    fetch(CV_URL, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          // PDF found — download it
          btn.classList.remove('filling');
          btn.classList.add('done');
          btn.querySelector('.btn-cv-text').textContent = 'Downloaded! ✦';
          btn.querySelector('.btn-cv-icon').textContent = '✓';
          const a = document.createElement('a');
          a.href = CV_URL;
          a.download = 'Yash_Patil_CV.pdf';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        } else {
          // PDF not found — open the interactive resume page instead
          btn.classList.remove('filling');
          btn.classList.add('done');
          btn.querySelector('.btn-cv-text').textContent = 'Opening Resume ↗';
          btn.querySelector('.btn-cv-icon').textContent = '↗';
          window.open('resume.html', '_blank', 'noopener,noreferrer');
        }
        setTimeout(() => {
          btn.classList.remove('done');
          btn.querySelector('.btn-cv-text').textContent = 'Download CV';
          btn.querySelector('.btn-cv-icon').textContent = '↓';
        }, 3000);
      })
      .catch(() => {
        // Network error or same-origin restriction — fall back to resume.html
        btn.classList.remove('filling');
        btn.querySelector('.btn-cv-text').textContent = 'Download CV';
        btn.querySelector('.btn-cv-icon').textContent = '↓';
        window.open('resume.html', '_blank', 'noopener,noreferrer');
      });
  }, 900);
}

/* ─── 6. CONTACT FORM — Inline validation (no alert()) ─── */
function clearFormErrors() {
  document.querySelectorAll('.form-input.error, .form-textarea.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
}
function showFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errorId);
  if (field) field.classList.add('error');
  if (err) err.classList.add('visible');
  if (field) field.focus();
}

function submitContactForm() {
  // ── FORMSPREE SETUP (one-time, 5 minutes) ───────────────────────────────
  // 1. Go to https://formspree.io and sign up with yashpatil3495@gmail.com
  // 2. Click "New Form" → name it "Portfolio Contact"
  // 3. Copy your form ID (looks like: xpwzrlwv) from the endpoint URL
  // 4. Replace YOUR_FORMSPREE_ID below with that ID
  // Free tier: 50 submissions/month, no server needed.
  // ────────────────────────────────────────────────────────────────────────
  const FORMSPREE_ID = 'YOUR_FORMSPREE_ID'; // ← replace this
  const nameEl    = document.getElementById('cf-name');
  const emailEl   = document.getElementById('cf-email');
  const subjectEl = document.getElementById('cf-subject');
  const msgEl     = document.getElementById('cf-message');
  const btn       = document.getElementById('cf-submit');

  const name    = nameEl?.value.trim();
  const email   = emailEl?.value.trim();
  const subject = subjectEl?.value.trim() || 'Portfolio Contact';
  const message = msgEl?.value.trim();

  clearFormErrors();
  let hasError = false;

  if (!name)    { showFieldError('cf-name',    'err-name');          hasError = true; }
  if (!email)   { showFieldError('cf-email',   'err-email');         hasError = true; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  showFieldError('cf-email',   'err-email-invalid'); hasError = true; }
  if (!message) { showFieldError('cf-message', 'err-message');       hasError = true; }
  if (hasError) return;

  btn.disabled = true;
  btn.textContent = 'Sending…';

  // ── Formspree endpoint — uses the ID declared at the top of this function ──
  fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      subject,
      message,
      _replyto: email,
      _subject: `[Portfolio] ${subject}`
    })
  })
  .then(r => r.json().then(data => ({ ok: r.ok, data })))
  .then(({ ok, data }) => {
    if (!ok) throw new Error(data?.error || 'Formspree error');
    document.getElementById('contact-form-inner').style.display = 'none';
    document.getElementById('form-success').classList.add('show');
  })
  .catch(() => {
    // Graceful fallback: open native mail client
    window.location.href = `mailto:yashpatil3495@gmail.com`
      + `?subject=${encodeURIComponent('[Portfolio] ' + subject)}`
      + `&body=${encodeURIComponent(`Hi Yash,\n\n${message}\n\n— ${name} (${email})`)}`;
    btn.disabled = false;
    btn.textContent = 'Send Message ✦';
  });
}

/* ─── 7. GITHUB CONTRIBUTION HEATMAP (GraphQL API + REST fallback) ─── */
(function() {
  const canvas = document.getElementById('gh-heatmap-canvas');
  if (!canvas) return;

  const GITHUB_USERNAME = 'yashpatil3495';
  const WEEKS = 52, DAYS = 7;

  // ── GraphQL: exact per-day contribution counts for full year ──
  // Add ?gh_token=ghp_xxx to the URL to enable full-year GraphQL mode.
  // Without it, automatically falls back to the public Events API.
  async function fetchViaGraphQL(token) {
    const today = new Date();
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    const query = `{
      user(login: "${GITHUB_USERNAME}") {
        contributionsCollection(from: "${from.toISOString()}", to: "${today.toISOString()}") {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Authorization': `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error('GraphQL failed');
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    const dateMap = {};
    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > 0) dateMap[day.date] = day.contributionCount;
      });
    });
    return dateMap;
  }

  // ── REST fallback: public events (last ~300 events) ──
  async function fetchViaREST() {
    const dateMap = {};
    const pages = [1, 2, 3];
    const fetches = pages.map(p =>
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${p}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      }).then(r => r.ok ? r.json() : []).catch(() => [])
    );
    const results = await Promise.all(fetches);
    results.flat().forEach(event => {
      if (!event.created_at) return;
      const day = event.created_at.slice(0, 10);
      const weight = event.type === 'PushEvent' ? (event.payload?.commits?.length || 1) : 1;
      dateMap[day] = (dateMap[day] || 0) + weight;
    });
    return dateMap;
  }

  // ── Main: try GraphQL first, fall back to REST ──
  async function fetchContributions() {
    const token = new URLSearchParams(window.location.search).get('gh_token');
    if (token) {
      try {
        const map = await fetchViaGraphQL(token);
        const lbl = document.querySelector('.gh-chart-label');
        if (lbl) lbl.textContent = 'Contribution Heatmap — Full Year · Live from GitHub ✦';
        return map;
      } catch(e) { /* fall through */ }
    }
    return fetchViaREST();
  }

  // Build a 52×7 grid (oldest week first, Sunday=0)
  function buildGrid(dateMap) {
    const today = new Date();
    const grid = [];
    // Start from 52 weeks ago, aligned to the most recent Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - (52 * 7) + 1);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = date.toISOString().slice(0, 10);
        grid.push(dateMap[key] || 0);
      }
    }
    return grid;
  }

  // Map raw counts to 0–4 levels
  function normalizeGrid(grid) {
    const maxVal = Math.max(...grid, 1);
    return grid.map(v => {
      if (v === 0) return 0;
      const ratio = v / maxVal;
      if (ratio < 0.15) return 1;
      if (ratio < 0.40) return 2;
      if (ratio < 0.70) return 3;
      return 4;
    });
  }

  function drawHeatmap(normalised) {
    const W = canvas.offsetWidth || 728;
    canvas.width = W;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    const cellW = (W - 12) / WEEKS;
    const cellH = (108 - 12) / DAYS;
    const gap = Math.max(2, cellW * 0.12);
    const rad = Math.max(2, cellW * 0.15);

    const colors = [
      'rgba(232,168,50,0.08)',
      'rgba(232,168,50,0.28)',
      'rgba(232,168,50,0.52)',
      'rgba(232,168,50,0.76)',
      '#e8a832'
    ];
    const glows = [null, null, 'rgba(232,168,50,0.2)', 'rgba(232,168,50,0.4)', 'rgba(232,168,50,0.7)'];

    ctx.clearRect(0, 0, W, 120);

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const val = normalised[w * DAYS + d];
        const x = 6 + w * cellW + gap / 2;
        const y = 6 + d * cellH + gap / 2;
        const cw = cellW - gap;
        const ch = cellH - gap;

        if (val >= 2 && glows[val]) {
          ctx.shadowColor = glows[val];
          ctx.shadowBlur = val === 4 ? 8 : 4;
        }
        ctx.fillStyle = colors[val];
        ctx.beginPath();
        ctx.roundRect(x, y, cw, ch, rad);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (val === 0) {
          ctx.strokeStyle = 'rgba(232,168,50,0.12)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Day labels
    const dayLabels = ['S','M','T','W','T','F','S'];
    ctx.fillStyle = 'rgba(138,125,101,0.7)';
    ctx.font = '8px "DM Mono", monospace';
    ctx.textAlign = 'right';
    for (let d = 1; d < DAYS; d += 2) {
      const y = 6 + d * cellH + cellH / 2 + 3;
      ctx.fillText(dayLabels[d], 5, y);
    }
  }

  // Build CSS skeleton grid (53 cols × 7 rows of animated cells)
  const skeletonEl = document.getElementById('gh-skeleton');
  const skeletonGrid = document.getElementById('gh-skeleton-grid');
  if (skeletonGrid) {
    const total = WEEKS * DAYS + DAYS; // slight overcount is fine — grid clips
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'gh-skeleton-cell';
      skeletonGrid.appendChild(cell);
    }
  }

  function showCanvas() {
    if (skeletonEl) skeletonEl.style.display = 'none';
    canvas.style.display = 'block';
  }

  let currentNorm = null;

  fetchContributions().then(dateMap => {
    const grid = buildGrid(dateMap);
    currentNorm = normalizeGrid(grid);
    showCanvas();
    drawHeatmap(currentNorm);
  }).catch(() => {
    // On failure, hide skeleton and show empty canvas
    showCanvas();
    drawHeatmap(new Array(WEEKS * DAYS).fill(0));
  });

  window.addEventListener('resize', () => {
    if (currentNorm) drawHeatmap(currentNorm);
  });
})();

/* ─── PAGE SHARE BUTTON ─── */
(function() {
  const btn = document.getElementById('share-btn');
  const toast = document.getElementById('share-toast');
  if (!btn) return;

  const shareData = {
    title: 'Yash Patil — Frontend Developer & Designer',
    text: 'Check out Yash Patil\'s portfolio — frontend dev, UI/UX designer, and creative builder from Pune.',
    url: 'https://yashpatil3495.github.io/'
  };

  btn.addEventListener('click', async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch(e) {
        if (e.name !== 'AbortError') fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    navigator.clipboard.writeText(shareData.url).then(() => {
      showToast('✓ Link copied to clipboard');
    }).catch(() => {
      showToast('↗ yashpatil3495.github.io');
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  if (isPointerFine) {
    btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
    btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
  }
})();
