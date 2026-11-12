"use strict";
/* ================= CONFIGURACIÓN ================= */
const TOL = 0.1; // Tolerancia (en metros) para dar por correcta una respuesta. Cambiala acá.
const UNLOCK = 4; // Desafíos resueltos para desbloquear "El desafío secreto".
const KEY = "cuanto-mide-v1";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const f = (n, d = 2) =>
  n.toLocaleString("es-AR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

/* ================= DATOS (fijos, nunca aleatorios) =================
   m:'tan'   -> d (distancia, m), a (ángulo, °), h (altura de los ojos, m). ref = altura de referencia para chequear coherencia.
   m:'tales' -> S (sombra del objeto, m), hv (vara, m), s (sombra de la vara, m).
   La altura H se CALCULA con la fórmula; no se muestra hasta verificar. */
const CH = [
  {
    id: "arbol",
    name: "Árbol gigante",
    art: "tree",
    dif: "Fácil",
    m: "tan",
    desc: "Un eucalipto centenario del parque.",
    d: 20,
    a: 39.4,
    h: 1.6,
    ref: 18,
  },
  {
    id: "poste",
    name: "Poste de iluminación",
    art: "pole",
    dif: "Fácil",
    m: "tan",
    desc: "Una columna de alumbrado de la avenida.",
    d: 8,
    a: 34,
    h: 1.6,
    ref: 7,
  },
  {
    id: "edificio",
    name: "Edificio de varios pisos",
    art: "building",
    dif: "Medio",
    m: "tan",
    desc: "Un edificio de departamentos de ocho pisos.",
    d: 30,
    a: 36.7,
    h: 1.6,
    ref: 24,
  },
  {
    id: "palmera",
    name: "Palmera",
    art: "palm",
    dif: "Medio",
    m: "tales",
    desc: "Una palmera a media tarde. ¡Usemos su sombra!",
    S: 9.6,
    hv: 2,
    s: 1.6,
  },
  {
    id: "torre",
    name: "Torre de observación",
    art: "tower",
    dif: "Medio",
    m: "tan",
    desc: "Un mirador para ver toda la ciudad.",
    d: 50,
    a: 40.9,
    h: 1.6,
    ref: 45,
  },
  {
    id: "antena",
    name: "Antena",
    art: "antenna",
    dif: "Difícil",
    m: "tan",
    desc: "Una antena de telecomunicaciones.",
    d: 40,
    a: 55.6,
    h: 1.6,
    ref: 60,
  },
  {
    id: "monumento",
    name: "Monumento",
    art: "monument",
    dif: "Difícil",
    m: "tan",
    desc: "Un obelisco en el centro de la plaza.",
    d: 60,
    a: 47.7,
    h: 1.6,
    ref: 67.5,
  },
  {
    id: "secreto",
    name: "El desafío secreto",
    art: "secret",
    dif: "Experto",
    m: "tales",
    locked: true,
    desc: "Una estructura misteriosa. ¿Te animás?",
    S: 26.4,
    hv: 2,
    s: 1.6,
  },
];
const HINTS = {
  tan: [
    "Observá qué lados del triángulo conocés: la distancia y el ángulo.",
    "La distancia horizontal es el cateto adyacente; la altura sobre tus ojos es el cateto opuesto.",
    "¿Qué razón trigonométrica relaciona el cateto opuesto con el adyacente? Y no te olvides de sumar la altura de los ojos.",
  ],
  tales: [
    "Compará la altura y la sombra de cada objeto.",
    "Los triángulos formados por los objetos y sus sombras son semejantes.",
    "Planteá una proporción entre los lados correspondientes: H / S = h / s.",
  ],
};

/* ================= CÁLCULO (precisión interna completa) ================= */
const solve = (c) =>
  c.m === "tan"
    ? c.d * Math.tan((c.a * Math.PI) / 180) + c.h // grados -> radianes
    : (c.S * c.hv) / c.s; // Tales (s nunca es 0: datos fijos)
CH.forEach((c) => {
  c.H = solve(c);
  if (c.ref && Math.abs(c.H - c.ref) > 0.3)
    console.warn("Datos incoherentes en", c.id);
});

/* ================= ILUSTRACIONES SVG (caja de 100 de alto, base en y=0) ================= */
const ART = {
  tree: '<rect x="-5" y="-45" width="10" height="45" fill="#8a5a2b"/><circle cy="-68" r="30" fill="#2e9e5b"/><circle cx="-16" cy="-52" r="18" fill="#3dbb6f"/><circle cx="16" cy="-52" r="18" fill="#3dbb6f"/>',
  building:
    '<rect x="-24" y="-100" width="48" height="100" rx="3" fill="#5b7bd5"/>' +
    [0, 1, 2, 3, 4]
      .map((r) =>
        [0, 1, 2]
          .map(
            (q) =>
              `<rect x="${-17 + q * 13}" y="${-92 + r * 17}" width="8" height="10" fill="#ffe28a"/>`,
          )
          .join(""),
      )
      .join(""),
  tower:
    '<polygon points="-20,0 -7,-72 7,-72 20,0" fill="none" stroke="#7a5c99" stroke-width="3"/><path d="M-16-15H16M-12-35H12M-9-55H9M-16-15L9-55M16-15L-9-55M0-88V-100" stroke="#7a5c99" stroke-width="2"/><rect x="-15" y="-88" width="30" height="16" rx="4" fill="#e76f51"/>',
  pole: '<rect x="-2" y="-100" width="4" height="100" fill="#6b7280"/><path d="M0-98Q14-100 16-90" stroke="#6b7280" stroke-width="3" fill="none"/><circle cx="16" cy="-88" r="6" fill="#ffd84d"/>',
  antenna:
    '<path d="M0-100V0M-14 0L0-80L14 0" stroke="#475569" stroke-width="2.5" fill="none"/><path d="M-9-30H9M-6-55H6M-8-90H8" stroke="#475569" stroke-width="2"/><circle cy="-100" r="3.5" fill="#ef4444"/>',
  monument:
    '<polygon points="-10,-6 -6,-92 0,-100 6,-92 10,-6" fill="#d9d2c3" stroke="#a89f8c"/><rect x="-18" y="-6" width="36" height="6" fill="#a89f8c"/>',
  palm:
    '<path d="M-2 0Q8-50 0-85" stroke="#a0713c" stroke-width="6" fill="none"/>' +
    [-60, -20, 25, 160, 200, 240]
      .map(
        (a) =>
          `<ellipse cx="0" cy="-85" rx="22" ry="5" fill="#2fa866" transform="rotate(${a} 0 -85) translate(18 0)"/>`,
      )
      .join(""),
  secret:
    '<rect x="-14" y="-100" width="28" height="100" rx="6" fill="#6c5ce7"/><text y="-45" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>',
};
const drawArt = (t, x, gy, hp) =>
  `<g transform="translate(${x} ${gy}) scale(${hp / 100})">${ART[t]}</g>`;

/* Utilidades de dibujo */
const lbl = (x, y, t, c = "#1d2340", rot = 0, id = "") =>
  `<text ${id ? `id="${id}"` : ""} class="lbl" x="${x}" y="${y}" fill="${c}" text-anchor="middle"${rot ? ` transform="rotate(-90 ${x} ${y})"` : ""}>${t}</text>`;
const dim = (x1, y1, x2, y2, c) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" marker-start="url(#ar)" marker-end="url(#ar)"/>`;
const wrap = (inner, label) =>
  `<svg class="scene idle" viewBox="0 0 640 340" role="img" aria-label="${label}"><defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5 0 10z" fill="#1d2340"/></marker></defs>${inner}</svg>`;

/* Escena con clinómetro: dibujada con los MISMOS datos del ejercicio (escala k px/m) */
function sceneTan(c) {
  const gy = 280,
    x0 = 90,
    k = Math.min(400 / c.d, 215 / c.H),
    xb = x0 + c.d * k;
  const ey = gy - c.h * k,
    ty = gy - c.H * k,
    hp = c.H * k,
    r = (c.a * Math.PI) / 180,
    A = 42,
    xh = xb + hp * 0.34 + 14;
  return wrap(
    `
  <rect y="${gy}" width="640" height="60" fill="#8bd17c"/>
  ${drawArt(c.art, xb, gy, hp)}
  <line x1="${x0}" y1="${gy}" x2="${x0}" y2="${ey + 8}" stroke="#1d2340" stroke-width="5"/>
  <circle cx="${x0}" cy="${ey}" r="8" fill="#f4b183" stroke="#1d2340" stroke-width="2"/>
  <line x1="${x0}" y1="${ey}" x2="${xb}" y2="${ey}" stroke="#334155" stroke-dasharray="6 5" stroke-width="2"/>
  <g class="hl" data-s="3"><polygon points="${x0},${ey} ${xb},${ey} ${xb},${ty}" fill="#ffb84d66"/>
    ${lbl((x0 + xb) / 2, ey + 22, "cateto adyacente (d)")}${lbl(xb - 10, (ey + ty) / 2, "cateto opuesto (x)", "#be123c", 1)}</g>
  <line x1="${x0}" y1="${ey}" x2="${xb}" y2="${ty}" stroke="#e11d48" stroke-width="3"/>
  <g class="hl" data-s="2"><path d="M${x0 + A} ${ey}A${A} ${A} 0 0 0 ${x0 + A * Math.cos(r)} ${ey - A * Math.sin(r)}L${x0} ${ey}Z" fill="#4f46e544" stroke="#4f46e5" stroke-width="2"/>
    ${lbl(x0 + A + 36, ey - 6, `α = ${f(c.a, 1)}°`, "#4f46e5")}</g>
  <g class="hl" data-s="1">${dim(x0, gy + 22, xb, gy + 22, "#4f46e5")}${lbl((x0 + xb) / 2, gy + 44, `d = ${f(c.d)} m`, "#4f46e5")}</g>
  ${dim(x0 - 24, gy, x0 - 24, ey, "#0d9488")}${lbl(x0 - 32, (gy + ey) / 2, `h = ${f(c.h)} m`, "#0d9488", 1)}
  <g class="hl" data-s="4">${dim(xh, gy, xh, ty, "#16a34a")}${lbl(xh + 12, (gy + ty) / 2, "H = ?", "#16a34a", 1, "hLbl")}</g>`,
    `Observador a ${f(c.d)} metros mirando la cima con un ángulo de ${f(c.a, 1)} grados`,
  );
}

/* Escena de sombras: dos triángulos semejantes (objeto y vara) */
function sceneTales(c) {
  const gy = 280,
    x0 = 120,
    gap = 50,
    k = Math.min(210 / c.H, (440 - gap) / (c.S + c.s));
  const xe = x0 + c.S * k,
    xv = xe + gap,
    xve = xv + c.s * k,
    ty = gy - c.H * k,
    tv = gy - c.hv * k,
    hp = c.H * k;
  const xH = Math.max(30, x0 - hp * 0.34 - 10);
  return wrap(
    `
  <rect y="${gy}" width="640" height="60" fill="#8bd17c"/>
  <circle cx="40" cy="40" r="20" fill="#ffd84d"/><path d="M40 8V0M40 72V80M8 40H0M72 40H80M17 17L11 11M63 63L69 69" stroke="#ffd84d" stroke-width="3"/>
  <rect x="${x0}" y="${gy}" width="${c.S * k}" height="8" fill="#0003"/><rect x="${xv}" y="${gy}" width="${c.s * k}" height="8" fill="#0003"/>
  <g class="hl" data-s="2"><polygon points="${x0},${gy} ${x0},${ty} ${xe},${gy}" fill="#ea580c44"/><polygon points="${xv},${gy} ${xv},${tv} ${xve},${gy}" fill="#2563eb55"/></g>
  ${drawArt(c.art, x0, gy, hp)}
  <line x1="${xv}" y1="${gy}" x2="${xv}" y2="${tv}" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/>
  <path d="M${x0} ${ty}L${xe} ${gy}M${xv} ${tv}L${xve} ${gy}" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="7 5"/>
  <g class="hl" data-s="1">${dim(x0, gy + 22, xe, gy + 22, "#ea580c")}${lbl((x0 + xe) / 2, gy + 44, `S = ${f(c.S)} m`, "#ea580c")}
    ${dim(xv, gy + 22, xve, gy + 22, "#2563eb")}${lbl((xv + xve) / 2, gy + 44, `s = ${f(c.s)} m`, "#2563eb")}</g>
  <g class="hl" data-s="3">${dim(xH, gy, xH, ty, "#ea580c")}${lbl(xH - 8, (gy + ty) / 2, "H = ?", "#ea580c", 1, "hLbl")}
    ${dim(xv - 14, gy, xv - 14, tv, "#2563eb")}${lbl(xv - 22, (gy + tv) / 2, `h = ${f(c.hv)} m`, "#2563eb", 1)}${lbl(400, 30, "H / S = h / s")}</g>`,
    "Un objeto alto y una vara de 2 metros proyectan sombras: forman dos triángulos semejantes",
  );
}

/* ================= RESOLUCIÓN PASO A PASO: [etapa del dibujo, HTML] ================= */
function stepsFor(c) {
  const H = c.H;
  if (c.m === "tan") {
    const t = Math.tan((c.a * Math.PI) / 180),
      x = c.d * t;
    return [
      [
        0,
        `<b>Datos:</b> d = ${f(c.d)} m · α = ${f(c.a, 1)}° · h (altura de los ojos) = ${f(c.h)} m`,
      ],
      [0, `<b>Incógnita:</b> la altura total H del objeto.`],
      [
        1,
        `La distancia horizontal <b>d = ${f(c.d)} m</b> es el <b>cateto adyacente</b> al ángulo.`,
      ],
      [
        2,
        `El clinómetro mide el <b>ángulo de elevación α = ${f(c.a, 1)}°</b>, entre la horizontal y la línea hacia la cima.`,
      ],
      [
        3,
        `Se forma un <b>triángulo rectángulo</b>. El <b>cateto opuesto</b> (x) es la parte del objeto que está <i>por encima de tus ojos</i>.`,
      ],
      [
        3,
        `<b>Fórmula:</b> tan(α) = cateto opuesto / cateto adyacente = x / d, entonces <b>x = d · tan(α)</b>.`,
      ],
      [
        3,
        `<b>Sustitución:</b> x = ${f(c.d)} × tan(${f(c.a, 1)}°) = ${f(c.d)} × ${f(t, 4)} = <b>${f(x)} m</b><br><small>JavaScript usa radianes: ${f(c.a, 1)}° × π / 180.</small>`,
      ],
      [
        4,
        `El clinómetro está a la altura de tus ojos, así que falta sumar h hasta el suelo: <b>H = x + h = ${f(x)} + ${f(c.h)} = ${f(H)} m</b>`,
      ],
      [4, `<b>Resultado final: H ≈ ${f(H)} m</b>`],
      [
        4,
        `<b>¿Por qué así?</b> No podemos medir la altura, pero sí un ángulo y una distancia. La tangente conecta esos datos con la altura. Como el triángulo empieza a la altura de tus ojos, hay que sumar h.`,
      ],
    ];
  }
  return [
    [
      0,
      `<b>Datos:</b> sombra del objeto S = ${f(c.S)} m · vara h = ${f(c.hv)} m · sombra de la vara s = ${f(c.s)} m`,
    ],
    [0, `<b>Incógnita:</b> la altura H del objeto.`],
    [
      1,
      `El sol proyecta una sombra <b>S</b> del objeto y una sombra <b>s</b> de la vara.`,
    ],
    [
      2,
      `Los rayos del sol son paralelos, así que los dos triángulos tienen los mismos ángulos: son <b>semejantes</b>.`,
    ],
    [
      3,
      `<b>Teorema de Tales:</b> los lados correspondientes son proporcionales: <b>H / S = h / s</b>.`,
    ],
    [3, `Despejamos: <b>H = (S × h) / s</b>.`],
    [
      3,
      `<b>Sustitución:</b> H = (${f(c.S)} × ${f(c.hv)}) / ${f(c.s)} = ${f(c.S * c.hv)} / ${f(c.s)} = <b>${f(H)} m</b>`,
    ],
    [4, `<b>Resultado final: H ≈ ${f(H)} m</b>`],
    [
      4,
      `<b>¿Por qué así?</b> Acá no usamos ángulos ni tangente: usamos la semejanza de triángulos. Si la vara es tantas veces más chica que el objeto, su sombra también lo es.`,
    ],
  ];
}

/* ================= ESTADO Y PROGRESO ================= */
let P = { solved: {}, ok: {}, hints: 0 };
try {
  Object.assign(P, JSON.parse(localStorage.getItem(KEY) || "{}"));
} catch (e) {
  /* funciona sin localStorage */
}
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(P));
  } catch (e) {
    /* ignorar */
  }
};
const unlocked = () =>
  CH.filter((c) => !c.locked && P.solved[c.id]).length >= UNLOCK;
let cur = null,
  hintN = 0,
  timers = [];

function renderProg() {
  const n = Object.keys(P.solved).length,
    a = Object.keys(P.ok).length;
  $("#pText").textContent =
    `Resueltos: ${n}/${CH.length} · Aciertos: ${a} · Pistas: ${P.hints}`;
  $("#pBar").style.width = `${(n / CH.length) * 100}%`;
}
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => (s.hidden = s.id !== id));
  scrollTo(0, 0);
}

/* ================= PORTADA Y MENÚ ================= */
function renderHome() {
  const pos = {
    arbol: 55,
    edificio: 135,
    torre: 230,
    poste: 310,
    antena: 380,
    palmera: 480,
  };
  let s = '<rect y="215" width="580" height="15" fill="#8bd17c"/>';
  for (const id in pos) {
    const c = CH.find((o) => o.id === id);
    s += drawArt(c.art, pos[id], 215, c.H * 3.2);
  } // misma escala para todos
  $("#homeArt").innerHTML = s;
}
function renderMenu() {
  $("#grid").innerHTML = CH.map((c) => {
    const lock = c.locked && !unlocked();
    const hp = Math.min(88, 28 + c.H * 0.9); // miniatura (solo ilustrativa)
    return `<article class="card${lock ? " lock" : ""}">
      <svg viewBox="0 0 120 110" aria-hidden="true"><rect y="95" width="120" height="15" fill="#8bd17c"/>${drawArt(c.art, 60, 95, hp)}</svg>
      <h3>${lock ? "🔒 " : ""}${c.name}</h3>
      <p>${lock ? `Resolvé ${UNLOCK} desafíos para desbloquearlo.` : c.desc}</p>
      <div><span class="tag">${c.dif}</span><span class="tag">${c.m === "tan" ? "📐 Tangente" : "☀️ Tales"}</span>${P.solved[c.id] ? '<span class="tag done">✔ Resuelto</span>' : ""}</div>
      <button class="btn" data-id="${c.id}" ${lock ? "disabled" : ""}>${P.solved[c.id] ? "Volver a jugar" : "Comenzar desafío"}</button></article>`;
  }).join("");
}

/* ================= DESAFÍO ================= */
function openCh(id) {
  cur = CH.find((c) => c.id === id);
  $("#pTitle").textContent = cur.name;
  $("#pDesc").textContent = cur.desc;
  $("#scene").innerHTML = cur.m === "tan" ? sceneTan(cur) : sceneTales(cur);
  $("#chips").innerHTML = (
    cur.m === "tan"
      ? [
          `📐 Método: tangente`,
          `d = ${f(cur.d)} m`,
          `α = ${f(cur.a, 1)}°`,
          `h = ${f(cur.h)} m`,
        ]
      : [
          `☀️ Método: Teorema de Tales`,
          `S = ${f(cur.S)} m`,
          `h (vara) = ${f(cur.hv)} m`,
          `s = ${f(cur.s)} m`,
        ]
  )
    .map((t) => `<span class="chip">${t}</span>`)
    .join("");
  resetUI();
  show("s-play");
}
function resetUI() {
  timers.forEach(clearTimeout);
  timers = [];
  hintN = 0;
  $("#ans").value = "";
  $("#err").textContent = "";
  $("#hints").innerHTML = "";
  $("#hintBtn").disabled = false;
  $("#hintBtn").textContent = "Mostrar una pista";
  $("#res").hidden = true;
  $("#steps").innerHTML = "";
  const sv = $("#scene svg");
  if (sv) sv.classList.add("idle");
  $("#cf").getContext("2d").clearRect(0, 0, $("#cf").width, $("#cf").height);
}
function hint() {
  const list = HINTS[cur.m];
  if (hintN >= list.length) return;
  $("#hints").insertAdjacentHTML(
    "beforeend",
    `<li>💡 Pista ${hintN + 1}: ${list[hintN]}</li>`,
  );
  hintN++;
  P.hints++;
  save();
  renderProg();
  if (hintN >= list.length) {
    $("#hintBtn").disabled = true;
    $("#hintBtn").textContent = "No hay más pistas";
  } else $("#hintBtn").textContent = `Otra pista (${hintN}/${list.length})`;
}

function verify() {
  const raw = $("#ans").value.trim().replace(/\s/g, "").replace(",", "."); // acepta coma decimal
  const err = $("#err");
  if (!raw) {
    err.textContent = "Escribí tu respuesta antes de verificar.";
    return;
  }
  if (!/^\d+(\.\d+)?$/.test(raw) || !(Number(raw) > 0)) {
    err.textContent = "Ingresá un número mayor que cero, por ejemplo 18,5.";
    return;
  }
  err.textContent = "";
  const v = Number(raw) / ($("#unit").value === "cm" ? 100 : 1);
  const ok = Math.abs(v - cur.H) <= TOL;
  const wasLocked = cur.id !== "secreto" && !unlocked();
  P.solved[cur.id] = true;
  if (ok) P.ok[cur.id] = true;
  save();
  renderProg();
  renderMenu();

  const msg = $("#msg");
  msg.className = "msg " + (ok ? "ok" : "bad");
  msg.innerHTML = ok
    ? "🎉 ¡Excelente! ¡Resolviste el desafío!"
    : `🤔 ¡Casi! Veamos juntos cómo se resuelve. (La altura es ${f(cur.H)} m)`;
  if (wasLocked && unlocked())
    msg.innerHTML += "<br>🔓 ¡Se desbloqueó El desafío secreto!";
  $("#hLbl").textContent = `H = ${f(cur.H)} m`;
  $("#res").hidden = false;
  if (ok) confetti();
  playSteps();
  $("#res").scrollIntoView({
    behavior: RM ? "auto" : "smooth",
    block: "start",
  });
}

/* Animación gráfica: cada paso resalta una parte del dibujo */
function playSteps() {
  timers.forEach(clearTimeout);
  timers = [];
  const ol = $("#steps"),
    sv = $("#scene svg");
  ol.innerHTML = "";
  sv.classList.remove("idle");
  sv.querySelectorAll(".hl").forEach((e) => e.classList.remove("on"));
  stepsFor(cur).forEach(([st, html], i) => {
    const run = () => {
      ol.insertAdjacentHTML("beforeend", `<li>${html}</li>`);
      sv.querySelectorAll(".hl").forEach((e) =>
        e.classList.toggle("on", Number(e.dataset.s) <= st),
      );
    };
    if (RM) run();
    else timers.push(setTimeout(run, i * 1700));
  });
}

/* Confeti con canvas (sin bibliotecas); no bloquea los controles */
function confetti() {
  if (RM) return;
  const cv = $("#cf"),
    x = cv.getContext("2d");
  cv.width = innerWidth;
  cv.height = innerHeight;
  const ps = Array.from({ length: 160 }, () => ({
    x: Math.random() * cv.width,
    y: -Math.random() * cv.height * 0.6,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    r: 4 + Math.random() * 6,
    c: `hsl(${Math.random() * 360} 90% 58%)`,
    a: Math.random() * 6,
    va: (Math.random() - 0.5) * 0.3,
  }));
  const t0 = performance.now();
  (function frame(t) {
    x.clearRect(0, 0, cv.width, cv.height);
    ps.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      x.save();
      x.translate(p.x, p.y);
      x.rotate(p.a);
      x.fillStyle = p.c;
      x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      x.restore();
    });
    if (t - t0 < 3500) requestAnimationFrame(frame);
    else x.clearRect(0, 0, cv.width, cv.height);
  })(t0);
}

/* ================= EVENTOS ================= */
const goMenu = () => {
  resetUI();
  renderMenu();
  show("s-menu");
};
$("#startBtn").onclick = goMenu;
$("#homeBtn").onclick = () => {
  resetUI();
  show("s-home");
};
$("#backBtn").onclick = goMenu;
$("#menuBtn").onclick = goMenu;
$("#grid").onclick = (e) => {
  const b = e.target.closest("button[data-id]");
  if (b && !b.disabled) openCh(b.dataset.id);
};
$("#verBtn").onclick = verify;
$("#ans").onkeydown = (e) => {
  if (e.key === "Enter") verify();
};
$("#hintBtn").onclick = hint;
$("#retryBtn").onclick = resetUI;
$("#resetBtn").onclick = () => {
  P = { solved: {}, ok: {}, hints: 0 };
  save();
  renderProg();
  renderMenu();
};
$("#feriaBtn").onclick = () => {
  const on = document.body.classList.toggle("feria");
  $("#feriaBtn").setAttribute("aria-pressed", on);
  $("#feriaBtn").textContent = on ? "🖥️ Salir del modo feria" : "🖥️ Modo feria";
  $("#newBtn").hidden = !on;
};
// Modo feria: deja todo listo para el próximo visitante sin recargar la página
$("#newBtn").onclick = () => {
  P = { solved: {}, ok: {}, hints: 0 };
  save();
  renderProg();
  resetUI();
  show("s-home");
};

renderHome();
renderProg();
renderMenu();
show("s-home");
