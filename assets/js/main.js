/* ==========================================================================
   Levo Lawn Care — interactions
   - First-visit intro: a riding mower drives across, revealing the logo
   - Page transitions: mower mows the screen to lawn, then mows in the new page
   - About page: mow-to-reveal blocks + scroll-driven mowed-path timeline
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOGO = "assets/img/logo-white.png";
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Shared art ---------- */

  var MOWER_SVG =
    '<svg viewBox="0 0 230 150" aria-hidden="true">' +
      '<ellipse cx="118" cy="146" rx="100" ry="5" fill="rgba(0,0,0,.28)"/>' +
      '<circle class="puff" cx="131" cy="48" r="6" fill="#d9d4c5"/>' +
      '<circle class="puff" cx="131" cy="48" r="6" fill="#d9d4c5"/>' +
      '<circle class="puff" cx="131" cy="48" r="6" fill="#d9d4c5"/>' +
      '<g class="chassis">' +
        '<rect x="62" y="116" width="104" height="14" rx="5" fill="#2b332d"/>' +
        '<rect x="62" y="116" width="104" height="4" rx="2" fill="#3c463f"/>' +
        '<rect x="128" y="54" width="6" height="18" rx="2" fill="#2b332d"/>' +
        '<path d="M26 112V96C26 80 38 70 56 70C74 70 86 80 88 92H118L124 78C126 72 131 70 138 70H186C200 70 210 80 210 94V112Z" fill="#7bc74d"/>' +
        '<path d="M26 103H210V112H26Z" fill="#5fa63a"/>' +
        '<path d="M150 80H196M150 86H198" stroke="#5fa63a" stroke-width="2.5" stroke-linecap="round"/>' +
        '<text x="150" y="100" font-family="Outfit, sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" fill="#13281c">LEVO</text>' +
        '<circle cx="206" cy="90" r="4" fill="#fff6c9"/>' +
        '<rect x="86" y="92" width="30" height="5" rx="2" fill="#2b332d"/>' +
        '<path d="M124 76L112 50" stroke="#2b332d" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="40" y="62" width="40" height="10" rx="4" fill="#1d2b22"/>' +
        '<rect x="36" y="34" width="11" height="34" rx="5" fill="#1d2b22"/>' +
        '<path d="M66 62L96 60L102 89" stroke="#24482f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<path d="M99 90H113" stroke="#2a1d14" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M51 64L55 32Q58 24 67 25L74 29L73 64Z" fill="#f5f1e6"/>' +
        '<path d="M66 34L86 50L103 49" stroke="#ece6d6" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<circle cx="106" cy="49" r="4.2" fill="#e3ad88"/>' +
        '<ellipse cx="111" cy="48" rx="11" ry="3.5" fill="none" stroke="#1d2420" stroke-width="4" transform="rotate(-25 111 48)"/>' +
        '<circle cx="66" cy="16" r="9" fill="#e3ad88"/>' +
        '<path d="M56.5 15Q56.5 4.5 66.5 4.5Q76 4.5 76 14Z" fill="#7bc74d"/>' +
        '<path d="M74 13H85" stroke="#4a8a2c" stroke-width="3.5" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="wheel"><circle cx="56" cy="114" r="26" fill="#161b18"/><circle cx="56" cy="114" r="20" fill="none" stroke="#2f3631" stroke-width="3" stroke-dasharray="5 5"/><circle cx="56" cy="114" r="11" fill="#ece6d6"/><path d="M56 105V123M47 114H65" stroke="#9aa39b" stroke-width="2.5"/></g>' +
      '<g class="wheel"><circle cx="180" cy="124" r="16" fill="#161b18"/><circle cx="180" cy="124" r="11" fill="none" stroke="#2f3631" stroke-width="2.5" stroke-dasharray="4 4"/><circle cx="180" cy="124" r="6" fill="#ece6d6"/><path d="M180 119V129M175 124H185" stroke="#9aa39b" stroke-width="2"/></g>' +
    '</svg>';

  var MOWER_TOP_SVG =
    '<svg viewBox="0 0 60 80" aria-hidden="true">' +
      '<rect x="0" y="24" width="60" height="26" rx="8" fill="#2b332d"/>' +
      '<rect x="3" y="50" width="13" height="23" rx="4" fill="#161b18"/>' +
      '<rect x="44" y="50" width="13" height="23" rx="4" fill="#161b18"/>' +
      '<rect x="7" y="5" width="10" height="15" rx="3" fill="#161b18"/>' +
      '<rect x="43" y="5" width="10" height="15" rx="3" fill="#161b18"/>' +
      '<rect x="12" y="2" width="36" height="72" rx="12" fill="#7bc74d"/>' +
      '<path d="M20 10H40M20 15H40" stroke="#5fa63a" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="18" cy="4.5" r="2" fill="#fff6c9"/><circle cx="42" cy="4.5" r="2" fill="#fff6c9"/>' +
      '<rect x="18" y="46" width="24" height="22" rx="6" fill="#1d2b22"/>' +
      '<circle cx="30" cy="33" r="6" fill="none" stroke="#1d2420" stroke-width="2.5"/>' +
      '<ellipse cx="30" cy="51" rx="12" ry="7" fill="#f5f1e6"/>' +
      '<rect x="26.5" y="40" width="7" height="6" rx="2" fill="#4a8a2c"/>' +
      '<circle cx="30" cy="49" r="6.5" fill="#7bc74d"/>' +
    '</svg>';

  // Deterministic pseudo-random so the grass looks the same every time
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function svgURL(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; }

  var GRASS = (function () {
    var r = rng(42), cols = ["#23492c", "#2e5c37", "#1d3f25", "#336840"], tips = "";
    for (var x = -2; x < 122; x += 2.6) {
      var h = 16 + r() * 24, lean = (r() - .5) * 12, c = cols[Math.floor(r() * cols.length)];
      tips += '<path d="M' + x.toFixed(1) + ' 40Q' + (x + lean * .4).toFixed(1) + ' ' + (40 - h * .6).toFixed(1) + ' ' + (x + lean).toFixed(1) + ' ' + (40 - h).toFixed(1) +
        'Q' + (x + 2 + lean * .3).toFixed(1) + ' ' + (40 - h * .5).toFixed(1) + ' ' + (x + 4.2).toFixed(1) + ' 40Z" fill="' + c + '"/>';
    }
    var body = '<rect width="90" height="90" fill="#23492c"/>', bc = ["#2e5c37", "#1a3920", "#356b3f", "#28512f"];
    for (var i = 0; i < 70; i++) {
      var bx = r() * 90, by = r() * 90, bl = 12 + r() * 16, bn = (r() - .5) * 8;
      body += '<path d="M' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'q' + (bn / 2).toFixed(1) + ' ' + (-bl / 2).toFixed(1) + ' ' + bn.toFixed(1) + ' ' + (-bl).toFixed(1) +
        '" stroke="' + bc[i % 4] + '" stroke-width="2" stroke-linecap="round" fill="none"/>';
    }
    return {
      tips: svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">' + tips + "</svg>"),
      body: svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">' + body + "</svg>")
    };
  })();

  function makeTallGrass(cls) {
    var el = document.createElement("div");
    el.className = cls;
    el.innerHTML = '<div class="tips"></div><div class="body"></div>';
    el.firstChild.style.backgroundImage = GRASS.tips;
    el.lastChild.style.backgroundImage = GRASS.body;
    return el;
  }

  function makeMower() {
    var m = document.createElement("div");
    m.className = "mower";
    m.innerHTML = MOWER_SVG;
    return m;
  }

  /* ---------- Grass clippings particles ---------- */

  function Clippings(canvas) {
    var ctx = canvas.getContext("2d"), parts = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    var colors = ["#7bc74d", "#5fa63a", "#8fd862", "#4a8a2c", "#a5e07c"];
    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    return {
      emit: function (x, y, n) {
        for (var i = 0; i < n; i++) {
          parts.push({ x: x + Math.random() * 10, y: y - Math.random() * 8, vx: -(1 + Math.random() * 4.5), vy: -(1.5 + Math.random() * 4.5),
            r: Math.random() * Math.PI, vr: (Math.random() - .5) * .4, life: 1, c: colors[(Math.random() * colors.length) | 0], w: 2 + Math.random() * 2, h: 4 + Math.random() * 5 });
        }
      },
      step: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i];
          p.vy += .22; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.r += p.vr; p.life -= .018;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 1.4); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
        }
        return parts.length;
      }
    };
  }

  /* ---------- Core: drive a mower across a container ---------- */
  // onFrame(edgeX) receives the x position of the cut line (under the mower's deck)
  function mowAcross(opts) {
    return new Promise(function (resolve) {
      var mower = opts.mower, width = opts.width, mw = mower.getBoundingClientRect().width;
      var mh = mw * (150 / 230);
      var start = -mw - 10, end = width + 30;
      var clip = opts.canvas ? Clippings(opts.canvas) : null;
      var t0 = null, done = false;
      var ease = function (t) { return t - Math.sin(2 * Math.PI * t) / (2 * Math.PI) * .55; };
      function frame(now) {
        if (t0 === null) t0 = now;
        var t = Math.min(1, (now - t0) / opts.duration), x = start + (end - start) * ease(t);
        mower.style.transform = "translate3d(" + x.toFixed(1) + "px," + (opts.yOffset || 0) + "px,0)";
        opts.onFrame(Math.max(0, x + mw * .58));
        if (clip) {
          if (t < 1 && x > -mw * .3 && x < width) clip.emit(x + mw * .28, opts.groundY - mh * .12, 3);
          var alive = clip.step();
        }
        if (t < 1 || (clip && alive)) {
          if (t >= 1 && !done) { done = true; resolve(); }
          requestAnimationFrame(frame);
        } else if (!done) { done = true; resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- Ready promise (resolves once intro/transition is out of the way) ---------- */
  var readyResolve;
  var pageReady = new Promise(function (r) { readyResolve = r; });
  function markReady() { document.body.classList.add("is-ready"); readyResolve(); }

  /* ---------- First-visit intro ---------- */
  function runIntro() {
    var overlay = document.createElement("div");
    overlay.className = "mow-overlay loader";
    overlay.setAttribute("role", "presentation");
    overlay.innerHTML =
      '<div class="loader-band"><div class="lawn-cut"><img src="' + LOGO + '" alt=""></div></div>' +
      '<canvas></canvas>' +
      '<p class="loader-tag">Life’s full. <span class="accent">We’ve got your lawn.</span></p>' +
      '<button class="loader-skip" type="button">Skip intro</button>';
    var band = overlay.querySelector(".loader-band");
    var tall = makeTallGrass("lawn-tall");
    band.appendChild(tall);
    var mower = makeMower();
    overlay.appendChild(mower);
    document.body.appendChild(overlay);
    root.classList.add("t-built");

    var bandRect = band.getBoundingClientRect();
    var mw = mower.getBoundingClientRect().width, mh = mw * 150 / 230;
    var groundY = bandRect.top + bandRect.height * .78;
    mower.style.top = (groundY - mh) + "px";

    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      store.set("levo:intro", "1");
      overlay.classList.add("leaving");
      markReady();
      setTimeout(function () { overlay.remove(); root.classList.remove("t-intro"); }, 950);
    }
    overlay.querySelector(".loader-skip").addEventListener("click", finish);

    var tag = overlay.querySelector(".loader-tag");
    var vw = window.innerWidth;
    mowAcross({
      mower: mower, width: vw, duration: Math.min(2600, 1700 + vw * .6), canvas: overlay.querySelector("canvas"), groundY: groundY,
      onFrame: function (edge) {
        tall.style.clipPath = "inset(0 0 0 " + edge + "px)";
        if (edge > vw * .55) tag.classList.add("show");
      }
    }).then(function () { setTimeout(finish, 450); });
  }

  /* ---------- Page transitions ---------- */
  function buildWipe() {
    var overlay = document.createElement("div");
    overlay.className = "mow-overlay wipe";
    overlay.innerHTML = '<div class="wipe-lawn"><img src="' + LOGO + '" alt=""></div><canvas></canvas>';
    var mower = makeMower();
    overlay.appendChild(mower);
    document.body.appendChild(overlay);
    var mw = mower.getBoundingClientRect().width, mh = mw * 150 / 230;
    var groundY = window.innerHeight / 2 + mh / 2;
    mower.style.top = (groundY - mh) + "px";
    return { overlay: overlay, lawn: overlay.querySelector(".wipe-lawn"), mower: mower, groundY: groundY };
  }

  function runEnter() {
    var w = buildWipe();
    root.classList.add("t-built");
    markReady();
    var vw = window.innerWidth;
    mowAcross({
      mower: w.mower, width: vw, duration: 850, canvas: w.overlay.querySelector("canvas"), groundY: w.groundY,
      onFrame: function (edge) { w.lawn.style.clipPath = "inset(0 0 0 " + edge + "px)"; }
    }).then(function () {
      w.overlay.remove();
      root.classList.remove("t-enter");
    });
  }

  var leaving = false;
  function runExit(href) {
    if (leaving) return; leaving = true;
    document.body.classList.remove("nav-open");
    var w = buildWipe(), vw = window.innerWidth;
    w.lawn.style.clipPath = "inset(0 100% 0 0)";
    mowAcross({
      mower: w.mower, width: vw, duration: 600, canvas: null, groundY: w.groundY,
      onFrame: function (edge) { w.lawn.style.clipPath = "inset(0 " + Math.max(0, vw - edge) + "px 0 0)"; }
    }).then(function () {
      store.set("levo:t", "1");
      window.location.href = href;
    });
  }

  function interceptLinks() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.pathname === location.pathname || (/\/(index\.html)?$/.test(url.pathname) && /\/(index\.html)?$/.test(location.pathname))) {
        e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); document.body.classList.remove("nav-open"); return;
      }
      e.preventDefault();
      runExit(url.href);
    });
    // Back/forward cache: never come back to a covered screen
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        leaving = false;
        document.querySelectorAll(".mow-overlay").forEach(function (o) { o.remove(); });
        root.classList.remove("t-enter", "t-intro");
        markReady();
      }
    });
  }

  /* ---------- Header, menu, scroll reveals ---------- */
  function initChrome() {
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    var toggle = document.querySelector(".menu-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();

    var items = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- About: mow-to-reveal blocks ---------- */
  function initMowReveals() {
    var blocks = document.querySelectorAll("[data-mow-reveal]");
    if (!blocks.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    blocks.forEach(function (block) {
      block.classList.add("mow-reveal");
      var layer = document.createElement("div");
      layer.className = "mow-cover";
      layer.style.clipPath = "none";
      var tall = makeTallGrass("lawn-tall");
      tall.style.top = "-30px";
      layer.appendChild(tall);
      block.appendChild(layer);

      var rig = document.createElement("div");
      rig.style.cssText = "position:absolute;inset:-14px -10px;z-index:6;pointer-events:none;";
      var canvas = document.createElement("canvas");
      canvas.style.cssText = "position:absolute;left:0;top:-120px;width:100%;height:calc(100% + 120px);";
      var mower = makeMower();
      mower.style.width = "clamp(150px, 18vw, 220px)";
      mower.style.top = "auto";
      mower.style.bottom = "-4px";
      mower.style.transform = "translate3d(-400px,0,0)";
      rig.appendChild(canvas);
      rig.appendChild(mower);
      block.appendChild(rig);
      block._mow = { layer: layer, tall: tall, rig: rig, mower: mower, canvas: canvas };
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var b = en.target, m = b._mow;
        pageReady.then(function () {
          var w = m.rig.getBoundingClientRect().width;
          var groundY = m.canvas.getBoundingClientRect().height - 4;
          return mowAcross({
            mower: m.mower, width: w, duration: Math.min(2200, 1100 + w * .7), canvas: m.canvas, groundY: groundY,
            onFrame: function (edge) { m.layer.style.clipPath = "inset(0 0 0 " + edge + "px)"; }
          });
        }).then(function () {
          b.classList.add("mowed");
          m.rig.remove(); m.layer.remove();
        });
      });
    }, { threshold: .35 });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- About: scroll-driven mowed-path timeline ---------- */
  function initTimeline() {
    var tl = document.querySelector("[data-timeline]");
    if (!tl) return;
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "timeline-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<defs><mask id="tlMask" maskUnits="userSpaceOnUse"><path class="tl-mask" fill="none" stroke="#fff" stroke-width="50" stroke-linecap="round"/></mask></defs>' +
      '<path class="tl-tall" fill="none" stroke="#23492c" stroke-width="40" stroke-linecap="round"/>' +
      '<path class="tl-tall2" fill="none" stroke="#2e5c37" stroke-width="40" stroke-dasharray="2 5"/>' +
      '<g mask="url(#tlMask)">' +
        '<path class="tl-cut" fill="none" stroke="#5c9e40" stroke-width="36" stroke-linecap="round"/>' +
        '<path class="tl-cut2" fill="none" stroke="#6cb04c" stroke-width="36" stroke-dasharray="26 26"/>' +
      '</g>';
    tl.insertBefore(svg, tl.firstChild);
    var mower = document.createElement("div");
    mower.className = "timeline-mower";
    mower.innerHTML = MOWER_TOP_SVG;
    tl.appendChild(mower);

    var paths = svg.querySelectorAll("path:not(.tl-mask)"), maskPath = svg.querySelector(".tl-mask");
    var measure = svg.querySelector(".tl-cut");
    var milestones = Array.prototype.slice.call(tl.querySelectorAll(".milestone"));
    var len = 0, dotLens = [], current = 0, target = 0, running = false;

    function build() {
      var box = tl.getBoundingClientRect();
      var pts = milestones.map(function (m) {
        var d = m.querySelector(".milestone-dot").getBoundingClientRect();
        return { x: d.left + d.width / 2 - box.left, y: d.top + d.height / 2 - box.top };
      });
      var amp = window.innerWidth > 760 ? 80 : 12;
      var x0 = pts[0].x, d = "M" + x0 + " 0", prev = { x: x0, y: 0 };
      pts.concat([{ x: pts[pts.length - 1].x, y: box.height }]).forEach(function (p, i) {
        var s = i % 2 ? -1 : 1, dy = p.y - prev.y;
        d += " C" + (prev.x + s * amp) + " " + (prev.y + dy / 3) + " " + (p.x + s * amp) + " " + (prev.y + 2 * dy / 3) + " " + p.x + " " + p.y;
        prev = p;
      });
      paths.forEach(function (p) { p.setAttribute("d", d); });
      maskPath.setAttribute("d", d);
      len = measure.getTotalLength();
      maskPath.setAttribute("stroke-dasharray", len + " " + len);
      // find path length at each milestone (nearest y)
      dotLens = pts.map(function (pt) {
        var lo = 0, hi = len;
        for (var k = 0; k < 24; k++) { var mid = (lo + hi) / 2; if (measure.getPointAtLength(mid).y < pt.y) lo = mid; else hi = mid; }
        return lo;
      });
      render(current);
    }

    function render(p) {
      var at = len * p;
      maskPath.setAttribute("stroke-dashoffset", (len - at).toFixed(1));
      var a = measure.getPointAtLength(Math.max(0, at)), b = measure.getPointAtLength(Math.min(len, at + 2));
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      mower.style.transform = "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0) rotate(" + ang.toFixed(1) + "deg)";
      milestones.forEach(function (m, i) { m.classList.toggle("active", at >= dotLens[i] - 4); });
    }

    function computeTarget() {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      target = Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
    }
    function loop() {
      current += (target - current) * (reduceMotion ? 1 : .12);
      render(current);
      if (Math.abs(target - current) > .0005) requestAnimationFrame(loop); else { current = target; render(current); running = false; }
    }
    function onScroll() { computeTarget(); if (!running) { running = true; requestAnimationFrame(loop); } }

    build();
    computeTarget(); current = target; render(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { build(); onScroll(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { build(); }).observe(tl);
    window.addEventListener("load", build);
  }

  /* ---------- Boot ---------- */
  function boot() {
    initChrome();
    if (!reduceMotion) interceptLinks();
    if (root.classList.contains("t-intro")) runIntro();
    else if (root.classList.contains("t-enter")) runEnter();
    else markReady();
    initMowReveals();
    initTimeline();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
