/**
 * fx.js - Futuristic interaction layer
 * Scroll progress, hero typing line, card spotlight, and the Ctrl/Cmd+K command palette.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

function initTypedRoles(roles) {
  const el = document.getElementById('typed-role');
  if (!el || !roles || !roles.length) return;
  if (reducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const tick = () => {
    const word = roles[roleIdx];
    charIdx += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIdx);

    let delay = deleting ? 35 : 70;
    if (!deleting && charIdx === word.length) {
      deleting = true;
      delay = 1600;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  };
  tick();
}

const SPOT_SELECTOR = [
  '.card', '.stat-card', '.expertise-card', '.project-card', '.news-card',
  '.active-project-card', '.exp-card-large', '.org-card', '.contact-item-card', '.about-pitch-card'
].join(',');

function initSpotlight() {
  if (reducedMotion) return;
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest(SPOT_SELECTOR);
    if (!card) return;
    card.classList.add('fx-spot');
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, { passive: true });
}

function buildCommands(profile) {
  const cmds = [
    ['Home', '#home'], ['About', '#about'], ['News & active systems', '#news'],
    ['Experience', '#experience'], ['Skills & activities', '#skills'],
    ['Portfolio & projects', '#portfolio'], ['Contact', '#contact']
  ].map(([label, href]) => ({ label, hint: 'go to', run: () => { location.hash = href; } }));

  cmds.push(
    { label: 'Toggle dark / light theme', hint: 'action', run: () => document.getElementById('theme-toggle-btn')?.click() },
    { label: 'Play 2048', hint: 'arcade', run: () => { location.href = '2048/'; } },
    { label: 'Play Retro Snake', hint: 'arcade', run: () => { location.href = 'Snake/'; } },
    { label: 'Ask the AI assistant', hint: 'action', run: () => document.getElementById('chatbot-trigger')?.click() }
  );

  (profile.socials || []).forEach((s) => {
    if (!s.url || s.url.startsWith('#')) return;
    cmds.push({ label: `Open ${s.name}`, hint: 'link', run: () => window.open(s.url, '_blank', 'noopener') });
  });
  if (profile.contact?.email) {
    cmds.push({ label: `Email ${profile.contact.email}`, hint: 'contact', run: () => { location.href = `mailto:${profile.contact.email}`; } });
  }
  return cmds;
}

function initCommandPalette(profile) {
  const commands = buildCommands(profile);

  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Command palette');
  overlay.innerHTML = `
    <div class="cmdk-dialog">
      <input class="cmdk-input" type="text" placeholder="Type a command or search..." aria-label="Search commands" autocomplete="off">
      <ul class="cmdk-list" role="listbox"></ul>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.cmdk-input');
  const list = overlay.querySelector('.cmdk-list');
  let visible = [];
  let active = 0;

  const render = () => {
    list.innerHTML = visible.length
      ? visible.map((c, i) => `<li class="cmdk-item" role="option" data-i="${i}" aria-selected="${i === active}"><span>${c.label}</span><small>${c.hint}</small></li>`).join('')
      : '<li class="cmdk-empty">No matching commands</li>';
  };
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    visible = commands.filter((c) => c.label.toLowerCase().includes(q));
    active = 0;
    render();
  };
  const open = () => { overlay.classList.add('open'); input.value = ''; filter(); input.focus(); };
  const close = () => overlay.classList.remove('open');
  const runActive = () => { const c = visible[active]; if (c) { close(); c.run(); } };

  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, visible.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
  });
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.cmdk-item');
    if (item) { active = Number(item.dataset.i); runActive(); }
  });
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close();
    }
  });

  // Navbar hint button
  const actions = document.querySelector('.nav-actions');
  if (actions) {
    const hint = document.createElement('button');
    hint.className = 'cmdk-hint';
    hint.type = 'button';
    hint.setAttribute('aria-label', 'Open command palette');
    hint.innerHTML = '<span>Search</span><kbd>Ctrl K</kbd>';
    hint.addEventListener('click', open);
    actions.prepend(hint);
  }
}

export function initFx(profile) {
  initScrollProgress();
  initTypedRoles(profile.target_roles);
  initSpotlight();
  initCommandPalette(profile);
}
