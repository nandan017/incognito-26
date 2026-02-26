/* =====================================================
   INCOGNITO 2026 — Main JavaScript
   File: js/main.js
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   1. NAVBAR — scroll class + hamburger toggle
   ───────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('nav-drawer');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

hamburger?.addEventListener('click', () => {
  const isOpen = drawer.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  drawer.setAttribute('aria-hidden', !isOpen);
});

// Close drawer on link click
drawer?.querySelectorAll('.nav-drawer__link').forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  });
});


/* ─────────────────────────────────────────────────────
   2. COUNTDOWN TIMER
   ───────────────────────────────────────────────────── */
const TARGET_DATE = new Date('2026-03-24T09:00:00').getTime();

function padZero(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now = Date.now();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '00';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent = '00';
    document.getElementById('cd-secs').textContent = '00';
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  const secEl = document.getElementById('cd-secs');
  const prevSec = secEl?.textContent;
  const newSec = padZero(secs);

  document.getElementById('cd-days').textContent  = padZero(days);
  document.getElementById('cd-hours').textContent = padZero(hours);
  document.getElementById('cd-mins').textContent  = padZero(mins);

  if (secEl && prevSec !== newSec) {
    secEl.textContent = newSec;
    secEl.classList.add('tick');
    setTimeout(() => secEl.classList.remove('tick'), 120);
    // Subtle tick sound
    playTick();
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();


/* ─────────────────────────────────────────────────────
   3. TYPEWRITER TAGLINES
   ───────────────────────────────────────────────────── */
const taglines = [
  'An intercollegiate fest with a crime-scene twist.',
  'Decode. Build. Compete. Dominate.',
  'March 25, 2026 — Seshadripuram College, Bengaluru.',
  'Where every event is a crime scene waiting to be solved.',
  'Technical. Cultural. Legendary.',
];

let taglineIdx = 0;
let charIdx = 0;
let isDeleting = false;
const taglineEl = document.getElementById('hero-tagline');

function typeTagline() {
  if (!taglineEl) return;
  const current = taglines[taglineIdx];

  if (!isDeleting) {
    taglineEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeTagline, 2400);
      return;
    }
  } else {
    taglineEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      taglineIdx = (taglineIdx + 1) % taglines.length;
    }
  }

  const speed = isDeleting ? 35 : 55;
  setTimeout(typeTagline, speed);
}

setTimeout(typeTagline, 1200);


/* ─────────────────────────────────────────────────────
   4. PARALLAX — hero background layers
   ───────────────────────────────────────────────────── */
const parallaxLayers = [
  { el: document.querySelector('.hero__bg-layer--1'), speed: 0.15 },
  { el: document.querySelector('.hero__bg-layer--2'), speed: 0.08 },
  { el: document.querySelector('.hero__bg-layer--3'), speed: 0.03 },
  { el: document.querySelector('.hero__glitch-overlay'), speed: 0.12 },
];

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      parallaxLayers.forEach(({ el, speed }) => {
        if (el) el.style.transform = `translateY(${y * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


/* ─────────────────────────────────────────────────────
   5. EVENTS FILTER
   ───────────────────────────────────────────────────── */
const filterPills = document.querySelectorAll('.filter-pill');
const eventCards = document.querySelectorAll('.event-card');

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-selected', 'false');
    });
    pill.classList.add('active');
    pill.setAttribute('aria-selected', 'true');

    const filter = pill.dataset.filter;
    eventCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !matches);
    });
  });
});


/* ─────────────────────────────────────────────────────
   6. MASCOT CHATBOT
   ───────────────────────────────────────────────────── */
const mascotToggle = document.getElementById('mascot-toggle');
const mascotPanel  = document.getElementById('mascot-panel');
const mascotClose  = document.getElementById('mascot-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput    = document.getElementById('chat-input');
const chatSend     = document.getElementById('chat-send');
const quickies     = document.getElementById('chat-quickies');

const FAQ_DATA = {
  when: 'The fest takes place on <strong>March 25, 2026</strong>. Mark your calendar, agent.',
  where: 'Venue: <strong>Seshadripuram College, Bengaluru</strong>. Check the map section for directions.',
  events: 'We have 20+ events across Technical, Cultural, Gaming, and Management categories. Each event is a separate mission file.',
  register: 'Click the <strong>REGISTER NOW</strong> button above. You\'ll need a college email to create an account, then pick your events and pay online.',
  price: 'Registration fees vary by event. Most technical events start at ₹100/head. Combo discounts available for 3+ events!',
  team: 'Team sizes vary: some events are solo, others allow teams of 2–4. Check each event\'s file for details.',
  prize: 'Total prize pool is over ₹1,00,000 across all events. Flagship events carry up to ₹15,000.',
  contact: 'Email us at incognito@seshadripuram.edu.in or reach out via Instagram.',
  default: 'Hmm, that\'s outside my clearance level. Try asking about events, registration, the venue, prizes, or contact details.'
};

function getBotReply(msg) {
  const q = msg.toLowerCase();
  if (q.includes('when') || q.includes('date') || q.includes('march'))    return FAQ_DATA.when;
  if (q.includes('where') || q.includes('venue') || q.includes('location')) return FAQ_DATA.where;
  if (q.includes('event') || q.includes('competition'))                    return FAQ_DATA.events;
  if (q.includes('register') || q.includes('signup') || q.includes('sign up')) return FAQ_DATA.register;
  if (q.includes('fee') || q.includes('price') || q.includes('cost') || q.includes('₹')) return FAQ_DATA.price;
  if (q.includes('team') || q.includes('group') || q.includes('solo'))     return FAQ_DATA.team;
  if (q.includes('prize') || q.includes('money') || q.includes('win'))     return FAQ_DATA.prize;
  if (q.includes('contact') || q.includes('email') || q.includes('reach')) return FAQ_DATA.contact;
  return FAQ_DATA.default;
}

function appendBubble(html, side = 'bot') {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${side}`;
  bubble.innerHTML = `<span class="font-mono">${html}</span>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleQuery(q) {
  if (!q.trim()) return;
  // Hide quickies
  if (quickies) quickies.style.display = 'none';
  appendBubble(q, 'user');
  // Simulate typing delay
  setTimeout(() => {
    appendBubble(getBotReply(q), 'bot');
  }, 500);
}

mascotToggle?.addEventListener('click', () => {
  const isOpen = mascotPanel.classList.toggle('open');
  mascotPanel.setAttribute('aria-hidden', !isOpen);
  mascotToggle.setAttribute('aria-expanded', isOpen);
});

mascotClose?.addEventListener('click', () => {
  mascotPanel.classList.remove('open');
  mascotPanel.setAttribute('aria-hidden', 'true');
  mascotToggle.setAttribute('aria-expanded', 'false');
});

chatSend?.addEventListener('click', () => {
  handleQuery(chatInput.value);
  chatInput.value = '';
});

chatInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    handleQuery(chatInput.value);
    chatInput.value = '';
  }
});

// Quick prompt buttons
document.querySelectorAll('.quickie-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    handleQuery(btn.textContent.replace(/^.{2}/, '').trim());
  });
});


/* ─────────────────────────────────────────────────────
   7. RETRO AUDIO — tick sound + login sound
   ───────────────────────────────────────────────────── */
let audioCtx = null;
let audioEnabled = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Unlock audio on first interaction
document.addEventListener('click', () => { audioEnabled = true; }, { once: true });

function playTick() {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (_) {}
}

function playRetroLogin() {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [261, 329, 392, 523];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  } catch (_) {}
}

// Play login sound when nav login button is hovered
document.querySelector('.btn-ghost')?.addEventListener('mouseenter', playRetroLogin);


/* ─────────────────────────────────────────────────────
   8. INTERSECTION OBSERVER — fade-in sections
   ───────────────────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.event-card, .about__dossier, .about__text, .about__stat').forEach(el => {
  observer.observe(el);
});
