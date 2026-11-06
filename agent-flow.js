/* AI Agent Team workflow animation — section #agents. No data leaves the page; all labels are generic. */
(function () {
  var root = document.getElementById("agentFlow");
  if (!root) return;
  var W = 1200, H = 515;
  var N = {
    reg:  {x:10,  y:44,  w:206, k:"in", ic:"XLSX", t:"Drawing register", s:"Status of every sheet"},
    plan: {x:10,  y:100, w:206, k:"in", ic:"XLSX", t:"Team planner", s:"People, hours, holidays"},
    asg:  {x:10,  y:156, w:206, k:"in", ic:"CSV",  t:"Assignments", s:"Who holds which sheet"},
    upd:  {x:10,  y:212, w:206, k:"in", ic:"JSON", t:"Team updates", s:"Progress from the team"},
    xml:  {x:10,  y:300, w:206, k:"in plan", ic:"XML", t:"Clash results", s:"Latest clash run"},
    mdl:  {x:10,  y:356, w:206, k:"in plan", ic:"CSV", t:"Model export", s:"Health check from Revit"},
    co:   {x:252, y:190, w:178, k:"agent plan", ic:"◷", t:"Coordinator", s:"Scheduled task today", ph:"Later"},
    sd:   {x:468, y:44,  k:"agent", ic:"D", t:"Drawing Tracker", s:"Consultant reply status", ph:"Live"},
    tm:   {x:468, y:132, k:"agent", ic:"T", t:"Team Tracker", s:"Workload · Gantt · LINE", ph:"Live"},
    cl:   {x:468, y:220, k:"agent plan", ic:"C", t:"Clash Agent", s:"Run-to-run comparison", ph:"Next"},
    qa:   {x:468, y:308, k:"agent plan", ic:"Q", t:"Model QA", s:"Health · model changes", ph:"Next"},
    pm:   {x:468, y:396, k:"agent plan", ic:"P", t:"PM Reporter", s:"One-page weekly status", ph:"Next"},
    o1:   {x:738, y:44,  w:212, k:"out", ic:"HTML", t:"Outstanding drawings", s:"Consultant meeting"},
    o2:   {x:738, y:100, w:212, k:"out", ic:"HTML", t:"Workload plan", s:"Who is overloaded"},
    o3:   {x:738, y:156, w:212, k:"out", ic:"HTML", t:"Interactive Gantt", s:"Bulk-assign sheets"},
    o4:   {x:738, y:212, w:212, k:"out", ic:"HTML", t:"Team update form", s:"Progress in a few taps"},
    o5:   {x:738, y:300, w:212, k:"out plan", ic:"HTML", t:"Clash report", s:"For PM and disciplines"},
    o6:   {x:738, y:356, w:212, k:"out plan", ic:"CSV",  t:"Model fix list", s:"Grouped by owner"},
    o7:   {x:738, y:412, w:212, k:"out plan", ic:"HTML", t:"Weekly status", s:"One page for the PM"},
    gate: {x:974, y:44,  k:"gate", t:"Review", s:"Drafts until I approve"},
    a1:   {x:1080, y:52,  k:"aud", ic:"Meeting", t:"Consultant", s:"Weekly coordination"},
    a2:   {x:1080, y:206, k:"aud", ic:"LINE", t:"Modeling team", s:"Tasks and update form"},
    a3:   {x:1080, y:360, k:"aud", ic:"Report", t:"Project manager", s:"Weekly status"}
  };
  var E = {
    reg_sd:["reg","sd"], reg_tm:["reg","tm"], plan_tm:["plan","tm"], asg_tm:["asg","tm"], upd_tm:["upd","tm"],
    xml_cl:["xml","cl",1], mdl_qa:["mdl","qa",1],
    co_sd:["co","sd",1], co_tm:["co","tm",1], co_cl:["co","cl",1], co_qa:["co","qa",1], co_pm:["co","pm",1],
    sd_o1:["sd","o1"], tm_o2:["tm","o2"], tm_o3:["tm","o3"], tm_o4:["tm","o4"], cl_o5:["cl","o5",1], qa_o6:["qa","o6",1], pm_o7:["pm","o7",1],
    o1_g:["o1","gate"], o2_g:["o2","gate"], o3_g:["o3","gate"], o4_g:["o4","gate"], o5_g:["o5","gate",1], o6_g:["o6","gate",1], o7_g:["o7","gate",1],
    g_a1:["gate","a1"], g_a2:["gate","a2"], g_a3:["gate","a3"],
    back:["a2","upd",0,1]
  };
  var LABEL = {reg_sd:"register",reg_tm:"register",plan_tm:"planner",asg_tm:"assign",upd_tm:"updates",xml_cl:"xml",mdl_qa:"model",
    co_sd:"start",co_tm:"start",co_cl:"start",co_qa:"start",co_pm:"start",sd_o1:"draft",tm_o2:"draft",tm_o3:"draft",tm_o4:"draft",cl_o5:"draft",qa_o6:"draft",pm_o7:"draft",
    o1_g:"review",o2_g:"review",o3_g:"review",o4_g:"review",o5_g:"review",o6_g:"review",o7_g:"review",g_a1:"report",g_a2:"tasks",g_a3:"status",back:"update.json"};
  var STEPS = [
    {w:"Overview", t:"A weekly reporting pipeline", s:"Agents read files from a local project folder, draft every report, and nothing leaves until I approve it. Solid outlines run today; dashed ones are the next phases.", on:[], f:[], d:7000},
    {w:"Monday", t:"Drop the week’s files", s:"The drawing register, the team planner, this week’s assignments and the progress files the team sent back go into one folder.", on:["reg","plan","asg","upd","xml","mdl"], f:[], d:6500, files:1},
    {w:"Tuesday 08:43", t:"Agents wake up on schedule", s:"A scheduled task starts the team every week. A coordinator agent is planned to take over this step and take instructions in plain language.", on:["co","sd","tm","cl","qa","pm"], f:["co_sd","co_tm","co_cl","co_qa","co_pm"], d:6000},
    {w:"Tuesday 08:45", t:"Each agent reads only what it needs", s:"The drawing tracker reads the register; the team tracker reads the register, planner, assignments and team updates; clash and model agents read their own exports.", on:["sd","tm","cl","qa"], f:["reg_sd","reg_tm","plan_tm","asg_tm","upd_tm","xml_cl","mdl_qa"], d:7000, work:1},
    {w:"Tuesday 08:50", t:"A full set of drafts", s:"Outstanding drawings, a workload plan with message drafts, an interactive Gantt and a team update form. Next: a clash report, a model fix list and a one-page weekly status.", on:["o1","o2","o3","o4","o5","o6","o7"], f:["sd_o1","tm_o2","tm_o3","tm_o4","cl_o5","qa_o6","pm_o7"], d:7000},
    {w:"Tuesday morning", t:"I review and approve", s:"A summary arrives on my phone. I check the drafts and move work between people in the Gantt. The agents never send anything on their own.", on:["gate"], f:["o1_g","o2_g","o3_g","o4_g","o5_g","o6_g","o7_g"], d:6500, ok:1},
    {w:"Tuesday – Wednesday", t:"Delivered to the people who use it", s:"The outstanding drawing report goes to the consultant meeting, tasks and the update form go to the modeling team, and the weekly status goes to the project manager.", on:["a1","a2","a3"], f:["g_a1","g_a2","g_a3"], d:6500},
    {w:"Next Monday", t:"The team reports back, the loop restarts", s:"Modelers search their sheets, tap a status and a percentage, and send a small file back. Project data stays on the company computer.", on:["a2","upd"], f:["back"], d:6500},
    {w:"Roadmap", t:"Designed by me, built with AI", s:"Two of five agents run every week today. Next come the clash agent, model QA and the weekly status report, then a coordinator to run them all.", on:["sd","tm","o1","o2","o3","o4"], f:[], d:8000, road:1}
  ];

  var fit = root.querySelector(".af-fit"), stage = root.querySelector(".af-stage"), wires = root.querySelector(".af-wires");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var logo = root.getAttribute("data-logo") || "images/logo.png";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  Object.keys(N).forEach(function (id) {
    var n = N[id], el = document.createElement("div"), plan = n.k.indexOf("plan") >= 0;
    el.className = "af-n" + (n.k.indexOf("agent") === 0 ? " af-agent" : "") + (n.k === "gate" ? " af-gate" : "") + (n.k === "aud" ? " af-aud" : "") + (plan ? " plan" : "");
    el.id = "af_" + id; el.style.left = n.x + "px"; el.style.top = n.y + "px"; if (n.w) el.style.width = n.w + "px";
    if (n.k === "gate") el.innerHTML = '<span class="face"><img src="' + logo + '" alt=""></span><b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small><span class="stamp">Approved</span>';
    else if (n.k === "aud") el.innerHTML = '<span class="ic">' + esc(n.ic) + '</span><b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small>';
    else el.innerHTML = '<span class="ic">' + esc(n.ic) + '</span><span class="t"><b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small></span>' +
      (n.ph ? '<span class="ph">' + n.ph + '</span><span class="af-bar"><i></i></span>' : "");
    stage.appendChild(el);
  });
  [["Inputs",10],["Trigger",252],["Agent team",468],["Drafts",738],["Review",974],["Delivered to",1080]].forEach(function (c) {
    var el = document.createElement("div"); el.className = "af-col"; el.style.left = c[1] + "px"; el.textContent = c[0]; stage.appendChild(el);
  });
  function box(id) { var el = document.getElementById("af_" + id); return {x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight}; }
  var P = {};
  function drawWires() {
    wires.innerHTML = "";
    Object.keys(E).forEach(function (id) {
      var e = E[id], A = box(e[0]), B = box(e[1]), p;
      if (e[3]) { var x1 = A.x + A.w / 2, y1 = A.y + A.h, x2 = B.x + B.w / 2, y2 = B.y + B.h; p = [[x1, y1], [x1, 500], [x2, 500], [x2, y2]]; }
      else { var a1 = A.x + A.w, b1 = A.y + A.h / 2, a2 = B.x, b2 = B.y + B.h / 2, dx = Math.max(30, (a2 - a1) * .5); p = [[a1, b1], [a1 + dx, b1], [a2 - dx, b2], [a2, b2]]; }
      P[id] = p;
      var el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", "M" + p[0] + " C" + p[1] + " " + p[2] + " " + p[3]); el.id = "afw_" + id;
      if (e[2] || e[3]) el.setAttribute("class", "dash");
      wires.appendChild(el);
    });
  }
  function bez(p, t) { var u = 1 - t; return [0, 1].map(function (i) { return u*u*u*p[0][i] + 3*u*u*t*p[1][i] + 3*u*t*t*p[2][i] + t*t*t*p[3][i]; }); }

  var chips = [], step = 0, playing = !reduce, inView = false, t0 = 0, raf = 0;
  function clear() { chips.forEach(function (c) { c.el.remove(); }); chips = []; }
  function launch(ids) {
    if (reduce) return;
    ids.forEach(function (id, i) {
      var el = document.createElement("div"); el.className = "af-chip" + (E[id][2] ? " plan" : ""); el.textContent = LABEL[id] || "";
      stage.appendChild(el); chips.push({el: el, id: id, s: performance.now() + i * 240, d: id === "back" ? 2600 : 1500});
    });
  }
  var $ = function (s) { return root.querySelector(s); };
  var dots = $(".af-dots");
  dots.innerHTML = STEPS.map(function (s, i) { return '<button type="button" data-i="' + i + '" aria-label="Step ' + i + ': ' + esc(s.t) + '"></button>'; }).join("");
  function go(i) {
    step = (i + STEPS.length) % STEPS.length; var S = STEPS[step]; t0 = performance.now();
    $(".af-num").textContent = String(step).padStart(2, "0"); $(".af-when").textContent = S.w; $(".af-foot h3").textContent = S.t; $(".af-foot p").textContent = S.s;
    [].forEach.call(dots.children, function (d, k) { d.setAttribute("aria-current", k === step ? "true" : "false"); });
    var on = {}; S.on.forEach(function (x) { on[x] = 1; });
    Object.keys(N).forEach(function (id) {
      var el = document.getElementById("af_" + id), road = S.road && /agent|out/.test(N[id].k);
      el.classList.toggle("on", !!on[id]); el.classList.toggle("dim", step > 0 && S.on.length > 0 && !on[id] && !road);
    });
    document.getElementById("af_gate").classList.remove("ok");
    [].forEach.call(stage.querySelectorAll(".af-bar i"), function (b) {
      b.style.transition = "none"; b.style.width = S.road && !b.closest(".plan") ? "100%" : "0";
    });
    var fl = {}; S.f.forEach(function (x) { fl[x] = 1; });
    Object.keys(E).forEach(function (id) { var w = document.getElementById("afw_" + id); w.classList.toggle("on", !!fl[id]); w.classList.toggle("dim", S.f.length > 0 && !fl[id]); });
    clear(); launch(S.f);
    if (S.work) setTimeout(function () { [].forEach.call(stage.querySelectorAll(".af-agent:not(#af_co):not(#af_pm) .af-bar i"), function (b, k) { b.style.transition = reduce ? "none" : "width " + (2 + k * .5) + "s ease-out"; b.style.width = "100%"; }); }, reduce ? 0 : 1300);
    if (S.ok) setTimeout(function () { document.getElementById("af_gate").classList.add("ok"); }, reduce ? 0 : 3000);
    if (S.files && !reduce) ["reg","plan","asg","upd","xml","mdl"].forEach(function (id, k) { var el = document.getElementById("af_" + id); el.classList.remove("on"); setTimeout(function () { if (step === 1) el.classList.add("on"); }, 320 * k + 200); });
    $(".af-play").textContent = playing ? "Pause" : "Play";
  }
  function tick(now) {
    chips.forEach(function (c) {
      var t = (now - c.s) / c.d;
      if (t < 0) { c.el.style.opacity = 0; return; }
      if (t > 1) { c.s = now + 600; t = 0; }
      var xy = bez(P[c.id], t);
      c.el.style.opacity = t < .08 ? t / .08 : t > .92 ? (1 - t) / .08 : 1;
      c.el.style.transform = "translate(" + (xy[0] - c.el.offsetWidth / 2) + "px," + (xy[1] - 10) + "px)";
    });
    if (playing && inView && now - t0 > STEPS[step].d) go(step + 1);
    raf = requestAnimationFrame(tick);
  }
  var sizer = document.createElement("div"); fit.appendChild(sizer);
  function resize() { var s = Math.max(fit.clientWidth / W, fit.clientWidth < 700 ? .62 : 0); stage.style.transform = "scale(" + s + ")"; fit.style.height = (H * s) + "px"; sizer.style.width = (W * s) + "px"; sizer.style.height = "1px"; fit.classList.toggle("scroll", W * s > fit.clientWidth + 1); }
  $(".af-next").addEventListener("click", function () { go(step + 1); });
  $(".af-prev").addEventListener("click", function () { go(step - 1); });
  $(".af-play").addEventListener("click", function () { playing = !playing; t0 = performance.now(); $(".af-play").textContent = playing ? "Pause" : "Play"; });
  dots.addEventListener("click", function (e) { var b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); });
  root.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(step + 1); else if (e.key === "ArrowLeft") go(step - 1); });
  window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; if (inView) t0 = performance.now(); }); }, {threshold: .35}).observe(root);
  else inView = true;
  function start() { resize(); drawWires(); go(0); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
