/**
 * Ilustraciones SVG de marcador de posición para la demo local.
 * Se reemplazan desde el panel subiendo las fotografías reales de los productos.
 */

export type Shape = "bottle" | "jar" | "dropper" | "spray" | "kit";

export type Palette = { body: string; bodyLight: string; cap: string; label: string; ink: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function labelText(x: number, y: number, lines: string[], ink: string, size = 26) {
  return `
    <text x="${x}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="15" letter-spacing="6" fill="${ink}" opacity=".75">MILAGROS</text>
    <line x1="${x - 34}" x2="${x + 34}" y1="${y + 16}" y2="${y + 16}" stroke="${ink}" stroke-width="1" opacity=".35"/>
    ${lines
      .map(
        (l, i) =>
          `<text x="${x}" y="${y + 52 + i * (size + 6)}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${size}" fill="${ink}">${esc(l)}</text>`,
      )
      .join("")}`;
}

/** Devuelve el grupo del envase centrado en x=400 dentro de un lienzo 800x1000. */
export function vessel(shape: Shape, p: Palette, lines: string[], uid: string) {
  const grad = `
    <linearGradient id="g${uid}" x1="0" x2="1">
      <stop offset="0" stop-color="${p.body}"/><stop offset=".42" stop-color="${p.bodyLight}"/><stop offset="1" stop-color="${p.body}"/>
    </linearGradient>
    <linearGradient id="c${uid}" x1="0" x2="1">
      <stop offset="0" stop-color="${p.cap}"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="${p.cap}"/>
    </linearGradient>`;
  const shine = (x: number, y: number, h: number) =>
    `<rect x="${x}" y="${y}" width="16" height="${h}" rx="8" fill="#fff" opacity=".22"/>`;

  let body = "";
  switch (shape) {
    case "bottle":
      body = `
        <rect x="345" y="210" width="110" height="95" rx="16" fill="url(#c${uid})"/>
        <rect x="360" y="296" width="80" height="26" fill="${p.cap}" opacity=".8"/>
        <rect x="265" y="318" width="270" height="572" rx="70" fill="url(#g${uid})"/>
        ${shine(300, 360, 460)}
        <rect x="298" y="520" width="204" height="230" rx="6" fill="${p.label}"/>
        ${labelText(400, 580, lines, p.ink)}`;
      break;
    case "jar":
      body = `
        <rect x="215" y="505" width="370" height="100" rx="22" fill="url(#c${uid})"/>
        <rect x="195" y="595" width="410" height="295" rx="56" fill="url(#g${uid})"/>
        ${shine(235, 630, 210)}
        <rect x="258" y="640" width="284" height="200" rx="6" fill="${p.label}"/>
        ${labelText(400, 690, lines, p.ink, 24)}`;
      break;
    case "dropper":
      body = `
        <ellipse cx="400" cy="255" rx="42" ry="66" fill="${p.cap}"/>
        <rect x="348" y="300" width="104" height="96" rx="12" fill="url(#c${uid})"/>
        <rect x="292" y="390" width="216" height="500" rx="46" fill="url(#g${uid})"/>
        ${shine(322, 430, 400)}
        <rect x="316" y="540" width="168" height="220" rx="6" fill="${p.label}"/>
        ${labelText(400, 600, lines, p.ink, 22)}`;
      break;
    case "spray":
      body = `
        <path d="M372 190 h70 v40 h40 l20 22 h-60 v26 h-70 z" fill="${p.cap}"/>
        <rect x="338" y="262" width="124" height="96" rx="14" fill="url(#c${uid})"/>
        <rect x="282" y="350" width="236" height="540" rx="100" fill="url(#g${uid})"/>
        ${shine(318, 420, 380)}
        <rect x="308" y="540" width="184" height="220" rx="6" fill="${p.label}"/>
        ${labelText(400, 600, lines, p.ink, 23)}`;
      break;
    case "kit":
      body = `
        <g transform="translate(-150 70) scale(.86)">
          <rect x="345" y="210" width="110" height="95" rx="16" fill="${p.cap}"/>
          <rect x="265" y="318" width="270" height="572" rx="70" fill="url(#g${uid})"/>
        </g>
        <g transform="translate(150 150) scale(.78)">
          <ellipse cx="400" cy="255" rx="42" ry="66" fill="${p.cap}"/>
          <rect x="348" y="300" width="104" height="96" rx="12" fill="${p.cap}"/>
          <rect x="292" y="390" width="216" height="500" rx="46" fill="url(#g${uid})"/>
        </g>
        <rect x="200" y="620" width="400" height="270" rx="30" fill="${p.label}"/>
        ${labelText(400, 690, lines, p.ink, 28)}`;
      break;
  }
  return { defs: grad, body };
}

export function productSvg(opts: { shape: Shape; palette: Palette; lines: string[]; bg: [string, string]; variant?: number }) {
  const uid = Math.random().toString(36).slice(2, 8);
  const v = vessel(opts.shape, opts.palette, opts.lines, uid);
  const alt = opts.variant === 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bg${uid}" x1="0" y1="0" x2=".4" y2="1">
      <stop offset="0" stop-color="${opts.bg[0]}"/><stop offset="1" stop-color="${opts.bg[1]}"/>
    </linearGradient>
    ${v.defs}
  </defs>
  <rect width="800" height="1000" fill="url(#bg${uid})"/>
  ${alt
    ? `<rect x="120" y="120" width="560" height="800" rx="280" fill="#fff" opacity=".28"/>
       <circle cx="640" cy="200" r="70" fill="${opts.palette.bodyLight}" opacity=".35"/>
       <circle cx="150" cy="820" r="40" fill="${opts.palette.body}" opacity=".18"/>`
    : `<circle cx="400" cy="520" r="330" fill="#fff" opacity=".32"/>`}
  <ellipse cx="400" cy="900" rx="230" ry="26" fill="#3a2530" opacity=".10"/>
  ${v.body}
</svg>`;
}

/** Versión vertical para celular: envases arriba, espacio libre abajo para el texto. */
export function heroMobileSvg(opts: { bg: [string, string]; items: { shape: Shape; palette: Palette; lines: string[] }[] }) {
  const placements = [
    { x: 340, y: 40, s: 0.44 },
    { x: 540, y: -10, s: 0.56 },
    { x: 740, y: 70, s: 0.42 },
  ];
  const groups = opts.items.slice(0, 3).map((item, i) => {
    const v = vessel(item.shape, item.palette, item.lines, `m${i}`);
    const pl = placements[i];
    return { defs: v.defs, body: `<g transform="translate(${pl.x - 400 * pl.s} ${pl.y}) scale(${pl.s})">${v.body}</g>` };
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${opts.bg[0]}"/><stop offset="1" stop-color="${opts.bg[1]}"/>
    </linearGradient>
    ${groups.map((g) => g.defs).join("")}
  </defs>
  <rect width="1080" height="1350" fill="url(#mbg)"/>
  <circle cx="540" cy="260" r="300" fill="#fff" opacity=".35"/>
  <ellipse cx="540" cy="500" rx="300" ry="24" fill="#3a2530" opacity=".10"/>
  ${groups.map((g) => g.body).join("")}
</svg>`;
}

export function heroSvg(opts: { bg: [string, string]; items: { shape: Shape; palette: Palette; lines: string[] }[] }) {
  const placements = [
    { x: 1030, y: 190, s: 0.78 },
    { x: 1330, y: 110, s: 0.92 },
    { x: 1600, y: 300, s: 0.7 },
  ];
  const groups = opts.items.slice(0, 3).map((item, i) => {
    const v = vessel(item.shape, item.palette, item.lines, `h${i}`);
    const pl = placements[i];
    return { defs: v.defs, body: `<g transform="translate(${pl.x - 400 * pl.s} ${pl.y}) scale(${pl.s})">${v.body}</g>` };
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${opts.bg[0]}"/><stop offset="1" stop-color="${opts.bg[1]}"/>
    </linearGradient>
    <radialGradient id="hglow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    ${groups.map((g) => g.defs).join("")}
  </defs>
  <rect width="1920" height="1080" fill="url(#hbg)"/>
  <circle cx="1350" cy="560" r="560" fill="url(#hglow)"/>
  <path d="M880 1080 C 1000 760, 1250 640, 1920 600 L1920 1080 Z" fill="#fff" opacity=".18"/>
  <path d="M0 930 C 420 860, 760 1000, 1100 1080 L0 1080 Z" fill="#fff" opacity=".12"/>
  <ellipse cx="1340" cy="990" rx="520" ry="40" fill="#3a2530" opacity=".10"/>
  ${groups.map((g) => g.body).join("")}
</svg>`;
}
