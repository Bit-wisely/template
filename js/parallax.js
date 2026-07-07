/**
 * Robotics Club UCE — Parallax Scroll Engine (v6)
 *
 * Replicates the wishlabs.ai hero "fly up through the clouds" scroll:
 *
 *   Layer 0  Sky gradient      — barely zooms
 *   Layer 1  Palace + clouds   — scales up & drifts down, fades as you rise past it
 *   Layer 2  TEXT (fixed)      — stays put, fades out (no translate drift)
 *   Layer 3  Mist fog hills    — rise up and engulf the frame
 *   Layer 4  Close hill        — flies past aggressively (fly-through depth)
 *   Layer 5  Tagline           — fades in once the title clears
 */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp  = (a, b, t) => a + (b - a) * t;

  // ─── DOM Refs ────────────────────────────────────────────────────────────────
  const heroSection  = $('#hero');
  const layerSky     = $('#layer-sky');
  const layerPalace  = $('#layer-palace');
  const layerText    = $('#layer-text');
  const layerMist    = $('#layer-mist');
  const layerFg      = $('#layer-fg');
  const layerTagline = $('#layer-tagline');
  const scrollHint   = $('#scrollHint');
  const revealText   = $('#scrollRevealText');

  if (!heroSection) return;

  // ~360vh of scroll drives the full hero animation
  const SCROLL_RANGE_VH = 360;

  function setHeroHeight() {
    heroSection.style.height = (SCROLL_RANGE_VH / 100 * window.innerHeight) + 'px';
  }

  // ─── rAF-batched scroll handler ──────────────────────────────────────────────
  let ticking = false;
  function onScroll() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }

  // ─── Main per-frame update ───────────────────────────────────────────────────
  function update() {
    ticking = false;
    const scrollY = window.scrollY;
    const vh      = window.innerHeight;
    const heroH   = heroSection.offsetHeight;
    const progress = clamp(scrollY / (heroH - vh), 0, 1);

    // ── Layer 0: Sky — very gentle zoom ──────────────────────────────────────
    if (layerSky) {
      layerSky.style.transform = `scale(${1 + progress * 0.18})`;
    }

    // ── Layer 1: Palace + clouds — scales up, drifts DOWN as we ascend past it ─
    if (layerPalace) {
      const scale = 1 + progress * 2.0;
      const ty    = progress * 55;                       // moves down out of frame
      const op     = clamp(1 - (progress - 0.34) / 0.26, 0, 1);
      layerPalace.style.transform = `translateY(${ty}px) scale(${scale})`;
      layerPalace.style.opacity   = op;
    }

    // ── Layer 2: Text — FIXED position, subtle scale, fades out ──────────────
    // (wishlabs text does NOT translate; it holds and fades while hills zoom.)
    if (layerText) {
      const fadeP = clamp((progress - 0.26) / 0.22, 0, 1);
      layerText.style.opacity   = 1 - fadeP;
      layerText.style.transform = `scale(${1 + progress * 0.05})`;
    }

    // ── Layer 3: Mist fog hills — rise UP and zoom to engulf ──────────────────
    if (layerMist) {
      const scale = 1 + progress * 3.2;
      const ty    = progress * -70;                      // rises upward
      const op     = clamp(1 - (progress - 0.58) / 0.34, 0, 1);
      layerMist.style.transform = `translateY(${ty}px) scale(${scale})`;
      layerMist.style.opacity   = op;
    }

    // ── Layer 4: Close hill — flies past aggressively (fly-through) ───────────
    if (layerFg) {
      const scale = 1 + progress * 7.0;
      const ty    = progress * 90;                       // drops down & out
      const op     = clamp(1 - (progress - 0.48) / 0.36, 0, 1);
      layerFg.style.transform = `translateY(${ty}px) scale(${scale})`;
      layerFg.style.opacity   = op;
    }

    // ── Layer 5: Mid-scroll tagline — in 0.42→0.60, hold, out 0.80→0.96 ───────
    if (layerTagline) {
      let op = 0;
      if (progress >= 0.42 && progress < 0.60)      op = (progress - 0.42) / 0.18;
      else if (progress >= 0.60 && progress < 0.80) op = 1;
      else if (progress >= 0.80 && progress < 0.96) op = 1 - (progress - 0.80) / 0.16;
      layerTagline.style.opacity = clamp(op, 0, 1);
    }

    // ── Scroll hint fades immediately ─────────────────────────────────────────
    if (scrollHint) scrollHint.style.opacity = clamp(1 - progress * 18, 0, 1);

    // ── Post-hero word-by-word blur reveal ────────────────────────────────────
    animateScrollReveal(scrollY, vh);
  }

  // ─── Word-by-word blur + opacity reveal ──────────────────────────────────────
  function initScrollReveal() {
    if (!revealText) return;
    const words = revealText.textContent.trim().split(/\s+/);
    revealText.innerHTML = words.map(w => `<span class="sr-word">${w}</span>`).join(' ');
  }

  function animateScrollReveal(scrollY, vh) {
    if (!revealText) return;
    const words = revealText.querySelectorAll('.sr-word');
    if (!words.length) return;
    const rect   = revealText.getBoundingClientRect();
    const absTop = rect.top + scrollY;
    words.forEach((word, i) => {
      const trigger = absTop - vh * 0.92 + (i / words.length) * rect.height * 1.5;
      const p       = clamp((scrollY - trigger) / (vh * 0.26), 0, 1);
      word.style.opacity = lerp(0.05, 1, p);
      word.style.filter  = `blur(${lerp(9, 0, p)}px)`;
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    setHeroHeight();
    initScrollReveal();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { setHeroHeight(); update(); });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
