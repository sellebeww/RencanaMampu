/* RencanaMampu — interaksi profil perusahaan (profil.html).
   Tanpa dependensi dan tanpa skrip inline (CSP: script-src 'self').
   Elemen ber-id di bawah selalu ada di markup statis profil.html. */
export {};

const root = document.documentElement;
root.classList.add('pf-js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;

/* Header padat + progres scroll */
const header = document.getElementById('pf-header')!;
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(function () {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-solid', y > 24 || menuOpen());
    root.style.setProperty('--pf-p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

/* Menu ponsel */
const menu = document.getElementById('pf-menu')!;
const nav = document.getElementById('pf-nav')!;
function menuOpen() { return menu.getAttribute('aria-expanded') === 'true'; }
function setMenu(open: boolean) {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  onScroll();
}
menu.addEventListener('click', function () { setMenu(!menuOpen()); });
nav.addEventListener('click', function (ev) { if ((ev.target as Element).closest('a')) setMenu(false); });
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape' && menuOpen()) { setMenu(false); menu.focus(); }
});
document.addEventListener('click', function (ev) {
  if (menuOpen() && !header.contains(ev.target as Node)) setMenu(false);
});

/* Angka menghitung naik */
function countUp(el: HTMLElement) {
  const end = Number(el.dataset.count);
  if (reduce || !end) { el.textContent = String(end); return; }
  const start = performance.now();
  const dur = 1100;
  (function step(now) {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(end * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

/* Reveal saat scroll */
const reveals = document.querySelectorAll('[data-reveal], #pf-steps');
if (!hasIO || reduce) {
  reveals.forEach(function (el) { el.classList.add('is-in'); });
} else {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      en.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  reveals.forEach(function (el) { io.observe(el); });
}

/* Scrollspy: tandai bagian yang sedang dibaca */
const links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
if (hasIO) {
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(function (a) {
    const sec = document.querySelector(a.getAttribute('href'));
    if (sec) spy.observe(sec);
  });
}

/* Sorotan mengikuti kursor pada kartu dimensi */
document.querySelectorAll<HTMLElement>('.pf-dim').forEach(function (card) {
  card.addEventListener('pointermove', function (ev: PointerEvent) {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
    card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
  });
});

/* Demo hero: tugas ditambah → konflik → keputusan klinisi → sesuai, berulang. */
const demo = document.getElementById('pf-demo')!;
const toggle = document.getElementById('pf-demo-toggle')!;
const segs = demo.querySelectorAll('.pf-seg');
const status = demo.querySelector<HTMLElement>('.pf-status')!;
const statusText = demo.querySelector<HTMLElement>('.pf-status-text')!;
type Phase = 'idle' | 'konflik' | 'sesuai';
const STATUS: Record<Phase, string> = { idle: 'Menghitung…', konflik: 'Konflik waktu', sesuai: 'Sesuai kapasitas' };
// Tiap langkah: [jeda ms sebelum langkah berikutnya, aksi]
const script: [number, () => void][] = [
  [500, function () { setPhase('idle'); segs.forEach(function (s) { s.classList.remove('is-on'); }); }],
  [550, function () { segs[0].classList.add('is-on'); }],
  [550, function () { segs[1].classList.add('is-on'); }],
  [550, function () { segs[2].classList.add('is-on'); }],
  [700, function () { segs[3].classList.add('is-on'); }],
  [900, function () { segs[4].classList.add('is-on'); }],
  [2600, function () { setPhase('konflik'); }],
  [4200, function () { setPhase('sesuai'); }]
];
let i = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let paused = false;
let visible = true;

function setPhase(p: Phase) {
  demo.dataset.phase = p;
  status.dataset.status = p;
  statusText.textContent = STATUS[p];
}
function tick() {
  const step = script[i];
  step[1]();
  i = (i + 1) % script.length;
  timer = setTimeout(tick, step[0]);
}
function run() {
  clearTimeout(timer);
  if (!paused && visible && !document.hidden) timer = setTimeout(tick, 200);
}
function showFinal() {
  segs.forEach(function (s) { s.classList.add('is-on'); });
  setPhase('sesuai');
}

if (reduce) {
  showFinal();
} else {
  toggle.addEventListener('click', function () {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Putar animasi' : 'Jeda animasi';
    run();
  });
  document.addEventListener('visibilitychange', run);
  if (hasIO) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      run();
    }).observe(demo);
  }
  run();
}

onScroll();
