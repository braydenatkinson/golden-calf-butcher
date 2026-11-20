/* Golden Calf Artisan Butcher demo, pipeline/3-design.md Revision 2. Two places: his wall and his case. Every word is
   placed in the native px of the photograph under it. The steer's motion is the spec's: the lift, the tag standing on
   its wire, the computer idle cycle, the board following the cut, the phone's held wall with three framings, and his
   tag travelling back into his case. ?motion=full forces motion; &film=1 stops timers and exposes __arrive() and
   __glide(y, ms) (every scroll the page makes is stepped through one Web Animation); ?hide=1 hides the words. */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  const FILM = q.get('film') === '1';
  const MO = !(matchMedia('(prefers-reduced-motion: reduce)').matches && q.get('motion') !== 'full');
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)', SETTLE = 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    CARRY = 'cubic-bezier(0.32, 0.72, 0, 1)', INOUT = 'cubic-bezier(0.45, 0, 0.55, 1)';
  const mqD = matchMedia('(min-width: 1024px)');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, hold = $('#hold'), stage = $('#stage'), wallbox = $('#wallbox'), inner = $('#inner'), casebox = $('#casebox'),
    board = $('#board'), caseFig = $('#case'), caseLayer = $('#caselayer'), ptag = $('#ptag'), travel = $('#travel');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  if (!MO) root.classList.add('rm');
  if (FILM) {   // a recorder steps time: every animation starts paused at 0 and is stepped from outside
    const an = Element.prototype.animate;
    Element.prototype.animate = function (k, o) { const a = an.call(this, k, o); a.pause(); a.currentTime = 0; return a; };
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function bez(x1, y1, x2, y2) {
    const X = u => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3,
      Y = u => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
    return t => {
      if (t <= 0) return 0; if (t >= 1) return 1;
      let lo = 0, hi = 1, u = t;
      for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; if (X(u) < t) lo = u; else hi = u; }
      return Y(u);
    };
  }
  const easeIO = bez(0.45, 0, 0.55, 1), easeOut = bez(0.22, 1, 0.36, 1);

  const TAGR = { G: 292 / 204, o: 254 / 192, L: 346 / 260, d: 410 / 286, E: 322 / 246, c: 334 / 230, a: 300 / 214, f: 378 / 280 };
  const TAGF = { G: 'bottom-round-roast', o: 'picanha-c', L: 'bone-in-ny-strip', d: 'boneless-rib-eye', E: 'chuck-roast', c: 'flank-steak', a: 'skirt-steak-mar5', f: 'brisket' };
  /* L 575 -> 580, o (430, 640) -> (380, 585), a 745 -> 765, so each clears his Filet Tail, Picanha, Skirt and Top Sirloin Baseball tags (DESIGN.md) */
  const LAND = { E: [965, 760, 120], L: [340, 580, 100], d: [75, 444, 90],   /* spec 470; raised 26 N so it never touches his Boneless Rib-eye tag (DESIGN.md) */ o: [380, 585, 80], c: [585, 660, 100], a: [320, 765, 100] };
  const STEERK = ['G', 'o', 'L', 'd', 'E', 'c', 'a', 'f', 'rest'];
  const LIFTK = ['G', 'o', 'L', 'd', 'E'];
  Object.values(TAGF).forEach(t => { const i = new Image(); i.src = `assets/img/tag-${t}.webp`; });

  let desk = mqD.matches, W = 0, H = 0, lifted = null, shelfK = 'E', lastSteer = 'E', mode = null;
  const G = {};                                    // geometry of the current layout

  function px(e, o) { for (const k in o) { if (k.startsWith('--')) e.style.setProperty(k, o[k]); else e.style[k] = typeof o[k] === 'number' ? o[k] + 'px' : o[k]; } }

  /* ---------- the board's shelves ---------- */
  function layShelves(o) {
    // o: { bw, head: {x, y, w}, side, ls, ns, ms, ds, gap, fs, rowsMin, foot pad }
    $$('.shelf', board).forEach(sh => {
      const hd = $('.hd', sh), blk = $('.blk', sh), rows = $('.rows', sh), foot = $('.foot', sh);
      const r = +hd.dataset.r, hw = o.head.w, hh = hw / r, cpt = sh.dataset.compact === '1';
      const side = o.side(hw), hx = side ? o.head.x : (o.shiftX ? o.shiftX(hw) : o.head.x);   // R3.D1
      px(hd, { left: hx, top: o.head.y, width: hw });
      $$('.lab', blk).forEach(e => px(e, { fontSize: o.ls }));
      px($('.sn', blk), { fontSize: o.ns });
      const longest = +sh.dataset.long, ms = o.ms(longest, +sh.dataset.long2), ds = o.dsOf(ms);
      const dl = $('.hdate', blk); if (dl) px(dl, { fontSize: ds, lineHeight: '1.3', marginTop: 4 });
      const bx = side ? o.head.x + hw + 14 : o.blkX;
      px(blk, { left: bx, top: side ? o.blkTop : o.head.y + hh + (cpt ? 6 : 10), width: o.bw - (bx - o.boxX) });
      const blkBottom = blk.offsetTop + blk.offsetHeight;
      px(rows, { left: o.rowsX, width: o.rowsW, top: Math.max(o.head.y + hh + 26, blkBottom + (cpt ? 6 : o.rowGap), o.rowsMin || 0) });   // R3.D2: the 18 px wire clears the rows
      $$('.nm1', rows).forEach(e => px(e, { fontSize: ms, lineHeight: cpt ? '1.1' : '1.25' }));
      $$('.l2', rows).forEach(e => px(e, { fontSize: ds, lineHeight: cpt ? (1.1 * ds) + 'px' : (o.l2lh || (1.3 * ds) + 'px') }));
      $$('.pr', rows).forEach(e => px(e, { fontSize: ms }));
      $$('li', rows).forEach(e => px(e, { marginBottom: cpt ? 2 : o.gap }));
      const qq = $('.q', rows); if (qq) px(qq, { fontSize: o.qs, lineHeight: o.qs * 1.375 + 'px', marginBottom: 12, whiteSpace: 'normal' });
      const pad = Math.max(0, (44 - o.fs * 1.4) / 2);
      $$('a', foot).forEach(a => px(a, { fontSize: o.fs, lineHeight: o.fs * 1.4 + 'px', padding: pad + 'px 0' }));
      if (sh.classList.contains('cpt2')) px(foot, { left: o.rowsX, top: rows.offsetTop + rows.offsetHeight - pad, width: o.bw });   // fit rule step 2: the links share one line under the rows
      else px(foot, { left: o.rowsX, top: rows.offsetTop + rows.offsetHeight + 4 - pad, width: '' });
      sh.dataset.hx = hx; sh.dataset.hy = o.head.y; sh.dataset.hw = hw; sh.dataset.hh = hh;
      sh.dataset.bottom = Math.max(rows.offsetTop + rows.offsetHeight, foot.offsetTop + foot.offsetHeight - pad);
    });
  }

  /* ---------- layout ---------- */
  function layout() {
    desk = mqD.matches; W = root.clientWidth; H = innerHeight;
    const hl = $('#hl'), nm = $('#name');
    if (!desk) {
      const sA = H / 1536, vl = Math.max(0, Math.min(1122, 2040 - W / sA)), sB = W / 800, sC = W / 1680, sp = W / 520;
      G.fr = { A: { s: sA, L: vl, T: 0 }, B: { s: sB, L: 1240, T: 120 }, C: { s: sC, L: 180, T: 0 } };
      // R3.C: the held stage runs to the end of the page; after G.rel its content moves up 1:1 with the scroll
      G.wallC = 1536 * sC; G.sp = sp; G.sC = sC; G.rel = Math.round(3.2 * H) - H; G.caseH = 1440 * sp; G.caseTop = 1;
      G.Dmax = Math.max(0, Math.round(G.wallC + G.caseH - H)); G.yEnd = G.rel + G.Dmax;
      px(hold, { height: G.yEnd + H }); px(stage, { position: 'sticky', top: 0, height: H });
      px(caseFig, { marginTop: 0 });
      px(casebox, { width: 1302 * sp, height: G.caseH }); px(caseLayer, { width: 1302 * sp });
      $('#wallimg').sizes = Math.round(2040 * Math.max(sA, sB)) + 'px';
      const X = n => (n - vl) * sA, Y = n => n * sA;
      nm.classList.add('ct'); nm.classList.remove('dkn');
      px(nm, { left: 16, top: Y(18), fontSize: clamp(sA * 47, 22, 28), '--sw': '3px' });
      const hs = Math.round(clamp(sA * 55, 22, 34) * 10) / 10, py0 = Y(1225), hTop = py0 - 0.8 * hs - 2 * hs;
      px(hl, { left: X(1322), top: hTop, fontSize: hs, '--sw': (hs >= 28 ? 4 : 3) + 'px' });
      const tw = Math.max(150, Math.min(190, 317 * sA));
      G.p1 = { x: W - 16 - tw, y: hTop - 16 - tw * 246 / 322, w: tw };
      const p0 = X(1450), p1 = Math.min(X(2030), W - 16), big = Y(1510) - py0 >= 140;
      px($('#patch'), { left: p0, top: py0, width: p1 - p0, fontSize: big ? 14 : 13.5, lineHeight: big ? '19px' : '17px' });
      // C words, at native px of the wall at framing C
      px($('#mapline'), { left: (250 - 180) * sC, top: 1296 * sC });
      px($('#credit'), { left: (250 - 180) * sC, top: 1472 * sC, fontSize: '' });
      $$('#hit-c .tgt').forEach(r => {
        const w = Math.max(44, +r.dataset.w) / sC, h = Math.max(44, +r.dataset.h) / sC;
        r.setAttribute('x', +r.dataset.cx - w / 2); r.setAttribute('y', +r.dataset.cy - h / 2);
        r.setAttribute('width', w); r.setAttribute('height', h);
      });
      // the board at framing B (Revision 1's P3 positions, R2.1's row format)
      const hw = 160 * W / 390;
      G.bhead = { x: 16, y: 520 * sB, w: hw };
      px(board, { left: 0, top: 0, width: W });
      $$('.shelf', board).forEach(sh => { sh.dataset.compact = ''; sh.classList.remove('cpt2'); });
      layShelves(G.lastOpts = { bw: W - 16, boxX: 0, head: G.bhead, side: () => true, blkX: 16, blkTop: 530 * sB, ls: 12, ns: 30,
        ms: () => 16, dsOf: () => 14, l2lh: '17px', gap: 7, fs: 16, qs: 16, rowsX: 66 * sB, rowsW: W - 16 - 66 * sB, rowsMin: 808 * sB, rowGap: 18 });
      // Builder fit rule (DESIGN.md): a shelf that would run past the wall's foot at framing B is set tighter
      const overP = () => $$('.shelf', board).filter(sh => +sh.dataset.bottom > 1416 * sB - 4);
      const o1 = overP(); if (o1.length) { o1.forEach(sh => { sh.dataset.compact = '1'; }); layShelves(G.lastOpts); }
      G.overflow = overP().map(sh => sh.id);
      // the case foot
      const f1 = $('#foot1p'), f2 = $('#foot2p');
      px(f1, { left: 20 * sp, top: 1106 * sp, width: 300 * sp, fontSize: 16, lineHeight: '22px' });
      px(f2, { left: 21 * sp, top: 1198 * sp, width: W - 32, fontSize: 16, lineHeight: '22px' });
      $$('.g', f2).forEach(e => px(e, { marginTop: 8 }));
      // Builder fit rule (DESIGN.md): block 2 starts below block 1; where they would run past the photo's foot
      // (narrow phones), both rise together on the black mat, never above native y 1060
      px(f2, { top: Math.max(1198 * sp, f1.offsetTop + f1.offsetHeight + 4) });
      const over = f2.offsetTop + f2.offsetHeight - (G.caseH - 6);
      if (over > 0) { const up = Math.min(over, f1.offsetTop - 1060 * sp); px(f1, { top: f1.offsetTop - up }); px(f2, { top: f2.offsetTop - up }); }
    } else {
      const s = W / 2040, tfit = (H - 660 * s - 20) / 660, ultra = tfit < 0.55 * s,
        t = ultra ? Math.min(s, H / 1100) : Math.min(s, tfit), fs = Math.max(14, 21 * Math.min(s, H / 1100));
      Object.assign(G, { s, t, ultra, fs, sc: W / 1302 });
      px(hold, { height: 1536 * s }); px(stage, { position: 'relative', top: 0, height: 1536 * s });
      inner.style.transform = '';
      wallbox.style.transform = `scale(${s})`;
      $('#wallimg').sizes = W + 'px';
      const mk = $('#mark'); px(mk, { left: 70 * s, top: 40 * s, height: 68 * s, width: 68 * s * 140 / 124 });
      nm.classList.remove('ct'); nm.classList.add('dkn');
      px(nm, { left: 70 * s, top: 40 * s + 68 * s + 8, fontSize: 31 * s });
      const hs = 79 * s; px(hl, { left: 410 * s, top: 34 * s, fontSize: hs, '--sw': (hs < 64 ? 5 : 6) + 'px' });
      const col = $('#col');
      px(col, { left: 1830 * s, top: 40 * s, width: 200 * s, fontSize: fs, lineHeight: fs * 1.4 + 'px' });
      $$('p', col).forEach((p, i, a) => px(p, { marginBottom: i < a.length - 1 ? fs * 0.6 : 0 }));
      // R3.D3 line: hand-broken in two; where the column is too narrow for that (near 1024 wide), in three
      const fz = $('a[data-go="freezer"]', col);
      fz.innerHTML = 'Dinner solved six<br>nights straight.';
      if (col.scrollWidth > col.clientWidth + 1 || fz.getBoundingClientRect().right > W - 2) fz.innerHTML = 'Dinner solved<br>six nights<br>straight.';
      const colBottom = col.offsetTop + col.offsetHeight;
      const bx = ultra ? 1830 * s : 1500 * s, by = ultra ? colBottom + 30 * t : 660 * s, bw = ultra ? 200 * s : 510 * s;
      const w0 = Math.min(bw, Math.max(150, 220 * t)), ls = Math.max(12, 17 * t), ns = Math.max(24, 44 * t);
      const msBase = Math.max(15, 24 * t);
      G.board = { bx, by, bw };
      px(board, { left: bx, top: by, width: bw });
      $$('.shelf', board).forEach(sh => { sh.dataset.compact = ''; sh.classList.remove('cpt2'); });
      layShelves(G.lastOpts = { bw, boxX: 0, head: { x: 0, y: 0, w: w0 }, side: hw => bw - hw - 14 >= 15 * ls, blkX: 0, blkTop: 0,
        ls, ns, ms: (n, n2) => Math.min(msBase, bw / (0.56 * n), (bw - 10) / (0.56 * n2)), dsOf: ms => Math.max(13.5, 0.8 * ms), gap: 8 * t, fs, qs: 16,
        rowsX: 0, rowsW: bw, rowsMin: 0, rowGap: 14 * t, shiftX: hw => Math.min(60 * s, bw - hw) });
      // Builder fit rule (DESIGN.md): a shelf that would run past the wall's foot (only near 1024 wide) is set tighter
      const over = () => $$('.shelf', board).filter(sh => by + +sh.dataset.bottom > 1536 * s - 6);
      const ov1 = over(); if (ov1.length) { ov1.forEach(sh => { sh.dataset.compact = '1'; }); layShelves(G.lastOpts); }
      const ov2 = over(); if (ov2.length) { ov2.forEach(sh => sh.classList.add('cpt2')); layShelves(G.lastOpts); }
      G.overflow = over().map(sh => sh.id);
      px($('#credit'), { left: 330 * s, top: 1224 * s, fontSize: Math.max(11.5, 16 * s), lineHeight: '1.2' });
      // the case foot
      const sc = W / 1302, big = sc >= 1, f = big ? 16 : 14, lh = big ? 22 : 19, f1 = $('#foot1'), f2 = $('#foot2');
      px(f1, { left: 24 * sc, top: 1110 * sc, width: 270 * sc, fontSize: f, lineHeight: lh + 'px' });
      px(f2, { left: 24 * sc, top: f1.offsetTop + f1.offsetHeight + lh * 0.5, width: Math.min(500 * sc, 600), fontSize: f, lineHeight: lh + 'px' });
      $$('.g', f2).forEach(e => px(e, { marginTop: lh * 0.5 }));
      $('.saus', f2).style.display = big ? '' : 'none';
      G.caseTop = 1536 * s;
    }
    frame();
  }

  /* ---------- motion parts ---------- */
  const P = 'perspective(600px) ';
  const STAND = [{ transform: P + 'rotateX(78deg)', opacity: 0, offset: 0 }, { opacity: 1, offset: 0.1 },
    { transform: P + 'rotateX(-4deg)', offset: 0.6 }, { transform: P + 'rotateX(1deg)', offset: 0.8 },
    { transform: P + 'rotateX(0deg)', opacity: 1, offset: 1 }];
  const FLAT = [{ transform: P + 'rotateX(0deg)', opacity: 1, visibility: 'visible' },
    { transform: P + 'rotateX(78deg)', opacity: 1, visibility: 'visible', offset: 0.85 },
    { transform: P + 'rotateX(78deg)', opacity: 0, visibility: 'visible' }];
  const TIP = [{ transform: P + 'rotateX(0deg)', opacity: 1, visibility: 'visible' },
    { transform: P + 'rotateX(82deg)', opacity: 1, visibility: 'visible', offset: 0.9 },
    { transform: P + 'rotateX(82deg)', opacity: 0, visibility: 'visible' }];
  const WIRE_IN = [{ transform: 'scaleY(0)', opacity: 0 }, { transform: 'scaleY(1)', opacity: 1 }];
  const WIRE_OUT = [{ transform: 'scaleY(1)', opacity: 1, visibility: 'visible' }, { transform: 'scaleY(0)', opacity: 0, visibility: 'visible' }];
  const pieces = k => [$(`.pc[data-c="${k}"]`), $(`.shd[data-c="${k}"]`)];

  function standEl(el, delay = 0) {
    $('img', el).animate(STAND, { duration: 450, delay, fill: 'backwards' });
    const w = $('.wire', el); if (w) w.animate(WIRE_IN, { duration: 450, delay, easing: EASE, fill: 'backwards' });
  }
  function tipEl(el, kf = FLAT, ms = 200) {
    $('img', el).animate(kf, { duration: ms, easing: 'ease-in' });
    const w = $('.wire', el); if (w) w.animate(WIRE_OUT, { duration: ms });
  }
  function liftPiece(k, delay, anim) {
    const [p, sh] = pieces(k); p.classList.add('up'); sh.classList.add('up');
    if (!anim) return;
    p.animate([{ opacity: 1, transform: 'translateY(0px) scale(1)' }, { opacity: 1, transform: 'translateY(8px) scale(1.03)' }], { duration: 600, delay, easing: EASE, fill: 'backwards' });
    sh.animate([{ opacity: 0, transform: 'translate(0px, 0px)' }, { opacity: 1, transform: 'translate(4px, 16px)' }], { duration: 600, delay, easing: EASE, fill: 'backwards' });
  }
  function settlePiece(k, anim) {
    const [p, sh] = pieces(k); p.classList.remove('up'); sh.classList.remove('up');
    if (!anim) return;
    p.animate([{ opacity: 1, transform: 'translateY(8px) scale(1.03)' }, { opacity: 1, transform: 'translateY(0px) scale(1)' }], { duration: 500, easing: SETTLE });
    sh.animate([{ opacity: 1, transform: 'translate(4px, 16px)' }, { opacity: 0, transform: 'translate(0px, 0px)' }], { duration: 500, easing: EASE });
  }
  function words() {
    $('#pl1').textContent = lifted === 'E' ? 'Chuck Roast,' : 'Tap a cut,';
    $('#pl2').textContent = lifted === 'E' ? 'chalked 1/22/26' : 'see its tag';
    $$('#hit-d [aria-pressed]').forEach(e => e.setAttribute('aria-pressed', e.dataset.c === lifted ? 'true' : 'false'));
    $$('#hit-a [data-c="E"], #hit-b [data-c="E"]').forEach(e => e.setAttribute('aria-pressed', lifted === 'E' ? 'true' : 'false'));
  }
  function lift(k, { delay = 0, tagDelay = 500, anim = MO } = {}) {
    if (lifted === k) return;
    settle(anim, true);
    lifted = k;
    liftPiece(k, delay, anim);
    if (desk) setShelf(k, anim, delay + tagDelay, true);
    else { ptag.classList.add('on'); if (anim && G.rest === 'A') standEl(ptag, delay + tagDelay); setShelf('E', anim && G.rest === 'B', delay + tagDelay); }
    words();
  }
  function settle(anim = MO, quiet = false) {
    if (!lifted) return;
    settlePiece(lifted, anim);
    if (!desk && ptag.classList.contains('on')) { ptag.classList.remove('on'); if (anim && G.rest === 'A') tipEl(ptag); }
    lifted = null;
    if (!quiet) words();
  }

  /* ---------- the board: shelf change (the old head is hidden at once, then the new one stands) ---------- */
  const isTag = k => !!TAGF[k];
  function setShelf(k, anim = MO, delay = 0, force = false) {
    if (!desk && !force && scrollY > 1.2 * H && k !== shelfK) { glide(0.9 * H, 700, CARRY, () => setShelf(k, anim, delay, true)); return false; }
    if (k === shelfK) { if (force && anim) standEl($('#shelf-' + k + ' .hd'), delay); return false; }
    const old = $('#shelf-' + shelfK), nw = $('#shelf-' + k);
    old.hidden = true; nw.hidden = false; shelfK = k;
    if (STEERK.includes(k)) lastSteer = k;
    if (anim) {
      $$('.blk, .rows, .foot', old).forEach(e => e.animate([{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }], { duration: 150 }));
      standEl($('.hd', nw), delay);
      $$('.blk, .rows, .foot', nw).forEach(e => e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 150, fill: 'backwards' }));
    }
    J.state = 'on'; J.k = null;
    frame();
    if (anim && travel.classList.contains('on')) standEl(travel, delay);   // the new tag stands where the travelling one was
    return true;
  }

  /* ---------- scrolls the page makes: one Web Animation drives the real scroll ---------- */
  const dummy = document.createElement('i');
  dummy.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(dummy);
  let gl = null;
  function glide(y, ms, ease = INOUT, done = null) {
    y = clamp(Math.round(y), 0, root.scrollHeight - innerHeight);
    if (gl) { gl.a.cancel(); gl = null; }
    if (!MO || !ms) { window.scrollTo({ top: y, behavior: 'instant' }); frame(); if (done) done(); return; }
    gl = { a: dummy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: ease, fill: 'forwards' }), y0: scrollY, y1: y, done };
  }
  function tick() {
    if (gl) {
      const v = +getComputedStyle(dummy).opacity;
      window.scrollTo({ top: Math.round(gl.y0 + (gl.y1 - gl.y0) * v), behavior: 'instant' });
      if (gl.a.playState === 'finished') { window.scrollTo({ top: gl.y1, behavior: 'instant' }); gl.a.cancel(); const d = gl.done; gl = null; frame(); if (d) d(); }
      frame();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  ['wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { if (gl && !FILM) { gl.a.cancel(); gl = null; } }, { passive: true }));
  window.__glide = (y, ms) => glide(y, ms, INOUT);

  /* ---------- the journey of his tag (R3.A, R3.B, R3.C): a pure function of scroll ---------- */
  const J = { state: 'on', k: null };
  const ease2 = p => { p = clamp(p, 0, 1); return p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; };   // R3 notation
  const LANDP = { E: [622, 850, 100], c: [585, 660, 100], L: LAND.L, d: LAND.d, o: LAND.o, a: LAND.a };
  const CROPP = { E: 400, c: 200 };
  function travelImg(k) {
    if (J.k === k) return;
    J.k = k; const i = $('img', travel), r = TAGR[k];
    i.src = `assets/img/tag-${TAGF[k]}.webp`; i.width = 400; i.height = Math.round(400 / r);
  }
  function placeTravel(R) { G.tag = R; px(travel, { left: 0, top: 0, width: R.w, transform: `translate(${R.x}px, ${R.y}px)` }); }
  const mixR = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p) });
  function headRect(k) {
    const sh = $('#shelf-' + k);
    return { x: +sh.dataset.hx, y: +sh.dataset.hy, w: +sh.dataset.hw, h: +sh.dataset.hh };
  }
  // shown at/after the threshold T: tip flat once, stand again below T - 8
  function tipAt(past, back, el) {
    if (past) { if (J.state !== 'gone') { J.state = 'gone'; if (MO) tipEl(el, TIP, 250); el.classList.remove('on'); } }
    else if (back && J.state === 'gone') { J.state = 'on'; el.classList.add('on'); if (MO) standEl(el); }
    else if (J.state !== 'gone') el.classList.add('on');
  }
  function deskPlan(k) {
    const b = G.board, s = G.s, sc = G.sc, r0 = headRect(k), sh = $('#shelf-' + k), m = 16;
    const x0 = b.bx + r0.x, y0 = b.by + r0.y, w0 = r0.w, r = TAGR[k];
    const Yb = b.by + +sh.dataset.bottom + 0.6 * G.fs, S1 = y0 - m, lane = b.bx - 8 - w0;
    const P = { x0, y0, w0, Yb, S1, lane, m };
    if (LAND[k]) {
      const [xL, yL, wL] = LAND[k], w1 = wL * sc, h1 = w1 / r;
      P.X1 = xL * sc - w1 / 2; P.Y1 = 1536 * s + yL * sc - 0.5 * h1; P.w1 = w1;
      P.S2 = Math.min(P.Y1 - m, Math.max(P.Y1 - 0.55 * H + 0.5 * h1, Yb + 0.2 * H));
    }
    return P;
  }
  function deskRect(P, y, land) {
    if (y <= 0.5 * P.S1) return { x: P.x0, y: P.y0 - y, w: P.w0 };
    if (y <= P.S1) return { x: land ? lerp(P.x0, P.lane, ease2((y - 0.5 * P.S1) / (0.5 * P.S1))) : P.x0, y: P.y0 - y, w: P.w0 };
    if (!land) return { x: P.x0, y: P.y0 - y, w: P.w0 };
    if (y <= P.Yb) return { x: P.lane, y: P.m, w: P.w0 };
    if (y < P.S2) return mixR({ x: P.lane, y: P.m, w: P.w0 }, { x: P.X1, y: P.Y1 - P.S2, w: P.w1 }, ease2((y - P.Yb) / (P.S2 - P.Yb)));
    return { x: P.X1, y: P.Y1 - y, w: P.w1 };
  }
  function deskJourney(y) {
    const k = shelfK, sh = $('#shelf-' + k), hd = $('.hd', sh);
    if (!MO || !isTag(k)) { travel.classList.remove('on'); hd.classList.remove('off'); G.tag = null; return; }
    if (y < 1) { travel.classList.remove('on'); hd.classList.remove('off'); J.state = 'on'; G.tag = null; return; }
    hd.classList.add('off'); travelImg(k);
    const P = deskPlan(k), land = !!LAND[k];
    G.plan = P;
    placeTravel(deskRect(P, y, land));
    if (land) tipAt(y >= P.S2, y < P.S2 - 8, travel);
    else tipAt(y >= P.S1, y < P.S1 - 8, travel);
  }
  function phonePlan(k) {
    const h = H, sp = G.sp, sC = G.sC, r = TAGR[k], b = G.bhead;
    const P = { pB: { x: b.x, y: b.y, w: b.w }, crop: CROPP[k] || 0 };
    if (LANDP[k]) {
      const [xL, yL, wL] = LANDP[k], w1 = wL * sp, h1 = w1 / r;
      P.pC = { x: (1645 - 180) * sC - w1 / 2, y: 1372 * sC - h1 / 2, w: w1 };
      P.Dland = Math.max(0.1 * h, G.wallC + yL * sp - 0.7 * h);
      P.land = { x: (xL - P.crop) * sp - w1 / 2, y: G.wallC - P.Dland + yL * sp - h1 / 2, w: w1 };
    }
    return P;
  }
  function phoneJourney(y, rest, pBC) {
    const k = shelfK, h = H;
    if (!MO || !isTag(k)) { travel.classList.remove('on'); G.tag = null; return; }
    if (y <= 1.2 * h) {
      travel.classList.remove('on'); G.tag = null;
      if (J.state === 'gone') { J.state = 'on'; if (rest === 'B') standEl($('.hd', $('#shelf-' + k))); }
      return;
    }
    travelImg(k);
    const P = phonePlan(k); G.plan = P;
    if (!P.pC) {           // G and f: no tray; tip flat on the wall at 1.2h
      placeTravel(P.pB);
      if (J.state !== 'gone') { J.state = 'gone'; travel.classList.add('on'); if (MO) tipEl(travel, TIP, 250); travel.classList.remove('on'); }
      return;
    }
    const D = y - G.rel;
    let R;
    if (y < 1.9 * h) R = mixR(P.pB, P.pC, pBC);
    else if (D <= 0) R = P.pC;
    else if (D < P.Dland) R = mixR(P.pC, P.land, D / P.Dland);
    else R = { x: P.land.x, y: P.land.y - (D - P.Dland), w: P.land.w };
    placeTravel(R);
    tipAt(D >= P.Dland, D < P.Dland - 8, travel);
  }

  /* ---------- the phone's held wall (R2.3, R3.C) ---------- */
  function setGone(els, gone) { els.forEach(e => e && e.classList.toggle('gone', gone)); }
  function phoneFrame(y) {
    const h = H, fr = G.fr;
    let f, rest = null, pAB = -1, pBC = 0;
    if (!MO) { rest = y < 0.475 * h ? 'A' : y < 1.55 * h ? 'B' : 'C'; }
    else if (y < 0.35 * h) rest = 'A';
    else if (y < 0.6 * h) { pAB = easeIO((y - 0.35 * h) / (0.25 * h)); f = mix(fr.A, fr.B, pAB); }
    else if (y <= 1.2 * h) rest = 'B';
    else if (y < 1.9 * h) { pBC = easeIO((y - 1.2 * h) / (0.7 * h)); f = mix(fr.B, fr.C, pBC); }
    else { rest = 'C'; pBC = 1; }
    if (rest) f = fr[rest];
    G.rest = rest;
    const D = clamp(y - G.rel, 0, G.Dmax);
    inner.style.transform = D ? `translateY(${-D}px)` : '';
    wallbox.style.transform = `translate(${-f.L * f.s}px, ${-f.T * f.s}px) scale(${f.s})`;
    // the case crop (R3.C): committed when y crosses 1.2h; turns toward the tray during the step back, back after landing
    if (y <= 1.2 * h || G.crop === undefined) G.crop = MO && isTag(shelfK) ? (CROPP[shelfK] || 0) : 0;
    let cx = 0;
    if (MO && G.crop) {
      if (y > 1.2 * h && y < 1.9 * h) cx = G.crop * pBC;
      else if (y >= 1.9 * h) {
        const Dl = phonePlan(shelfK).Dland || 0;
        cx = D > Dl ? G.crop * (1 - ease2(Math.min(1, (D - Dl) / (0.15 * h)))) : G.crop;
      }
    }
    G.cx = cx;
    px(casebox, { top: (1536 - f.T) * f.s, transform: cx ? `translateX(${-cx * G.sp}px)` : '' });
    setGone([$('#foot1p'), $('#foot2p')], !(y >= 1.9 * h && cx < 0.01));
    setGone([$('#name')], !rest);
    setGone([$('#hl'), $('#patch')], rest !== 'A');
    setGone([board], rest !== 'B');
    setGone([$('#mapline'), $('#credit')], rest !== 'C');
    $('#hit-a').classList.toggle('off', rest !== 'A'); $('#hit-b').classList.toggle('off', rest !== 'B'); $('#hit-c').classList.toggle('off', rest !== 'C');
    // the P1 tag: at A, and on its way to the board's head during A to B
    if (pAB >= 0 && lifted === 'E' && shelfK === 'E') {
      const b = G.bhead;
      px(ptag, { left: lerp(G.p1.x, b.x, pAB), top: lerp(G.p1.y, b.y, pAB), width: lerp(G.p1.w, b.w, pAB), opacity: 1 });
    } else {
      px(ptag, { left: G.p1.x, top: G.p1.y, width: G.p1.w, opacity: rest === 'A' ? 1 : 0 });
    }
    ptag.classList.toggle('gone', rest !== 'A' && pAB < 0);
    phoneJourney(y, rest, pBC);
  }
  function mix(a, b, p) { return { s: lerp(a.s, b.s, p), L: lerp(a.L, b.L, p), T: lerp(a.T, b.T, p) }; }
  function frame() {
    if (!G.caseTop) return;
    const y = scrollY;
    if (desk) {
      [$('#name'), $('#hl'), board, $('#credit')].forEach(e => e.classList.remove('gone'));
      caseFig.style.visibility = 'visible';
      deskJourney(y);
    } else phoneFrame(y);
  }
  window.__frame = () => frame();
  addEventListener('scroll', () => { frame(); if (Math.abs(scrollY - sy0) > 40) stopIdle(); }, { passive: true });

  /* ---------- idle cycle (computer only, once) ---------- */
  let idle = [], idleOn = false, sy0 = 0;
  function startIdle() {
    idleOn = true; sy0 = scrollY; let t = 2200 + 7000;
    for (const k of ['d', 'o', 'E', 'L']) { idle.push(setTimeout(() => { if (idleOn && desk && scrollY < 1) lift(k); }, t)); t += 7000; }
    idle.push(setTimeout(() => { idleOn = false; }, t));
  }
  function stopIdle() { if (!idleOn) return; idleOn = false; idle.forEach(clearTimeout); idle = []; }
  addEventListener('pointerdown', stopIdle, true);
  addEventListener('keydown', stopIdle, true);

  /* ---------- input ---------- */
  const toBoard = () => glide(0.9 * H, 700, CARRY);
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('#ptag')) { e.preventDefault(); toBoard(); return; }
    const hd = t.closest('.hd');
    if (hd && hd.tagName === 'BUTTON') {
      e.preventDefault();
      const k = shelfK;
      const S2 = desk ? deskPlan(k).S2 : (LANDP[k] ? G.rel + phonePlan(k).Dland : 2.05 * H);
      glide(S2 + 2, 900, EASE); return;
    }
    const fl = t.closest('.fl');
    if (fl) { e.preventDefault(); const g = fl.dataset.go; setShelf(g === 'back' ? lastSteer : g); return; }
    const a = t.closest('#hit-a [data-c]'), b = t.closest('#hit-b [data-c]'), c = t.closest('#hit-c a[data-c]'), d = t.closest('#hit-d [data-c]');
    const nb = t.closest('nav button[data-shelf]');
    if (a || b) {
      e.preventDefault();
      const el = a || b, k = el.dataset.c;
      if (k === 'E') { if (lifted === 'E') settle(); else lift('E'); }
      else { setShelf(el.dataset.shelf, MO && !!b); if (a) toBoard(); }
      return;
    }
    if (c) { e.preventDefault(); if (c.dataset.shelf === shelfK) toBoard(); else setShelf(c.dataset.shelf, false); return; }
    if (d) {
      e.preventDefault();
      const k = d.dataset.c;
      if (LIFTK.includes(k)) { if (lifted === k) settle(); else lift(k); }
      else setShelf(d.dataset.shelf);
      return;
    }
    if (nb) { setShelf(nb.dataset.shelf); return; }
    if (t.closest('#stage') && !t.closest('a, button, [role="button"]')) settle();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { settle(); return; }
    const b = e.target.closest && e.target.closest('.hit [role="button"]');
    if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });

  /* ---------- states ---------- */
  function setMode() {
    if (lifted) settle(false);
    mode = desk;
    const dk = desk ? 'L' : 'E';
    if (shelfK !== dk) setShelf(dk, false);
  }
  function arrive() {
    root.classList.remove('arr');
    $$('#page *').forEach(e => e.getAnimations && e.getAnimations().forEach(a => a.cancel()));
    if (lifted) settle(false);
    const t0 = performance.now();
    const fonts = cb => { if (document.fonts.status === 'loaded') cb(0); else document.fonts.ready.then(() => cb(performance.now() - t0)); };
    const blur = [{ filter: 'blur(8px)', opacity: 0 }, { filter: 'blur(0px)', opacity: 1 }];
    if (!MO) { lift(desk ? 'L' : 'E', { anim: false }); return; }
    if (!desk) {
      G.rest = 'A';
      lift('E', { delay: 300, tagDelay: 450 });
      fonts(d => $('#hl').animate(blur, { duration: 600, delay: Math.max(0, 1000 - d), fill: 'backwards' }));
      $('#patch').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 1500, fill: 'backwards' });
    } else {
      lift('L', { delay: 300, tagDelay: 500 });
      fonts(d => $('#hl').animate(blur, { duration: 600, delay: Math.max(0, 1300 - d), fill: 'backwards' }));
      const sh = $('#shelf-L');
      for (const e of [$('#mark'), $('#name'), $('#col'), $('.blk', sh), $('.rows', sh), $('.foot', sh), $('#credit')])
        e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1800, fill: 'backwards' });
      if (!FILM) startIdle();
    }
  }

  layout();
  setMode();
  if (FILM) { window.__arrive = arrive; root.classList.remove('arr'); }
  else arrive();
  let rz = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      const was = mode; layout();
      if (was !== desk) { stopIdle(); setMode(); lift(desk ? 'L' : 'E', { anim: false }); }
    });
  });
  if (document.fonts) document.fonts.ready.then(() => layout());
  window.__state = () => ({ lifted, shelfK, desk, G, J });
})();
