/* ============================================================
   WEDNESDAY — main.js  ·  "The Blueprint"
   Lenis + GSAP ScrollTrigger + SplitText + Three.js wireframe
   ============================================================ */
import * as THREE from "three";

document.documentElement.classList.add("js");

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: "power3.out", duration: 0.65 });

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

/* ---------- Lenis smooth scroll ---------- */
let lenis = null;
if (!prefersReduced) {
  lenis = new Lenis({ lerp: 0.16, smoothWheel: true, wheelMultiplier: 1.25 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* Anchor navigation through Lenis */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.3 });
    else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ---------- Preloader + hero intro ---------- */
const preloader = document.getElementById("preloader");
const preCount = document.getElementById("preCount");
const preRule = document.getElementById("preRule");

function heroIntro() {
  const lines = gsap.utils.toArray(".hero__line");
  /* mask each monumental line */
  lines.forEach((l) => {
    const wrap = document.createElement("span");
    wrap.style.display = "block";
    wrap.style.overflow = "hidden";
    l.parentNode.insertBefore(wrap, l);
    wrap.appendChild(l);
  });

  const tl = gsap.timeline();
  tl.from(lines, { yPercent: 112, duration: 1.05, stagger: 0.12, ease: "power4.out" })
    .from("#heroEyebrow", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.8")
    .from("#heroSub", { autoAlpha: 0, y: 22, duration: 0.7 }, "-=0.5")
    .from("#heroCtas .btn", { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.6 }, "-=0.45")
    .from(".hero__scene", { autoAlpha: 0, duration: 1.1 }, "-=0.7")
    .from(".hero__head", { autoAlpha: 0, duration: 0.6 }, "-=0.6")
    .from(".dim__tick", { scaleX: 0, duration: 0.8, stagger: 0.06, ease: "power2.inOut" }, "-=0.4")
    .from(".dim__label", { autoAlpha: 0, duration: 0.5, stagger: 0.06 }, "-=0.6")
    .from(".titleblock__cell", { autoAlpha: 0, y: 14, stagger: 0.06, duration: 0.5 }, "-=0.5");
}

if (prefersReduced) {
  preloader.remove();
} else {
  const counter = { v: 0 };
  gsap.to(counter, {
    v: 100,
    duration: 0.7,
    ease: "power2.inOut",
    onUpdate: () => {
      preCount.textContent = Math.round(counter.v);
      preRule.style.setProperty("--p", counter.v / 100);
    },
    onComplete: () => {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.55,
        ease: "power4.inOut",
        onComplete: () => preloader.remove(),
      });
      document.fonts.ready.then(heroIntro);
    },
  });
}

/* ---------- Section heading slams ---------- */
if (!prefersReduced) {
  document.fonts.ready.then(() => {
    document.querySelectorAll(".split-slam").forEach((el) => {
      const split = new SplitText(el, { type: "lines" });
      split.lines.forEach((l) => {
        const wrap = document.createElement("div");
        wrap.style.overflow = "hidden";
        l.parentNode.insertBefore(wrap, l);
        wrap.appendChild(l);
      });
      gsap.from(split.lines, {
        yPercent: 112,
        duration: 0.7,
        stagger: 0.07,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    });
    ScrollTrigger.refresh();
  });
}

/* ---------- Batched reveals ---------- */
if (!prefersReduced) {
  ScrollTrigger.batch(".reveal", {
    start: "top 94%",
    onEnter: (els) =>
      gsap.to(els, {
        autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.5, overwrite: true,
        onComplete: () => els.forEach((e) => e.classList.add("is-in")),
      }),
  });
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

/* ---------- Animated counters ---------- */
document.querySelectorAll(".count").forEach((el) => {
  const target = parseFloat(el.dataset.count);
  if (prefersReduced) {
    el.textContent = target.toLocaleString("en-IN");
    return;
  }
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%" },
    onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-IN")),
  });
});

/* ---------- Chart line draw + data points ---------- */
const chartLine = document.querySelector(".chart__line");
if (chartLine) {
  /* drop CAD-style node points along the polyline */
  const ptsGroup = document.querySelector(".chart__pts");
  const len = chartLine.getTotalLength();
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const p = chartLine.getPointAtLength((len / N) * i);
    const c = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    c.setAttribute("x", p.x - 3);
    c.setAttribute("y", p.y - 3);
    c.setAttribute("width", 6);
    c.setAttribute("height", 6);
    c.setAttribute("fill", "#fbfcfe");
    c.setAttribute("stroke", "#1e46e0");
    c.setAttribute("stroke-width", "1.5");
    ptsGroup.appendChild(c);
  }
  if (!prefersReduced) {
    gsap.set(chartLine, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(chartLine, {
      strokeDashoffset: 0,
      duration: 2,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".monitor__chart", start: "top 85%" },
    });
    gsap.from(".chart__pts rect", {
      autoAlpha: 0, scale: 0, transformOrigin: "center",
      stagger: 0.12, duration: 0.4, delay: 0.5,
      scrollTrigger: { trigger: ".monitor__chart", start: "top 85%" },
    });
  }
}

/* ---------- Terminal typing ---------- */
const termTrigger = document.querySelector(".terminal");
if (termTrigger) {
  const l1 = document.getElementById("termLine1");
  const l2 = document.getElementById("termLine2");
  const l3 = document.getElementById("termLine3");
  const cmd = "blackfyre scan --cloud aws --compliance iso27001";
  const out2 = "> scanning: 428 resources evaluated";
  const out3 = "✔ 100% Passed — 0 critical vulnerabilities";

  const typeInto = (el, text, speed = 26) =>
    new Promise((res) => {
      let i = 0;
      const tick = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, speed);
        else res();
      };
      tick();
    });

  let played = false;
  const runTerminal = async () => {
    if (played) return;
    played = true;
    if (prefersReduced) {
      l1.textContent = cmd;
      l2.textContent = out2;
      l3.textContent = out3;
      l3.classList.add("t-green");
      return;
    }
    await typeInto(l1, cmd);
    await new Promise((r) => setTimeout(r, 350));
    await typeInto(l2, out2, 12);
    await new Promise((r) => setTimeout(r, 250));
    l3.classList.add("t-green");
    await typeInto(l3, out3, 14);
  };

  ScrollTrigger.create({ trigger: termTrigger, start: "top 85%", onEnter: runTerminal });
}

/* ---------- CTA stamp ---------- */
const ctaStamp = document.getElementById("ctaStamp");
if (ctaStamp && !prefersReduced) {
  gsap.from(ctaStamp, {
    scale: 2.2, autoAlpha: 0, rotation: 8,
    duration: 0.5, ease: "power4.in",
    scrollTrigger: { trigger: ctaStamp, start: "top 80%" },
  });
}

/* ---------- Rates tabs ---------- */
const tabs = document.querySelectorAll(".rates__tab");
const panels = { tabBuild: document.getElementById("panelBuild"), tabSec: document.getElementById("panelSec") };
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active);
    });
    Object.entries(panels).forEach(([id, panel]) => {
      const active = id === tab.id;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
      if (active) {
        const rows = panel.querySelectorAll(".reveal");
        rows.forEach((e) => e.classList.add("is-in"));
        if (!prefersReduced) {
          gsap.fromTo(rows, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.5, overwrite: true });
        } else {
          gsap.set(rows, { autoAlpha: 1, y: 0 });
        }
      }
    });
    ScrollTrigger.refresh();
  });
});

/* ---------- Nav behaviour ---------- */
const nav = document.getElementById("nav");
const navProgress = document.getElementById("navProgress");
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("is-hidden", y > 300 && y > lastY && !menuOpen);
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  navProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}, { passive: true });

/* Active link highlighting + live sheet readout */
const navReadout = document.getElementById("navReadout");
const SHEET_NAMES = {
  services: "SHT 01 — SERVICES",
  rates: "SHT 02 — RATES",
  work: "SHT 03 — WORK",
  products: "SHT 04 — PRODUCTS",
  process: "SHT 05 — PROCESS",
  faq: "SHT 06 — FAQ",
};
Object.keys(SHEET_NAMES).forEach((id) => {
  const sec = document.getElementById(id);
  if (!sec) return;
  ScrollTrigger.create({
    trigger: sec,
    start: "top 40%",
    end: "bottom 40%",
    onToggle: (self) => {
      document.querySelectorAll(`.nav__link[href="#${id}"]`).forEach((l) => l.classList.toggle("is-active", self.isActive));
      if (self.isActive) navReadout.textContent = SHEET_NAMES[id];
      else if (!Object.keys(SHEET_NAMES).some((k) => k !== id && document.querySelector(`.nav__link[href="#${k}"].is-active`)))
        navReadout.textContent = "DWG 001 — MASTER";
    },
  });
});

/* ---------- IST clock ---------- */
const navClock = document.getElementById("navClock");
if (navClock) {
  const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => (navClock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 30000);
}

/* ---------- Mobile menu ---------- */
const burger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");
let menuOpen = false;

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  burger.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  if (lenis) lenis.start();
}

burger.addEventListener("click", () => {
  menuOpen = !menuOpen;
  burger.classList.toggle("is-open", menuOpen);
  burger.setAttribute("aria-expanded", menuOpen);
  mobileMenu.classList.toggle("is-open", menuOpen);
  mobileMenu.setAttribute("aria-hidden", !menuOpen);
  if (lenis) menuOpen ? lenis.stop() : lenis.start();
});

/* ---------- Magnetic buttons (fine pointers only) ---------- */
if (!isTouch && !prefersReduced) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.3;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * strength,
        y: (e.clientY - r.top - r.height / 2) * strength,
        duration: 0.4,
      });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" }));
  });
}

/* ---------- CAD crosshair cursor ---------- */
if (!isTouch && !prefersReduced) {
  const xhair = document.getElementById("xhair");
  const v = xhair.querySelector(".xhair__v");
  const h = xhair.querySelector(".xhair__h");
  const coords = document.getElementById("xhairCoords");
  const vX = gsap.quickTo(v, "x", { duration: 0.12, ease: "power2.out" });
  const hY = gsap.quickTo(h, "y", { duration: 0.12, ease: "power2.out" });
  const cX = gsap.quickTo(coords, "x", { duration: 0.12, ease: "power2.out" });
  const cY = gsap.quickTo(coords, "y", { duration: 0.12, ease: "power2.out" });
  let on = false;
  window.addEventListener("mousemove", (e) => {
    if (!on) { xhair.classList.add("is-on"); on = true; }
    vX(e.clientX);
    hY(e.clientY);
    cX(e.clientX);
    cY(e.clientY);
    coords.textContent = `X ${String(e.clientX).padStart(4, "0")} · Y ${String(e.clientY + Math.round(window.scrollY)).padStart(4, "0")}`;
  }, { passive: true });
  document.addEventListener("mouseleave", () => { xhair.classList.remove("is-on"); on = false; });
}

/* ---------- Purchase-order estimator ---------- */
(function initEstimator() {
  const bar = document.getElementById("poBar");
  const elItems = document.getElementById("poItems");
  const elTotal = document.getElementById("poTotal");
  const btnClear = document.getElementById("poClear");
  const btnSend = document.getElementById("poSend");
  if (!bar) return;

  const selected = new Map(); /* part → {name, price, cycle} */
  const fmt = (n) => "₹" + n.toLocaleString("en-IN");

  document.querySelectorAll(".bom__row").forEach((row) => {
    const part = row.querySelector(".bom__no").firstChild.textContent.trim();
    const name = row.querySelector(".bom__desc strong").textContent.trim();
    const priceText = row.querySelector(".bom__price").textContent.trim();
    const price = parseInt(priceText.replace(/[^\d]/g, ""), 10);
    const cycle = /\/MO/i.test(priceText) ? "mo" : /\/HR/i.test(priceText) ? "hr" : "once";

    row.setAttribute("role", "checkbox");
    row.setAttribute("aria-checked", "false");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-label", `Add ${name} (${fmt(price)}${cycle === "mo" ? "/month" : cycle === "hr" ? "/hour" : ""}) to estimate`);

    const toggle = () => {
      const on = !selected.has(part);
      if (on) selected.set(part, { name, price, cycle });
      else selected.delete(part);
      row.classList.toggle("is-sel", on);
      row.setAttribute("aria-checked", on);
      render();
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  function render() {
    const items = [...selected.values()];
    const once = items.filter((i) => i.cycle === "once").reduce((s, i) => s + i.price, 0);
    const mo = items.filter((i) => i.cycle === "mo").reduce((s, i) => s + i.price, 0);
    const hr = items.filter((i) => i.cycle === "hr").reduce((s, i) => s + i.price, 0);

    let total = "";
    if (once) total += fmt(once);
    if (mo) total += (total ? " + " : "") + fmt(mo) + "/mo";
    if (hr) total += (total ? " + " : "") + fmt(hr) + "/hr";
    elTotal.textContent = total || "₹0";
    elItems.textContent = `${items.length} ITEM${items.length === 1 ? "" : "S"}`;

    /* prefilled WhatsApp message with the itemised order */
    const lines = [...selected.entries()].map(
      ([p, i]) => `• ${p} ${i.name} — ${fmt(i.price)}${i.cycle === "mo" ? "/mo" : i.cycle === "hr" ? "/hr" : ""}`
    );
    const msg = `Hi! I built a purchase order on wednesday.technology:\n${lines.join("\n")}\nTotal: ${total}.\nLet's discuss.`;
    btnSend.href = `https://wa.me/919655419510?text=${encodeURIComponent(msg)}`;

    bar.classList.toggle("is-on", items.length > 0);
    document.body.classList.toggle("po-open", items.length > 0);
  }

  btnClear.addEventListener("click", () => {
    selected.clear();
    document.querySelectorAll(".bom__row.is-sel").forEach((r) => {
      r.classList.remove("is-sel");
      r.setAttribute("aria-checked", "false");
    });
    render();
  });
})();

/* ---------- Obfuscated email ---------- */
document.getElementById("emailBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const u = "hello";
  const d = "wednesday.technology";
  window.location.href = `mailto:${u}@${d}?subject=${encodeURIComponent("Project enquiry — via wednesday.technology")}`;
});

/* ============================================================
   SPEC — drafting assistant (scripted lead-conversion bot)
   ============================================================ */
(function initSpec() {
  const launcher = document.getElementById("specLauncher");
  const panel = document.getElementById("specPanel");
  const closeBtn = document.getElementById("specClose");
  const log = document.getElementById("specLog");
  const controls = document.getElementById("specControls");
  const pct = document.getElementById("specPct");
  const barFill = document.getElementById("specBarFill");
  if (!launcher) return;

  const WA = "919655419510";
  const lead = {};
  let booted = false;

  const RATE_HINTS = {
    "WEBSITE": "REFERENCE RATES — ONE-PAGER ₹18K · LANDING ₹35K · BUSINESS SITE ₹85K. PUBLISHED, NOT QUOTED.",
    "WEB APP / SOFTWARE": "REFERENCE RATES — STARTER APP ₹1.25L · FULL BUSINESS WEB APP ₹4.5L. AUTH, ROLES, REPORTING INCLUDED.",
    "MOBILE APP": "REFERENCE RATE — ANDROID APP ₹2.5L, OFFLINE-CAPABLE. iOS ON REQUEST.",
    "E-COMMERCE STORE": "REFERENCE RATE — E-COMMERCE ₹1.75L: CATALOGUE, CART, PAYMENTS, ORDER ADMIN.",
    "COMPLIANCE / SECURITY": "REFERENCE RATES — ISO 27001 HEALTH-CHECK ₹35K · GAP ASSESSMENT ₹1L · IMPLEMENTATION FROM ₹3.5L.",
    "SOMETHING ELSE": "UNDERSTOOD. NON-STANDARD SCOPE — WE SPEC THOSE PROPERLY BEFORE ANY CODE.",
  };

  const scrollLog = () => (log.scrollTop = log.scrollHeight);

  function setProgress(p) {
    pct.textContent = `SPEC ${p}% COMPLETE`;
    barFill.style.transform = `scaleX(${p / 100})`;
  }

  function botSay(text, delay = 500) {
    return new Promise((res) => {
      const typing = document.createElement("div");
      typing.className = "spec__msg spec__msg--typing";
      typing.innerHTML = "PLOTTING<i>▊</i>";
      log.appendChild(typing);
      scrollLog();
      setTimeout(() => {
        typing.remove();
        const m = document.createElement("div");
        m.className = "spec__msg spec__msg--bot";
        m.innerHTML = `<span class="spec__who">SPEC</span>${text}`;
        log.appendChild(m);
        scrollLog();
        res();
      }, prefersReducedSpec ? 0 : delay);
    });
  }
  const prefersReducedSpec = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function userSay(text) {
    const m = document.createElement("div");
    m.className = "spec__msg spec__msg--user";
    m.textContent = text;
    log.appendChild(m);
    scrollLog();
  }

  function chips(options, onPick) {
    controls.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "spec__chips";
    options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "spec__chip";
      b.textContent = opt;
      b.addEventListener("click", () => { controls.innerHTML = ""; userSay(opt); onPick(opt); });
      wrap.appendChild(b);
    });
    controls.appendChild(wrap);
  }

  function textInput(placeholder, onSubmit, { optional = false } = {}) {
    controls.innerHTML = "";
    const form = document.createElement("form");
    form.className = "spec__form";
    const input = document.createElement("input");
    input.className = "spec__input";
    input.placeholder = placeholder;
    input.maxLength = 120;
    const go = document.createElement("button");
    go.className = "spec__go";
    go.type = "submit";
    go.textContent = "LOG →";
    form.append(input, go);
    if (optional) {
      const skip = document.createElement("button");
      skip.className = "spec__go";
      skip.type = "button";
      skip.textContent = "SKIP";
      skip.addEventListener("click", () => { controls.innerHTML = ""; userSay("—"); onSubmit(""); });
      form.appendChild(skip);
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v && !optional) { input.focus(); return; }
      controls.innerHTML = "";
      userSay(v || "—");
      onSubmit(v);
    });
    controls.appendChild(form);
    input.focus();
  }

  /* ---- the flow ---- */
  async function boot() {
    setProgress(0);
    await botSay("SPEC v2.6 ONLINE. I DRAFT PROJECT SPECIFICATIONS FOR THE WEDNESDAY BUILD QUEUE.", 700);
    await botSay("STATE YOUR REQUIREMENT:", 600);
    chips(Object.keys(RATE_HINTS), stepBudget);
  }

  async function stepBudget(req) {
    lead.requirement = req;
    setProgress(25);
    await botSay(RATE_HINTS[req], 650);
    await botSay("BUDGET BAND?", 500);
    chips(["UNDER ₹50K", "₹50K – ₹2L", "₹2L – ₹5L", "₹5L+", "NOT SURE YET"], stepTimeline);
  }

  async function stepTimeline(budget) {
    lead.budget = budget;
    setProgress(50);
    await botSay("LOGGED. REQUIRED DELIVERY WINDOW?", 550);
    chips(["ASAP", "WITHIN 1 MONTH", "1–3 MONTHS", "FLEXIBLE"], stepName);
  }

  async function stepName(timeline) {
    lead.timeline = timeline;
    setProgress(75);
    await botSay("FINAL FIELD. NAME / COMPANY FOR THE TITLE BLOCK:", 550);
    textInput("E.G. PRIYA — BLUESTONE TRADERS", stepNotes);
  }

  async function stepNotes(name) {
    lead.name = name;
    setProgress(90);
    await botSay("ANYTHING ELSE I SHOULD LOG? (OPTIONAL)", 500);
    textInput("LINKS, CONTEXT, CONSTRAINTS…", finish, { optional: true });
  }

  async function finish(notes) {
    lead.notes = notes;
    setProgress(100);
    await botSay("SPEC 100% COMPLETE. DRAFT READY FOR REVIEW:", 600);

    const sheet = document.createElement("dl");
    sheet.className = "spec__sheet spec__msg";
    sheet.innerHTML =
      `<div><dt>REQUIREMENT</dt><dd>${lead.requirement}</dd></div>` +
      `<div><dt>BUDGET</dt><dd>${lead.budget}</dd></div>` +
      `<div><dt>TIMELINE</dt><dd>${lead.timeline}</dd></div>` +
      `<div><dt>CLIENT</dt><dd>${escapeHtml(lead.name)}</dd></div>` +
      (lead.notes ? `<div><dt>NOTES</dt><dd>${escapeHtml(lead.notes)}</dd></div>` : "");
    log.appendChild(sheet);
    scrollLog();

    const msg =
      `Hi! SPEC drafted my project on wednesday.technology:\n` +
      `• Requirement: ${lead.requirement}\n` +
      `• Budget: ${lead.budget}\n` +
      `• Timeline: ${lead.timeline}\n` +
      `• Name: ${lead.name}\n` +
      (lead.notes ? `• Notes: ${lead.notes}\n` : "") +
      `Let's discuss.`;

    controls.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "spec__chips";
    const send = document.createElement("a");
    send.className = "btn btn--primary";
    send.style.cssText = "font-size:0.66rem;padding:0.6rem 1rem;";
    send.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    send.target = "_blank";
    send.rel = "noopener";
    send.textContent = "TRANSMIT VIA WHATSAPP ↗";
    const redo = document.createElement("button");
    redo.className = "spec__chip";
    redo.textContent = "REVISE SPEC";
    redo.addEventListener("click", () => { log.innerHTML = ""; boot(); });
    wrap.append(send, redo);
    controls.appendChild(wrap);
    await botSay("TRANSMIT WHEN READY. WEDNESDAY REVIEWS EVERY SPEC PERSONALLY — NO AUTORESPONDERS.", 700);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---- open / close ---- */
  function open() {
    panel.hidden = false;
    document.getElementById("spec").classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!booted) { booted = true; boot(); }
  }
  function close() {
    panel.hidden = true;
    document.getElementById("spec").classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }
  launcher.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close();
  });
})();

/* ---------- Footer year ---------- */
const yr = new Date().getFullYear();
document.getElementById("year").textContent = yr;
document.getElementById("revYear").textContent = yr;

/* ============================================================
   FIG. 07 — SITE RUNNER (final CTA)
   Blueprint remix of the Chrome dino: the site outruns
   DOWNTIME, BUG #042 and TECH DEBT. Space/tap to play.
   ============================================================ */
(function initRunner() {
  const wrap = document.getElementById("ctaRunner");
  const canvas = document.getElementById("runnerCanvas");
  const note = document.getElementById("runnerNote");
  const bubble = document.getElementById("runnerBubble");
  if (!wrap || !canvas) return;

  const section = wrap.closest(".cta");
  const ctx = canvas.getContext("2d");

  const INK = "#10131a";
  const INK_SOFT = "#3c4354";
  const INK_FAINT = "#59627a";
  const COBALT = "#1e46e0";
  const PAPER = "#ffffff";

  /* ---- pixel sprites ('#' ink, 'c' cobalt, 'x' paper) ----
     Runner is a panda: white outlined head with ink ear, eye
     patch and nose; solid ink body and legs (quadruped). */
  /* front-facing upright panda, 24×35 grid (~96×140 on screen):
     round head with ears + eye patches, white belly, black arms
     with claw pixels, bipedal legs */
  const PANDA_BODY = [
    "....###......###........",
    "...#####....#####.......",
    "...#####....#####.......",
    "..###################...",
    "..#xxxxxxxxxxxxxxxxx#...",
    "..#xxxxxxxxxxxxxxxxx#...",
    "..#xx####xxxx####xxx#...",
    "..#xx#x##xxxx#x##xxx#...",
    "..#xx####xxxx####xxx#...",
    "..#xxx##xxxxxx##xxxx#...",
    "..#xxxxxxx###xxxxxxx#...",
    "..#xxxxxxxx#xxxxxxxx#...",
    "...#xxxxxx###xxxxxx#....",
    "....################....",
    "...##################...",
    "..####xxxxxxxxxx####....",
    ".#####xxxxxxxxxx#####...",
    ".#####xxxxxxxxxx#####...",
    ".#####xxxxxxxxxx#####...",
    ".#####xxxxxxxxxx#####...",
    ".#####xxxxxxxxxx#####...",
    ".##x##xxxxxxxxxx##x##...",
    "..###xxxxxxxxxxxx###....",
    "...#xxxxxxxxxxxxxx#.....",
    "...#xxxxxxxxxxxxxx#.....",
    "...##xxxxxxxxxxxx##.....",
    "....##############......",
    "....##############......",
    "....##############......",
    "....##############......",
  ];
  const STAND = PANDA_BODY.concat([
    ".....####..####.........",
    ".....####..####.........",
    ".....####..####.........",
    "....#####..#####........",
    "....#x###..#x###........",
  ]);
  const DEAD = STAND; /* on failure it turns back to face you */

  /* side profile (facing right) — the panda turns into this the
     moment a run starts */
  const PROFILE_BODY = [
    "......####..............",
    "......####..............",
    "....################....",
    "...#xxxxxxxxxxxxxxxx#...",
    "...#xxxxxxxxxxxxxxxx#...",
    "...#xxxxxxxxxx####xx#...",
    "...#xxxxxxxxxx#x##xx#...",
    "...#xxxxxxxxxx####xx#...",
    "...#xxxxxxxxxxx##xxx#...",
    "...#xxxxxxxxxxxxxxxx##..",
    "...#xxxxxxxxxxxxxxxx###.",
    "...#xxxxxxxxxxxxxxxx###.",
    "....#xxxxxxxxxxxxxx##...",
    ".....##############.....",
    "....##############......",
    "...##################...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...#########xxxxxxx##...",
    "...##########xxxxxx##...",
    "...###########xxxx###...",
    "....################....",
    "....################....",
    "....################....",
    "....################....",
    "....################....",
  ];
  const RUN_A = PROFILE_BODY.concat([
    "......####......####....",
    ".....####........####...",
    "....####..........####..",
    "...####............####.",
    "...#x##.............#x##",
  ]);
  const RUN_B = PROFILE_BODY.concat([
    "........####..####......",
    ".........###..###.......",
    "..........##..##........",
    ".........###..###.......",
    ".........#x##.#x##......",
  ]);
  /* swinging front arm, overlaid on the profile body */
  const BLANK = "........................";
  const ARM_A = Array(15).fill(BLANK).concat([
    ".............####.......",
    "..............####......",
    "...............####.....",
    "...............####.....",
    "................###.....",
    "................###.....",
    "................#x#.....",
    "................###.....",
  ]);
  const ARM_B = Array(15).fill(BLANK).concat([
    "........####............",
    ".......####.............",
    "......####..............",
    "......###...............",
    ".....###................",
    ".....###................",
    ".....#x#................",
    ".....###................",
  ]);

  /* tumble roll: ink ball, white patch orbits to sell the spin */
  const BALL = [
    ".....######.....",
    "...##########...",
    "..############..",
    ".##############.",
    ".##############.",
    "################",
    "################",
    "################",
    "################",
    "################",
    "################",
    ".##############.",
    ".##############.",
    "..############..",
    "...##########...",
    ".....######.....",
  ];
  const carve = (r0, c0) =>
    BALL.map((row, r) =>
      r >= r0 && r < r0 + 4
        ? row.substring(0, c0) + row.substring(c0, c0 + 4).replace(/#/g, "x") + row.substring(c0 + 4)
        : row
    );
  const ROLL = [carve(2, 6), carve(6, 11), carve(11, 6), carve(6, 2)];

  const BIRD_UP = [
    "......cc..........",
    "......ccc.........",
    "......cccc........",
    "cccccccccccccc....",
    ".ccccccccccccccccc",
    "..cccccccccc......",
  ];
  const BIRD_DOWN = [
    "..cccccccccc......",
    ".ccccccccccccccccc",
    "cccccccccccccc....",
    "......cccc........",
    "......ccc.........",
    "......cc..........",
  ];

  const PX = 4;            /* panda pixel size */
  const BIRD_PX = 4;
  const HAZARDS = ["VIRUS.EXE", "TROJAN", "WORM", "RANSOMWARE", "PHISHING", "SPYWARE", "DOWNTIME", "BUG #042", "TECH DEBT", "404"];

  /* ---- state ---- */
  let W = 0, H = 0, dpr = 1, groundY = 0;
  let state = "idle";       /* idle | running | dead */
  let dist = 0, speed = 0, frame = 0;
  let hi = parseInt(localStorage.getItem("wd_runner_hi") || "0", 10) || 0;
  let dino, obstacles, decor;
  let inView = false;

  function resize() {
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundY = H - 34;
  }

  function reset() {
    dist = 0;
    speed = 5.5;
    frame = 0;
    dino = { x: 30, y: groundY, vy: 0, ducking: false, onGround: true };
    obstacles = [];
    decor = [
      { x: W * 0.3, y: 24, w: 60, s: 0.25 },
      { x: W * 0.75, y: 40, w: 42, s: 0.4 },
    ];
  }

  function setNote(t) { note.textContent = t; }

  function start() {
    reset();
    state = "running";
    wrap.classList.remove("is-over");
    bubble.classList.add("is-hidden");
    setNote("FIG. 07 — SITE RUNNER · DEPLOYED — BLOCK THE VIRUSES");
  }

  function die() {
    state = "dead";
    wrap.classList.add("is-over");
    const score = Math.floor(dist / 8);
    if (score > hi) {
      hi = score;
      localStorage.setItem("wd_runner_hi", String(hi));
    }
    bubble.innerHTML = "THE VIRUSES GOT THROUGH!<br>PRESS SPACE OR TAP TO <b>REDEPLOY ▶</b>";
    bubble.classList.remove("is-hidden");
    setNote("SYSTEM FAILURE — PRESS SPACE OR TAP TO REDEPLOY");
    draw(); /* render the death frame even while the loop idles */
  }

  /* ---- input ---- */
  function jump() {
    if (!dino.onGround) return;
    dino.vy = -11;
    dino.onGround = false;
    dino.ducking = false;
  }
  function press() {
    if (!dino) return; /* not sized yet */
    if (state === "running") jump();
    else start();
  }

  window.addEventListener("keydown", (e) => {
    if (!inView) return;
    if ((e.code === "Space" || e.code === "ArrowUp") && !e.repeat) {
      e.preventDefault();
      press();
    } else if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault(); /* held key: keep the page from scrolling */
    } else if (e.code === "ArrowDown" && state === "running") {
      e.preventDefault();
      if (dino.onGround) dino.ducking = true;
      else dino.vy += 2.4; /* fast-fall */
    }
  });
  window.addEventListener("keyup", (e) => {
    if (!dino) return;
    if (e.code === "ArrowDown") dino.ducking = false;
    /* early release = shorter hop, like the original */
    if ((e.code === "Space" || e.code === "ArrowUp") && state === "running" && dino.vy < -4.5) dino.vy = -4.5;
  });
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    press();
  });

  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.15 }).observe(wrap);

  /* ---- spawning ---- */
  function spawn() {
    const score = Math.floor(dist / 8);
    const roll = Math.random();
    if (score > 120 && roll < 0.22) {
      /* bird: low = jump it, mid = duck it (desktop only), high = run under */
      const lanes = isTouch ? [groundY - 22, groundY - 150] : [groundY - 22, groundY - 70, groundY - 150];
      const y = lanes[Math.floor(Math.random() * lanes.length)];
      obstacles.push({ kind: "bird", x: W + 40, y, w: 18 * BIRD_PX, h: 6 * BIRD_PX });
    } else {
      const label = HAZARDS[Math.floor(Math.random() * HAZARDS.length)];
      const w = label.length * 8.5 + 20;
      const stack = score > 300 && Math.random() < 0.25 ? 2 : 1;
      obstacles.push({ kind: "chip", x: W + 40, label, w, h: 34 * stack, stack });
    }
  }

  /* ---- drawing ---- */
  function sprite(map, x, y, px) {
    for (let r = 0; r < map.length; r++) {
      const row = map[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === ".") continue;
        ctx.fillStyle = ch === "c" ? COBALT : ch === "x" ? PAPER : INK;
        ctx.fillRect(x + c * px, y + r * px, px, px);
      }
    }
  }

  function drawChip(o) {
    for (let s = 0; s < o.stack; s++) {
      const y = groundY - 34 * (s + 1);
      ctx.fillStyle = INK;
      ctx.fillRect(o.x + 3, y + 3, o.w, 34); /* hard shadow */
      ctx.fillStyle = PAPER;
      ctx.fillRect(o.x, y, o.w, 34);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x + 1, y + 1, o.w - 2, 32);
      ctx.fillStyle = COBALT;
      ctx.font = '600 13px "IBM Plex Mono", monospace';
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(o.label, o.x + o.w / 2, y + 18);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* drifting detail callouts (background) */
    ctx.strokeStyle = "rgba(30,70,224,0.18)";
    ctx.lineWidth = 1;
    decor.forEach((d) => {
      ctx.strokeRect(d.x, d.y, d.w, d.w * 0.4);
      ctx.beginPath();
      ctx.moveTo(d.x + d.w, d.y + d.w * 0.4);
      ctx.lineTo(d.x + d.w + 18, d.y + d.w * 0.4 + 10);
      ctx.stroke();
    });

    /* ground: drafting datum line + ticks */
    ctx.fillStyle = INK;
    ctx.fillRect(0, groundY, W, 2);
    ctx.fillStyle = INK_FAINT;
    const off = Math.floor(dist % 48);
    for (let x = -off; x < W; x += 48) ctx.fillRect(x, groundY + 7, 14, 2);

    /* obstacles */
    obstacles.forEach((o) => {
      if (o.kind === "chip") drawChip(o);
      else sprite(frame % 24 < 12 ? BIRD_UP : BIRD_DOWN, o.x, o.y - o.h, BIRD_PX);
    });

    /* panda — faces you while idle/dead, turns to profile to run */
    let map, arm = null;
    if (state === "dead") map = DEAD;
    else if (state === "idle") map = STAND;
    else if (dino.ducking && dino.onGround) map = ROLL[Math.floor(frame / 3) % 4];
    else if (!dino.onGround) { map = RUN_A; arm = ARM_A; }
    else {
      const strideA = frame % 16 < 8;
      map = strideA ? RUN_A : RUN_B;
      arm = strideA ? ARM_A : ARM_B;
    }
    const px = PX;
    const h = map.length * px;
    sprite(map, dino.x, dino.y - h, px);
    if (arm) sprite(arm, dino.x, dino.y - h, px);

    /* HUD — drafting readout */
    const score = Math.floor(dist / 8);
    ctx.fillStyle = INK_FAINT;
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`DIST ${String(score).padStart(5, "0")} · HI ${String(hi).padStart(5, "0")}`, W - 18, 12);

    /* game-over stamp */
    if (state === "dead") {
      ctx.save();
      ctx.translate(W / 2, H / 2 - 14);
      ctx.rotate(-0.05);
      ctx.strokeStyle = COBALT;
      ctx.lineWidth = 3;
      ctx.strokeRect(-128, -20, 256, 40);
      ctx.fillStyle = COBALT;
      ctx.font = '700 15px "IBM Plex Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SYSTEM FAILURE", 0, 1);
      ctx.restore();
    }
  }

  /* ---- simulation ---- */
  function step(mult) {
    frame++;
    dist += speed * mult;
    speed = Math.min(13, speed + 0.0016 * mult);

    /* dino vertical */
    if (!dino.onGround) {
      dino.vy += 0.62 * mult;
      dino.y += dino.vy * mult;
      if (dino.y >= groundY) {
        dino.y = groundY;
        dino.vy = 0;
        dino.onGround = true;
      }
    }

    /* decor drift */
    decor.forEach((d) => {
      d.x -= speed * d.s * mult;
      if (d.x < -d.w - 30) d.x = W + Math.random() * 200;
    });

    /* obstacles */
    obstacles.forEach((o) => (o.x -= speed * mult));
    obstacles = obstacles.filter((o) => o.x > -o.w - 60);
    const last = obstacles[obstacles.length - 1];
    if (!last || last.x < W - (260 + Math.random() * 320 + speed * 22)) spawn();

    /* collision (AABB, forgiving inset) */
    const duckNow = dino.ducking && dino.onGround;
    const dw = (duckNow ? 16 : 18) * PX;
    const dh = (duckNow ? 16 : 35) * PX;
    const dx1 = dino.x + 8, dx2 = dino.x + dw - 10;
    const dy1 = dino.y - dh + 6, dy2 = dino.y - 2;
    for (const o of obstacles) {
      const oy1 = o.kind === "chip" ? groundY - o.h : o.y - o.h;
      const oy2 = o.kind === "chip" ? groundY : o.y;
      if (dx2 > o.x + 5 && dx1 < o.x + o.w - 5 && dy2 > oy1 + 4 && dy1 < oy2 - 4) {
        die();
        return;
      }
    }
  }

  /* one loop on gsap's ticker — steps only while running & visible */
  gsap.ticker.add((time, deltaMS) => {
    if (!dino || !inView || state !== "running") return;
    step(Math.min(deltaMS, 50) / (1000 / 60));
    if (state === "running") draw();
  });

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      resize();
      if (state !== "running") {
        if (state === "idle") reset();
        else dino.y = groundY;
        draw();
      }
    }, 150);
  });

  document.fonts.ready.then(() => {
    resize();
    reset();
    draw();
  });
})();

/* ============================================================
   Three.js — CAD wireframe assembly (hero, FIG. A)
   ============================================================ */
(function initWireframe() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || prefersReduced) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6.6);

  const COBALT = new THREE.Color(0x1e46e0);
  const INK = new THREE.Color(0x10131a);

  const group = new THREE.Group();
  scene.add(group);

  /* outer assembly — icosahedron edges */
  const icoGeo = new THREE.IcosahedronGeometry(2.2, 0);
  const icoEdges = new THREE.EdgesGeometry(icoGeo);
  const ico = new THREE.LineSegments(
    icoEdges,
    new THREE.LineBasicMaterial({ color: COBALT, transparent: true, opacity: 0.85 })
  );
  group.add(ico);

  /* inner core — octahedron edges, counter-rotating */
  const octGeo = new THREE.OctahedronGeometry(1.15, 0);
  const octEdges = new THREE.EdgesGeometry(octGeo);
  const oct = new THREE.LineSegments(
    octEdges,
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 })
  );
  group.add(oct);

  /* vertex nodes */
  const nodeMat = new THREE.PointsMaterial({ color: COBALT, size: 0.09, sizeAttenuation: true });
  const nodes = new THREE.Points(icoGeo, nodeMat);
  group.add(nodes);

  /* orbit ring — drafting circle */
  const ringPts = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(a) * 3, Math.sin(a) * 3, 0));
  }
  const ring = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(ringPts),
    new THREE.LineBasicMaterial({ color: COBALT, transparent: true, opacity: 0.25 })
  );
  ring.rotation.x = Math.PI / 2.6;
  group.add(ring);

  /* ---- tilt-follow: the assembly leans toward the cursor ---- */
  const pointer = { x: 0, y: 0 };
  if (!isTouch) {
    window.addEventListener("mousemove", (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  const holder = canvas.parentElement;
  function resize() {
    const w = holder.clientWidth || 600;
    const h = holder.clientHeight || 400;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    /* ~55% of hero height on desktop, parked right of the headline but pulled toward center */
    if (w > 1080) { group.position.set(1.8, 0.1, 0); group.scale.setScalar(0.6); }
    else if (w > 700) { group.position.set(1.1, 0.1, 0); group.scale.setScalar(0.55); }
    else { group.position.set(0, -0.4, 0); group.scale.setScalar(0.5); }
  }
  resize();
  window.addEventListener("resize", resize);

  let inView = true;
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0 }).observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!inView) return;
    const t = clock.getElapsedTime();
    /* smooth lean toward the cursor + gentle idle sway */
    const targetY = 0.4 + pointer.x * 0.55 + Math.sin(t * 0.3) * 0.06;
    const targetX = 0.18 + pointer.y * 0.35;
    group.rotation.y += (targetY - group.rotation.y) * 0.045;
    group.rotation.x += (targetX - group.rotation.x) * 0.045;
    ico.rotation.y = t * 0.1;
    oct.rotation.y = -t * 0.4;
    oct.rotation.z = t * 0.18;
    nodes.rotation.copy(ico.rotation);
    ring.rotation.z = t * 0.08;
    renderer.render(scene, camera);
  });
})();
