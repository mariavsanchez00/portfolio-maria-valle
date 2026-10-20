(function () {
  "use strict";
  document.documentElement.classList.add("mvjs");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "es";
  try { lang = localStorage.getItem("mv-lang") || "es"; } catch (e) {}
  function setLang(l) {
    lang = l; document.body.dataset.lang = l; document.documentElement.lang = l;
    try { localStorage.setItem("mv-lang", l); } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach(function (b) { b.classList.toggle("is-active", b.dataset.lang === l); });
    if (typeof fitFigures === "function") setTimeout(fitFigures, 0);
  }
  function boot() {
    setLang(lang);
    document.querySelectorAll(".lang-switch button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });
    var hdr = document.querySelector(".hdr");
    function onScroll() { if (hdr) hdr.classList.toggle("is-scrolled", window.scrollY > 8); }
    function setH() { if (hdr) document.documentElement.style.setProperty("--hdr-h", hdr.offsetHeight + "px"); }
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", setH); onScroll(); setH();
    reveal(); blink(); hoverTag(); filters(); lazyVideos(); heroPattern(); parallax(); try { headerLogo(); } catch (e) { var h0 = document.querySelector(".hdr"); if (h0) h0.classList.remove("is-logo-hidden"); } fitFigures(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFigures); var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(fitFigures, 120); });
    document.querySelectorAll(".mascot").forEach(function (m) {
      m.addEventListener("click", function () { var c = document.getElementById("contacto"); if (c) window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - 90, behavior: reduced ? "auto" : "smooth" }); });
    });
  }

  function lazyVideos() {
    var vids = [].slice.call(document.querySelectorAll("video[data-src]"));
    if (!vids.length) return;
    function play(v) { if (!v.getAttribute("src")) v.setAttribute("src", v.getAttribute("data-src")); var p = v.play && v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!("IntersectionObserver" in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { var v = e.target; if (e.isIntersecting) play(v); else if (v.getAttribute("src") && v.pause) v.pause(); });
    }, { rootMargin: "300px 0px" });
    vids.forEach(function (v) { io.observe(v); });
  }

  function heroPattern() {
    if (reduced) return;
    var hero = document.getElementById("hero");
    if (!hero || window.matchMedia("(pointer: coarse)").matches) return;
    var base = hero.querySelector(".hero__pattern:not(.hero__pattern--glow)");
    var glow = hero.querySelector(".hero__pattern--glow");
    var raf = null, mx = 0, my = 0, rect = null;
    hero.addEventListener("mouseenter", function () { hero.classList.add("is-hovering"); rect = hero.getBoundingClientRect(); });
    hero.addEventListener("mouseleave", function () {
      hero.classList.remove("is-hovering");
      if (base) base.style.transform = "";
      if (glow) glow.style.transform = "";
    });
    hero.addEventListener("mousemove", function (e) {
      rect = rect || hero.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      hero.style.setProperty("--mx", mx + "px");
      hero.style.setProperty("--my", my + "px");
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var dx = (mx / rect.width - 0.5), dy = (my / rect.height - 0.5);
        if (base) base.style.transform = "translate(" + (-dx * 16).toFixed(1) + "px," + (-dy * 16).toFixed(1) + "px)";
        if (glow) glow.style.transform = "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 10).toFixed(1) + "px)";
      });
    });
  }
  function parallax() {
    if (reduced) return;
    var els = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (!els.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2 - vh / 2) / vh;
        var speed = parseFloat(el.dataset.parallax) || 12;
        el.style.transform = "translate3d(0," + (-off * speed).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  function headerLogo() {
    var hdr = document.querySelector(".hdr"), mark = document.querySelector(".hero__wordmark");
    if (!hdr) return;
    if (!mark || !("IntersectionObserver" in window)) { hdr.classList.remove("is-logo-hidden"); return; }
    var io;
    function start() {
      if (io) io.disconnect();
      io = new IntersectionObserver(function (en) { en.forEach(function (e) { hdr.classList.toggle("is-logo-hidden", e.isIntersecting); }); },
        { rootMargin: "-" + hdr.offsetHeight + "px 0px 0px 0px", threshold: 0 });
      io.observe(mark);
    }
    start(); window.addEventListener("resize", start);
  }
  function fitFigures() {
    [].slice.call(document.querySelectorAll(".results")).forEach(function (g) {
      [false, true].forEach(function (text) {
        var els = [].slice.call(g.querySelectorAll(text ? ".res__n.is-text" : ".res__n:not(.is-text)"));
        if (!els.length) return;
        els.forEach(function (e) { e.style.fontSize = ""; });
        var min = Infinity;
        els.forEach(function (e) {
          var fs = parseFloat(getComputedStyle(e).fontSize), avail = e.clientWidth, need = e.scrollWidth;
          if (need > avail + 0.5) min = Math.min(min, Math.floor(fs * avail / need * 0.97));
        });
        if (min !== Infinity) els.forEach(function (e) { e.style.fontSize = min + "px"; });
      });
    });
  }
  function reveal() {
    var els = [].slice.call(document.querySelectorAll(".reveal"));
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { var r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add("is-in"); }); }, 60);
  }
  function blink() {
    if (reduced) return;
    var lids = document.querySelectorAll(".mascot-eyes"); if (!lids.length) return;
    (function b() { lids.forEach(function (l) { l.classList.add("is-blink"); setTimeout(function () { l.classList.remove("is-blink"); }, 150); }); setTimeout(b, 2600 + Math.random() * 3000); })();
  }
  function hoverTag() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    var tag = document.createElement("div"); tag.className = "hover-tag"; document.body.appendChild(tag);
    document.querySelectorAll("[data-tag]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { tag.textContent = el.getAttribute(lang === "en" ? "data-tag-en" : "data-tag") || el.getAttribute("data-tag"); tag.classList.add("is-on"); });
      el.addEventListener("mouseleave", function () { tag.classList.remove("is-on"); });
      el.addEventListener("mousemove", function (e) { tag.style.left = e.clientX + "px"; tag.style.top = e.clientY + "px"; });
    });
  }
  function filters() {
    var bar = document.querySelector(".filters"); if (!bar) return;
    var grid = document.querySelector(".grid[data-filterable]");
    var cards = [].slice.call(grid.querySelectorAll(".card"));
    var chips = [].slice.call(bar.querySelectorAll(".chip"));
    function apply(f, scroll) {
      if (!chips.some(function (c) { return c.dataset.f === f; })) f = "todo";
      chips.forEach(function (c) { c.classList.toggle("is-active", c.dataset.f === f); c.setAttribute("aria-pressed", c.dataset.f === f); });
      cards.forEach(function (c) { c.hidden = !(f === "todo" || (" " + c.dataset.cats + " ").indexOf(" " + f + " ") > -1); c.classList.add("is-in"); });
      grid.classList.remove("is-filtering"); void grid.offsetWidth; grid.classList.add("is-filtering");
      if (scroll && window.scrollY > bar.offsetTop) window.scrollTo({ top: bar.offsetTop - 10, behavior: reduced ? "auto" : "smooth" });
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function (e) { e.preventDefault(); var f = c.dataset.f; history.replaceState(null, "", f === "todo" ? location.pathname : "#" + f); apply(f, true); });
    });
    window.addEventListener("hashchange", function () { apply(location.hash.slice(1) || "todo"); });
    apply(location.hash.slice(1) || "todo");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

document.querySelectorAll('.m--live').forEach(f=>{const i=f.querySelector('iframe');if(!i)return;const fit=()=>{i.style.transform='scale('+(f.clientWidth/1440)+')'};fit();new ResizeObserver(fit).observe(f)});
