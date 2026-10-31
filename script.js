(function () {
  // Nav turns solid after the hero
  var nav = document.getElementById("nav"), hero = document.querySelector(".hero");
  function onScroll() { nav.classList.toggle("solid", window.scrollY > hero.offsetHeight - 80); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Tool filters
  var grid = document.getElementById("toolGrid");
  document.querySelectorAll(".filter").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      grid.querySelectorAll(".tool").forEach(function (t) { t.hidden = !(b.dataset.f === "all" || t.dataset.c === b.dataset.f); });
    });
  });

  // Copy email
  var toast = document.getElementById("toast");
  function say(m) { toast.textContent = m; toast.classList.add("show"); setTimeout(function () { toast.classList.remove("show"); }, 1600); }
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.dataset.copy), txt = el.textContent.trim();
      var sel = function () { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); say("Selected. Press Ctrl+C to copy"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { say("Email copied"); }, sel); else sel();
    });
  });

  // Tool animations: each [data-m] element plays inside one looping cycle between fractions a..b
  var CYCLE = 5600;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var svgs = [].slice.call(document.querySelectorAll("svg.anim")).map(function (svg, i) {
    return { svg: svg, els: [].slice.call(svg.querySelectorAll("[data-m]")), off: i * 260, on: false };
  });
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function apply(item, t) {
    var g = t > .92 ? 1 - (t - .92) / .08 : 1;
    item.svg.style.opacity = g;
    item.els.forEach(function (el) {
      var a = +el.dataset.a, b = +el.dataset.b, raw = Math.min(1, Math.max(0, (t - a) / (b - a))), p = ease(raw), m = el.dataset.m;
      if (m === "draw") el.style.strokeDashoffset = 1 - p;
      else if (m === "fade") el.style.opacity = p;
      else if (m === "out") el.style.opacity = 1 - p;
      else if (m === "pop") { el.style.opacity = p; el.style.transform = "scale(" + (.4 + .6 * p) + ")"; }
      else if (m === "sx") el.style.transform = "scaleX(" + p + ")";
      else if (m === "sy") el.style.transform = "scaleY(" + p + ")";
      else if (m === "rot") el.style.transform = "rotate(" + ((1 - p) * (+el.dataset.deg || 0)) + "deg)";
      else if (m === "tx") el.style.transform = "translateX(" + ((1 - p) * (+el.dataset.dx || 0)) + "px)";
      else if (m === "blink") el.style.opacity = raw <= 0 ? 0 : raw >= 1 ? 1 : (Math.sin(raw * Math.PI * 7) > -0.2 ? 1 : .2);
    });
  }
  document.querySelectorAll(".tool").forEach(function (t) { var c = t.querySelector(".cat"); if (c) { c.className = "eyebrow"; t.querySelector(".info").prepend(c); } });
  svgs.forEach(function (s) { apply(s, .86); });
  if (reduce) return;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { svgs.forEach(function (s) { if (s.svg === e.target) s.on = e.isIntersecting; }); }); }, { rootMargin: "80px" });
    svgs.forEach(function (s) { io.observe(s.svg); });
  } else svgs.forEach(function (s) { s.on = true; });
  function frame(now) {
    svgs.forEach(function (s) { if (s.on) apply(s, ((now + s.off) % CYCLE) / CYCLE); });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
(function () {
  var dlg = document.getElementById("demo");
  if (!dlg || !dlg.showModal) return;
  var stage = document.getElementById("demoStage"), stepsEl = document.getElementById("demoSteps");
  var titleEl = document.getElementById("demoTitle"), catEl = document.getElementById("demoCat");
  var pauseBtn = document.getElementById("demoPause");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cur = null, t = 0, playing = false, last = 0, raf = 0, opener = null;

  var APPS = {
    revit: { name: "Revit", tabs: ["File", "Architecture", "Structure", "Annotate", "View", "Manage", "Fronkkit"], panel: "Properties",
      groups: [
        { name: "Health Check", btns: [["health", "Model Health", "Check"]] },
        { name: "Shop Drawing", btns: [["autodim", "Auto Dim", "Grid"], ["rebar", "Draw", "Rebar"], ["status", "Element", "Status"], ["export", "Sheet", "Export"]] },
        { name: "PEB", btns: [["tapered", "Tapered", "Member"]] }] },
    navis: { name: "Navisworks", tabs: ["Home", "Viewpoint", "Review", "Animation", "View", "Output", "Fronkkit"], panel: "Selection Tree",
      groups: [
        { name: "Tools", btns: [["clashdet", "Clash", "Detective"], ["inspect", "Selection", "Inspector"]] },
        { name: "Coordination", btns: [["clash", "Clash Run", "Tracker"]] }] }
  };
  var ICONS = {
    health: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    autodim: '<path d="M3 6v12M21 6v12M3 12h18M1 14l4-4M19 14l4-4"/>',
    rebar: '<rect x="5" y="2" width="14" height="20"/><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>',
    status: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    export: '<path d="M5 2h10l4 4v16H5z"/><path d="M12 10v8M8.5 14.5L12 18l3.5-3.5"/>',
    tapered: '<path d="M8 21h4l3-18H5z"/>',
    clashdet: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
    inspect: '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 9v11"/>',
    clash: '<path d="M4 20V8M10 20V12M16 20v-5M22 20H2"/><circle cx="18" cy="6" r="3"/>'
  };
  function sheetsFrame(meta) {
    var s = '<rect x="0" y="0" width="960" height="540" style="fill:var(--paper)"/>';
    s += '<rect x="0" y="0" width="960" height="24" style="fill:var(--stone)"/><text class="m s" x="480" y="16" text-anchor="middle">' + meta.view + ' · Google Sheets</text>';
    var m = ["File", "Edit", "View", "Insert", "Format", "Data", "Tools", "Extensions"], x = 14;
    m.forEach(function (t) { s += '<text class="s m" x="' + x + '" y="40">' + t + '</text>'; x += t.length * 7 + 16; });
    s += '<path class="lt" d="M0 46h960M0 74h960M0 92h960"/>';
    for (var i = 0; i < 12; i++) s += '<rect x="' + (14 + i * 30) + '" y="53" width="18" height="14" rx="2" style="fill:var(--stone)"/>';
    s += '<text class="m s" x="14" y="87">fx</text>';
    s += '<rect x="0" y="92" width="40" height="424" style="fill:var(--cream)"/><rect x="40" y="92" width="920" height="18" style="fill:var(--cream)"/>';
    "ABCDEF".split("").forEach(function (c, i) { var cx = i === 0 ? 120 : 200 + (i - 1) * 140 + 70; s += '<text class="m s" x="' + cx + '" y="105" text-anchor="middle" style="font-size:9.5px">' + c + '</text>'; });
    for (var r = 0; r < 10; r++) s += '<text class="m s" x="20" y="' + (134 + r * 40) + '" text-anchor="middle" style="font-size:9.5px">' + (r + 1) + '</text>';
    s += '<path class="lt" d="M40 92v424M200 92v18"/>';
    s += '<rect x="0" y="516" width="960" height="24" style="fill:var(--stone)"/><rect x="40" y="518" width="0" height="0"/>';
    return s;
  }
  function frame(meta) {
    if (meta.app === "sheets") return sheetsFrame(meta);
    var A = APPS[meta.app || "revit"], s = '';
    s += '<rect x="0" y="0" width="960" height="540" style="fill:var(--paper)"/>';
    s += '<rect x="0" y="0" width="960" height="24" style="fill:var(--stone)"/>';
    s += '<text class="m s" x="480" y="16" text-anchor="middle">' + A.name + ' · ' + meta.view + '</text>';
    var x = 14;
    A.tabs.forEach(function (tb) {
      var w = tb.length * 6.6 + 18, on = tb === "Fronkkit";
      s += '<text class="s' + (on ? '' : ' m') + '" x="' + (x + 9) + '" y="40">' + tb + '</text>';
      if (on) s += '<rect x="' + x + '" y="45" width="' + w + '" height="2" class="fa"/>';
      x += w + 4;
    });
    s += '<path class="lt" d="M0 47h960M0 120h960"/>';
    x = 20;
    A.groups.forEach(function (g, gi) {
      var gx = x;
      g.btns.forEach(function (b) {
        if (b[0] === meta.btn) {
          s += '<g data-m="out" data-t0="' + meta.press[1] + '" data-t1="' + (meta.press[1] + .4) + '"><g data-m="fade" data-t0="' + (meta.press[0] - .2) + '" data-t1="' + meta.press[0] + '"><rect x="' + x + '" y="50" width="74" height="62" style="fill:var(--stone);stroke:var(--wood)"/></g></g>';
        }
        s += '<g transform="translate(' + (x + 25) + ' 55)" style="fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round">' + ICONS[b[0]] + '</g>';
        s += '<text class="s" x="' + (x + 37) + '" y="94" text-anchor="middle">' + b[1] + '</text>';
        s += '<text class="s" x="' + (x + 37) + '" y="106" text-anchor="middle">' + b[2] + '</text>';
        x += 76;
      });
      s += '<text class="cap" x="' + ((gx + x) / 2) + '" y="117" text-anchor="middle" style="font-size:8px">' + g.name + '</text>';
      if (gi < A.groups.length - 1) { s += '<path class="lt" d="M' + (x + 3) + ' 52v62"/>'; x += 10; }
    });
    s += '<rect x="0" y="120" width="170" height="396" style="fill:var(--cream)"/><path class="lt" d="M170 120v396"/>';
    s += '<text class="cap" x="12" y="140">' + A.panel + '</text>';
    for (var i = 0; i < 9; i++) s += '<path class="lt" d="M12 ' + (158 + i * 26) + 'h146"/><rect x="12" y="' + (146 + i * 26) + '" width="' + (40 + (i * 23) % 50) + '" height="5" style="fill:var(--line)"/>';
    s += '<rect x="0" y="516" width="960" height="24" style="fill:var(--stone)"/>';
    s += '<g data-m="out" data-t0="' + meta.done + '" data-t1="' + (meta.done + .2) + '"><text class="m s" x="182" y="532">Ready</text></g>';
    return s;
  }

  function build(id) {
    var tpl = document.getElementById("tpl-" + id); if (!tpl) return null;
    var meta = JSON.parse(tpl.dataset.meta);
    var vb = innerWidth < 700 && meta.app !== "sheets" ? "160 0 800 540" : "0 0 960 540";
    stage.innerHTML = '<svg class="anim demo-svg" viewBox="' + vb + '" role="img" aria-label="' + meta.title + ' demo"><g id="dcontent">' + frame(meta) + tpl.content.querySelector("svg").innerHTML + '</g></svg>';
    stepsEl.innerHTML = meta.steps.map(function (st, i) { return '<div class="step"><div class="bar"><i></i></div><span class="eyebrow">Step ' + (i + 1) + '</span><b>' + st.n + '</b><p>' + st.p + '</p></div>'; }).join("");
    titleEl.textContent = meta.title; catEl.textContent = meta.cat;
    return { meta: meta, root: stage.querySelector("#dcontent"), els: [].slice.call(stage.querySelectorAll("[data-m]")), steps: [].slice.call(stepsEl.children) };
  }

  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function pathAt(el, t) {
    if (!el._p) el._p = el.dataset.path.split(";").map(function (s) { return s.split(",").map(Number); });
    var P = el._p;
    if (t <= P[0][0]) return P[0];
    for (var i = 1; i < P.length; i++) if (t <= P[i][0]) {
      var a = P[i - 1], b = P[i], k = ease((t - a[0]) / (b[0] - a[0] || 1));
      return [0, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
    return P[P.length - 1];
  }
  function apply(c, t) {
    var dur = c.meta.dur;
    c.root.style.opacity = t > dur - .5 ? Math.max(0, (dur - t) / .5) : t < .25 ? t / .25 : 1;
    c.els.forEach(function (el) {
      var m = el.dataset.m, t0 = +el.dataset.t0, t1 = +el.dataset.t1;
      var raw = Math.min(1, Math.max(0, (t - t0) / (t1 - t0 || .001))), p = ease(raw);
      if (m === "draw") el.style.strokeDashoffset = 1 - p;
      else if (m === "fade") el.style.opacity = p;
      else if (m === "out") el.style.opacity = 1 - p;
      else if (m === "pop") { el.style.opacity = p; el.style.transform = "scale(" + (.92 + .08 * p) + ")"; }
      else if (m === "type") { var tx = el.dataset.text; el.textContent = tx.slice(0, Math.round(raw * tx.length)); }
      else if (m === "move") { var q = pathAt(el, t); el.setAttribute("transform", "translate(" + q[1] + " " + q[2] + ")"); }
      else if (m === "rot") el.style.transform = "rotate(" + ((1 - p) * (+el.dataset.deg || 0)) + "deg)";
      else if (m === "sx") el.style.transform = "scaleX(" + p + ")";
      else if (m === "sy") el.style.transform = "scaleY(" + p + ")";
      else if (m === "tx") el.style.transform = "translateX(" + ((1 - p) * (+el.dataset.dx || 0)) + "px)";
      else if (m === "blink") el.style.opacity = raw <= 0 ? 0 : raw >= 1 ? 1 : (Math.sin(raw * Math.PI * 7) > -0.2 ? 1 : .2);
    });
    var S = c.meta.steps;
    c.steps.forEach(function (node, i) {
      var a = S[i].t, b = i + 1 < S.length ? S[i + 1].t : c.meta.done + .6;
      var f = Math.min(1, Math.max(0, (t - a) / (b - a)));
      node.querySelector("i").style.width = (f * 100) + "%";
      node.classList.toggle("on", t >= a && (i + 1 >= S.length || t < S[i + 1].t));
    });
  }
  function tick(now) {
    if (!cur) return;
    var dt = Math.min(.1, (now - last) / 1000); last = now;
    if (playing) { t += dt; if (t >= cur.meta.dur) t = 0; }
    apply(cur, t);
    raf = requestAnimationFrame(tick);
  }
  function setPlaying(v) { playing = v; pauseBtn.textContent = v ? "Pause" : "Play"; }
  function open(id, from) {
    cur = build(id); if (!cur) return;
    opener = from || null;
    t = reduce ? cur.meta.done + .8 : 0;
    setPlaying(!reduce);
    dlg.showModal(); document.body.style.overflow = "hidden";
    last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  dlg.addEventListener("close", function () { if (dlg.open) return; cancelAnimationFrame(raf); cur = null; stage.innerHTML = ""; document.body.style.overflow = ""; if (opener) opener.focus(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  document.getElementById("demoClose").addEventListener("click", function () { dlg.close(); });
  document.getElementById("demoReplay").addEventListener("click", function () { t = 0; setPlaying(true); });
  pauseBtn.addEventListener("click", function () { setPlaying(!playing); });
  document.querySelectorAll("[data-demo]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.dataset.demo, b); });
    var card = b.closest(".tool"), st = card && card.querySelector(".stage");
    if (st) { st.classList.add("clickable"); st.addEventListener("click", function () { open(b.dataset.demo, b); }); }
  });
  window.__openDemo = open;
})();

// ---------- Theme (light / dark, remembered) ----------
(function () {
  var root = document.documentElement, btn = document.getElementById("themeBtn"), meta = document.querySelector('meta[name="theme-color"]');
  var saved = null;
  try { saved = localStorage.getItem("fronkkit-theme"); } catch (e) {}
  function current() { return root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
  function apply(theme, store) {
    root.setAttribute("data-theme", theme);
    if (btn) { btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode"); btn.setAttribute("aria-pressed", String(theme === "dark")); }
    if (meta) meta.setAttribute("content", theme === "dark" ? "#1b1814" : "#efe8de");
    if (store) { try { localStorage.setItem("fronkkit-theme", theme); } catch (e) {} }
    window.dispatchEvent(new Event("resize")); // redraw card canvases if any
  }
  apply(saved === "dark" || saved === "light" ? saved : current(), false);
  if (btn) btn.addEventListener("click", function () { apply(current() === "dark" ? "light" : "dark", true); });
})();

// ---------- Mobile menu ----------
(function () {
  var btn = document.getElementById("menuBtn"), links = document.getElementById("links"), nav = document.getElementById("nav");
  if (!btn || !links) return;
  function set(open) {
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("menu-open", open);
  }
  btn.addEventListener("click", function () { set(!links.classList.contains("open")); });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && links.classList.contains("open")) { set(false); btn.focus(); } });
})();

// ---------- Highlight the section in view ----------
(function () {
  if (!("IntersectionObserver" in window)) return;
  var links = [].slice.call(document.querySelectorAll('.links a[href^="#"]'));
  var ids = ["about", "journey", "expertise", "tools", "credentials", "contact"];
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  ids.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
})();
