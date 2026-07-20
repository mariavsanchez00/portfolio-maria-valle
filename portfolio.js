/* ============================================================
   PORTFOLIO — María Valle · interactions
   ============================================================ */
(function () {
  "use strict";
  document.documentElement.classList.add("mvjs");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- language switch ---------- */
  function setLang(lang) {
    document.body.dataset.lang = lang;
    try { localStorage.setItem("mv-lang", lang); } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
    document.documentElement.setAttribute("lang", lang);
  }
  let savedLang = "es";
  try { savedLang = localStorage.getItem("mv-lang") || "es"; } catch (e) {}
  function safe(name, fn) { try { fn(); } catch (e) { try { console.log("[mv] error in " + name, e.message); } catch(_){} } }
  function boot() {
    setLang(savedLang);
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
    safe("reveal", initReveal);
    safe("cursor", initCursor);
    safe("nav", initNav);
    safe("parallax", initParallax);
    safe("mascot", initMascot);
    safe("mascotTalk", initMascotTalk);
    safe("counters", initCounters);
    safe("heroPattern", initHeroPattern);
    safe("toTop", initToTop);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ---------- custom cursor ---------- */
  function initCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const ring = document.querySelector(".cursor__ring");
    const dot = document.querySelector(".cursor__dot");
    const label = document.querySelector(".cursor__label");
    if (!ring || !dot) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    }
    loop();
    const hoverSel = "a, button, [data-cursor], .shot, .svc, .logo-card, .tool-pill";
    document.querySelectorAll(hoverSel).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
        const txt = el.getAttribute("data-cursor");
        label.textContent = txt || "";
        label.style.display = txt ? "block" : "none";
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
      });
    });
    document.addEventListener("mouseleave", () => { ring.style.opacity = "0"; dot.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { ring.style.opacity = "1"; dot.style.opacity = "1"; });
  }

  /* ---------- scroll reveal (rect-based, robust) ---------- */
  function initReveal() {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (prefersReduced) { els.forEach((el) => el.classList.add("is-in")); return; }
    let pending = els.slice();
    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add("is-in"); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener("scroll", onScroll);
    }
    function onScroll() { requestAnimationFrame(check); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check();
  }

  /* ---------- progress bar + dot nav active ---------- */
  function initNav() {
    const bar = document.querySelector(".progress");
    const dots = Array.from(document.querySelectorAll(".dotnav a"));
    const sections = dots.map((d) => document.querySelector(d.getAttribute("href"))).filter(Boolean);
    function onScroll() {
      const h = document.documentElement;
      const sc = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.width = (max > 0 ? (sc / max) * 100 : 0) + "%";
      let active = 0;
      sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= window.innerHeight * 0.42) active = i; });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- parallax on [data-parallax] ---------- */
  function initParallax() {
    if (prefersReduced) return;
    const els = Array.from(document.querySelectorAll("[data-parallax]"));
    if (!els.length) return;
    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;            // -1..1 roughly
        const speed = parseFloat(el.dataset.parallax) || 12;
        el.style.transform = `translate3d(0, ${(-off * speed).toFixed(2)}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Mini María blink (CSS class toggle on overlay) ---------- */
  function initMascot() {
    if (prefersReduced) return;
    const lids = document.querySelectorAll(".mascot-eyes");
    if (!lids.length) return;
    function blink() {
      lids.forEach((l) => {
        l.classList.add("is-blink");
        setTimeout(() => l.classList.remove("is-blink"), 160);
      });
      setTimeout(blink, 2600 + Math.random() * 3200);
    }
    setTimeout(blink, 1800);
  }

  /* ---------- Mini María "háblame" talk easter egg ---------- */
  function initMascotTalk() {
    const mascots = document.querySelectorAll(".mascot--talk");
    if (!mascots.length) return;
    const label = document.querySelector(".cursor__label");
    const fine = window.matchMedia("(pointer: fine)").matches;
    let typeTimer = null;
    function typeWord(word) {
      if (!label) return;
      clearTimeout(typeTimer);
      let i = 0;
      (function step() {
        label.textContent = word.slice(0, i) + (i < word.length ? "▍" : "");
        if (i < word.length) { i++; typeTimer = setTimeout(step, 65); }
      })();
    }
    function goContact() {
      const c = document.getElementById("contact");
      if (!c) return;
      const y = c.getBoundingClientRect().top + window.pageYOffset - 20;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    }
    mascots.forEach((m) => {
      m.style.pointerEvents = "auto";
      m.addEventListener("click", goContact);
      if (fine) {
        m.addEventListener("mouseenter", () => {
          document.body.classList.remove("cursor-hover");
          document.body.classList.add("cursor-talk");
          typeWord("háblame");
        });
        m.addEventListener("mouseleave", () => {
          document.body.classList.remove("cursor-talk");
          clearTimeout(typeTimer);
          if (label) label.textContent = "";
        });
      }
    });
  }

  /* ---------- count-up on metric numbers ---------- */
  function initCounters() {
    const nums = Array.from(document.querySelectorAll(".count[data-count]"));
    if (!nums.length) return;
    if (prefersReduced) { nums.forEach((n) => { n.textContent = n.dataset.count; }); return; }
    function run(el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      const dur = 1100; let start = null;
      function tick(t) {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.45 });
      nums.forEach((n) => io.observe(n));
    } else {
      nums.forEach(run);
    }
  }

  /* ---------- interactive hero pattern (cursor glow + parallax) ---------- */
  function initHeroPattern() {
    if (prefersReduced) return;
    const hero = document.getElementById("hero");
    if (!hero || window.matchMedia("(pointer: coarse)").matches) return;
    const base = hero.querySelector(".hero__pattern:not(.hero__pattern--glow)");
    const glow = hero.querySelector(".hero__pattern--glow");
    let raf = null, mx = 0, my = 0, rect = null;
    hero.addEventListener("mouseenter", () => { hero.classList.add("is-hovering"); rect = hero.getBoundingClientRect(); });
    hero.addEventListener("mouseleave", () => {
      hero.classList.remove("is-hovering");
      if (base) base.style.transform = "";
      if (glow) glow.style.transform = "";
    });
    hero.addEventListener("mousemove", (e) => {
      rect = rect || hero.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      hero.style.setProperty("--mx", mx + "px");
      hero.style.setProperty("--my", my + "px");
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const dx = (mx / rect.width - 0.5), dy = (my / rect.height - 0.5);
        if (base) base.style.transform = "translate(" + (-dx * 16).toFixed(1) + "px," + (-dy * 16).toFixed(1) + "px)";
        if (glow) glow.style.transform = "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 10).toFixed(1) + "px)";
      });
    });
  }

  /* ---------- back-to-top button ---------- */
  function initToTop() {
    const btn = document.querySelector(".to-top");
    if (!btn) return;
    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle("is-visible", y > 560);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
    onScroll();
  }
})();
