// A small drawing of each dermoscopic feature: what to look for, reduced to its
// essentials. Drawn in code (SVG) so they stay sharp at any size and need no
// image files. They are diagrams, not pictures: real lesions are messier.
//
// Every drawing fills a 100 × 100 box and is clipped to a round "dermatoscope
// field". To change one, edit its entry in DRAWINGS below.
import React, { useId } from 'react';

const C = {
  skin: '#f2d9c5',
  pink: '#f4cdc4',
  tan: '#d3a276',
  light: '#b9824f',
  brown: '#8a5a34',
  dark: '#4f2f18',
  black: '#241812',
  gray: '#8b909c',
  bluegray: '#6c8299',
  blue: '#47698f',
  red: '#cf3f3a',
  deepred: '#8c2230',
  purple: '#7b3b6b',
  white: '#ffffff',
  keratin: '#efd58d',
};

// Small seeded random generator, so every drawing looks the same on every render.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const n1 = (v) => Math.round(v * 10) / 10;

/** A closed, smooth, slightly irregular outline around (cx, cy). */
const blob = (cx, cy, r, wobble = 0.12, seed = 1, points = 11, squash = 1) => {
  const rand = rng(seed);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * 2 * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
  }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = '';
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % points]);
    if (i === 0) {
      const start = mid(pts[points - 1], p);
      d += `M${n1(start[0])} ${n1(start[1])}`;
    }
    d += `Q${n1(p[0])} ${n1(p[1])} ${n1(m[0])} ${n1(m[1])}`;
  }
  return `${d}Z`;
};

/** Random points inside a circle, kept at least `gap` apart. */
const scatter = (count, seed, { cx = 50, cy = 50, r = 28, gap = 5 } = {}) => {
  const rand = rng(seed);
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 60; tries++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r;
    const p = [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
    if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= gap)) out.push(p);
  }
  return out;
};

/** Line segments of a net inside a circle. `jitter` (0–1) makes it irregular. */
const net = (seed, { cx = 50, cy = 50, r = 30, step = 8, jitter = 0.12 } = {}) => {
  const rand = rng(seed);
  const size = Math.ceil((2 * r) / step) + 2;
  const at = [];
  for (let j = 0; j <= size; j++) {
    at.push([]);
    for (let i = 0; i <= size; i++) {
      at[j].push([
        cx - r - step + i * step + (j % 2 ? step / 2 : 0) + (rand() - 0.5) * jitter * step * 2,
        cy - r - step + j * step * 0.86 + (rand() - 0.5) * jitter * step * 2,
      ]);
    }
  }
  const segs = [];
  const add = (p, q) => {
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const edge = Math.hypot(mx - cx, my - cy) / r;
    if (edge <= 1) segs.push({ p, q, edge, roll: rand() });
  };
  // Honeycomb: every point joins the two below it; alternate points join sideways.
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const p = at[j][i];
      add(p, at[j + 1][j % 2 ? i : Math.max(0, i - 1)]);
      add(p, at[j + 1][j % 2 ? i + 1 : i]);
    }
  }
  return segs;
};

const Lines = ({ segs, stroke, width = 1, opacity = () => 1, widthOf }) =>
  segs.map((s, i) => (
    <line key={i} x1={n1(s.p[0])} y1={n1(s.p[1])} x2={n1(s.q[0])} y2={n1(s.q[1])} stroke={stroke}
      strokeWidth={widthOf ? widthOf(s) : width} strokeOpacity={opacity(s)} strokeLinecap="round" />
  ));

const Dots = ({ pts, r = 2, fill, radiusOf, fillOf, ...rest }) =>
  pts.map((p, i) => (
    <circle key={i} cx={n1(p[0])} cy={n1(p[1])} r={radiusOf ? radiusOf(i) : r} fill={fillOf ? fillOf(i) : fill} {...rest} />
  ));

// --- Shared backdrops ---

// Acral skin: broad ridges carrying white pore dots, separated by thin furrows.
// Ridge centres are at y = 14 + 16k; furrows halfway between.
const RIDGES = [14, 30, 46, 62, 78, 94];
const FURROWS = [6, 22, 38, 54, 70, 86];
const wavy = (y, amp = 1.5) => `M0 ${y}C20 ${y - amp} 30 ${y + amp} 50 ${y}S80 ${y - amp} 100 ${y}`;
const Acral = ({ children }) => (
  <>
    <rect width="100" height="100" fill="#f3dccb" />
    {FURROWS.map((y) => <path key={y} d={wavy(y)} stroke="#e2c2ab" strokeWidth="1.2" fill="none" />)}
    {children}
    {RIDGES.flatMap((y) => [10, 26, 42, 58, 74, 90].map((x) => (
      <circle key={`${x}-${y}`} cx={x + (y % 32 ? 0 : 8)} cy={y} r="1.1" fill="#fff" fillOpacity="0.95" />
    )))}
  </>
);

// Facial skin: evenly spaced follicular openings.
const FOLLICLES = [];
for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) FOLLICLES.push([14 + i * 18 + (j % 2 ? 9 : 0), 14 + j * 18]);
const Follicle = ({ p, r = 3.2 }) => <circle cx={p[0]} cy={p[1]} r={r} fill="#f6e3d3" stroke="#e7c9b2" strokeWidth="0.6" />;
const Face = ({ fill = '#d8ab84', children, openings = true }) => (
  <>
    <rect width="100" height="100" fill={fill} />
    {openings && FOLLICLES.map((p, i) => <Follicle key={i} p={p} />)}
    {children}
  </>
);

const lesion = (seed, r = 31, wobble = 0.1) => blob(50, 50, r, wobble, seed);

const Vessel = ({ d, w = 1.4, color = C.red }) => <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

const lacunae = (seed, fills, { count = 9, r = 24, gap = 11 } = {}) => {
  const rand = rng(seed + 7);
  return scatter(count, seed, { r, gap }).map((p, i) => (
    <path key={i} d={blob(p[0], p[1], 4.2 + rand() * 2.2, 0.14, seed + i, 8)} fill={fills[i % fills.length]} stroke="#00000022" strokeWidth="0.4" />
  ));
};

// --- The drawings ---
// Each returns SVG content. `u` gives ids for the shared blur filter and edge fade.
const DRAWINGS = {
  // Organization
  symmetric_single_pattern: () => (
    <>
      <ellipse cx="50" cy="50" rx="32" ry="26" fill={C.tan} />
      <Lines segs={net(3, { r: 31, step: 8, jitter: 0.05 }).filter((s) => ((s.p[0] - 50) / 31) ** 2 + ((s.p[1] - 50) / 25) ** 2 < 1)} stroke={C.brown} width={0.9} />
      <path d="M50 12V88M10 50H90" stroke="#1f2937" strokeWidth="0.9" strokeDasharray="3 3" />
    </>
  ),
  asymmetric_multicomponent: () => (
    <>
      <path d={blob(50, 50, 32, 0.28, 8, 9)} fill={C.tan} />
      <Lines segs={net(5, { cx: 37, cy: 40, r: 15, step: 7, jitter: 0.3 })} stroke={C.dark} width={1.2} />
      <path d={blob(64, 38, 11, 0.3, 4, 8)} fill={C.black} />
      <path d={blob(60, 64, 12, 0.25, 9, 8)} fill={C.bluegray} fillOpacity="0.9" />
      <Dots pts={scatter(9, 6, { cx: 36, cy: 64, r: 11, gap: 4 })} fill={C.dark} radiusOf={(i) => 1.2 + (i % 3) * 0.7} />
    </>
  ),
  multiple_colors: () => (
    <>
      <path d={blob(50, 50, 33, 0.14, 2)} fill={C.tan} />
      <path d={blob(38, 38, 14, 0.2, 3, 8)} fill={C.dark} />
      <path d={blob(62, 36, 10, 0.2, 5, 8)} fill={C.black} />
      <path d={blob(66, 58, 11, 0.2, 7, 8)} fill={C.bluegray} />
      <path d={blob(44, 66, 10, 0.2, 9, 8)} fill="#d9756d" />
      <path d={blob(53, 51, 6, 0.2, 11, 8)} fill="#f7efe8" />
    </>
  ),
  starburst_pattern: () => (
    <>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const x = 50 + Math.cos(a) * 34;
        const y = 50 + Math.sin(a) * 34;
        return (
          <g key={i}>
            <line x1={50 + Math.cos(a) * 18} y1={50 + Math.sin(a) * 18} x2={n1(x)} y2={n1(y)} stroke={C.black} strokeWidth="2" strokeLinecap="round" />
            <circle cx={n1(x)} cy={n1(y)} r="1.8" fill={C.black} />
          </g>
        );
      })}
      <circle cx="50" cy="50" r="23" fill={C.black} />
      <circle cx="50" cy="50" r="13" fill="#3b4a5e" fillOpacity="0.7" />
    </>
  ),
  sharp_demarcation: () => (
    <>
      <path d={lesion(4, 30, 0.08)} fill={C.brown} stroke={C.dark} strokeWidth="1.6" />
      <path d={lesion(4, 20, 0.08)} fill={C.light} fillOpacity="0.5" />
    </>
  ),
  no_pigment_network: () => (
    <>
      <path d={lesion(6, 31, 0.1)} fill="#e3a79b" />
      <path d={blob(44, 46, 12, 0.2, 3, 8)} fill="#d98c82" fillOpacity="0.7" />
      <g transform="translate(62 60)">
        <circle r="12" fill="#fff" stroke="#1f2937" strokeWidth="1.4" />
        <path d="M-6 -6H6V6H-6ZM-2 -6V6M2 -6V6M-6 -2H6M-6 2H6" stroke={C.brown} strokeWidth="1" fill="none" />
        <path d="M-8.5 8.5L8.5 -8.5" stroke="#b91c1c" strokeWidth="1.8" />
      </g>
    </>
  ),

  // Network
  typical_network: (u) => (
    <>
      <circle cx="50" cy="50" r="36" fill={C.tan} fillOpacity="0.55" filter={`url(#${u.blur})`} />
      <Lines segs={net(1, { r: 36, step: 8.5, jitter: 0.06 })} stroke={C.brown} width={1.1} opacity={(s) => Math.max(0.12, 1 - s.edge ** 3)} />
    </>
  ),
  atypical_network: () => (
    <>
      <path d={blob(50, 50, 34, 0.12, 5)} fill={C.tan} fillOpacity="0.7" />
      <Lines segs={net(12, { r: 33, step: 9, jitter: 0.42 })} stroke={C.dark}
        widthOf={(s) => (s.roll > 0.72 ? 3.2 : s.roll > 0.4 ? 1.6 : 0.8)} opacity={(s) => (s.roll < 0.12 ? 0 : 1)} />
    </>
  ),
  negative_network: () => (
    <>
      <path d={lesion(3, 33, 0.08)} fill={C.brown} />
      <Lines segs={net(9, { r: 32, step: 10, jitter: 0.3 })} stroke="#f8e9dc" width={2.2} />
    </>
  ),
  pseudonetwork: () => <Face fill={C.light} />,
  fingerprint_pattern: () => (
    <>
      <path d={lesion(2, 34, 0.1)} fill="#ecd2b6" />
      {[14, 21, 28, 35, 42, 49, 56, 63, 70].map((r) => (
        <path key={r} d={`M${n1(20 + r * 0.78)} ${n1(84 - r * 0.62)}A${r} ${r} 0 0 0 ${n1(20 - r * 0.2)} ${n1(84 - r * 0.98)}`}
          stroke={C.light} strokeWidth="1.5" fill="none" strokeLinecap="round" transform="translate(8 -2)" />
      ))}
    </>
  ),
  irregular_streaks: () => (
    <>
      {[-0.9, -0.62, -0.36, -0.1, 0.16].map((a, i) => {
        const len = 34 + (i % 2) * 5;
        const x = 46 + Math.cos(a) * len;
        const y = 52 + Math.sin(a) * len;
        return (
          <g key={i}>
            <line x1="46" y1="52" x2={n1(x)} y2={n1(y)} stroke={C.black} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={n1(x)} cy={n1(y)} r="2.6" fill={C.black} />
          </g>
        );
      })}
      <path d={blob(46, 52, 22, 0.14, 7)} fill={C.dark} />
    </>
  ),
  angulated_lines: () => (
    <>
      <path d={lesion(8, 34, 0.1)} fill="#dcc0a6" />
      <path d="M22 40L34 30L44 42L58 31L70 40M26 62L38 52L50 64L62 54L76 63M40 78L50 70L60 78M46 20L56 14" stroke="#6f6a6a" strokeWidth="2" fill="none" strokeLinejoin="miter" strokeLinecap="square" />
    </>
  ),
  white_rail_lines: () => (
    <>
      <path d={lesion(5, 33, 0.07)} fill="#d4534d" />
      <path d="M22 44C36 40 52 50 78 40M30 68C44 58 58 66 74 58M46 20C44 36 54 52 50 80" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),

  // Dots and globules
  regular_globules: () => (
    <>
      <path d={lesion(2, 32, 0.07)} fill={C.tan} />
      <Dots pts={scatter(30, 4, { r: 26, gap: 8 })} r={2.6} fill={C.brown} />
    </>
  ),
  irregular_globules: () => (
    <>
      <path d={blob(50, 50, 32, 0.16, 6)} fill={C.tan} />
      <Dots pts={scatter(13, 21, { cx: 60, cy: 42, r: 17, gap: 6.5 })} radiusOf={(i) => [1.4, 4.6, 2.2, 3.4, 1.2, 5.4][i % 6]}
        fillOf={(i) => [C.black, C.dark, C.brown, C.black, C.bluegray][i % 5]} />
      <Dots pts={scatter(4, 9, { cx: 34, cy: 62, r: 10, gap: 7 })} radiusOf={(i) => [1.6, 3.4, 2, 2.6][i]} fill={C.dark} />
    </>
  ),
  peripheral_globules: () => (
    <>
      <circle cx="50" cy="50" r="27" fill={C.tan} />
      <Lines segs={net(2, { r: 22, step: 8, jitter: 0.08 })} stroke={C.brown} width={0.9} />
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return <circle key={i} cx={n1(50 + Math.cos(a) * 29)} cy={n1(50 + Math.sin(a) * 29)} r="2.7" fill={C.dark} />;
      })}
    </>
  ),
  cobblestone_pattern: () => (
    <>
      <path d={lesion(3, 34, 0.06)} fill={C.dark} />
      {scatter(19, 15, { r: 26, gap: 12.5 }).map((p, i) => (
        <path key={i} d={blob(p[0], p[1], 6.4, 0.16, i + 3, 6)} fill={i % 3 ? C.light : C.brown} />
      ))}
    </>
  ),
  peppering: () => (
    <>
      <path d={lesion(4, 33, 0.1)} fill="#e9dcd2" />
      <Dots pts={scatter(150, 31, { r: 29, gap: 2.6 })} r={0.8} fill="#6f7f93" />
    </>
  ),

  // Structureless areas and colors
  structureless_brown: (u) => <path d={lesion(5, 31, 0.1)} fill={C.light} filter={`url(#${u.soft})`} />,
  central_hyperpigmentation: (u) => (
    <>
      <circle cx="50" cy="50" r="32" fill={C.tan} />
      <Lines segs={net(1, { r: 32, step: 8, jitter: 0.06 })} stroke={C.brown} width={0.9} />
      <circle cx="50" cy="50" r="14" fill={C.dark} filter={`url(#${u.blur})`} />
    </>
  ),
  irregular_blotch: () => (
    <>
      <path d={blob(50, 50, 32, 0.12, 2)} fill={C.tan} />
      <Lines segs={net(3, { r: 30, step: 8, jitter: 0.1 })} stroke={C.brown} width={0.8} />
      <path d={blob(63, 40, 15, 0.38, 14, 8)} fill={C.black} />
    </>
  ),
  peripheral_brown_structureless: () => (
    <>
      <path d={blob(54, 50, 33, 0.1, 3)} fill="#d9b38c" />
      <path d={blob(42, 50, 22, 0.14, 6)} fill={C.brown} />
      <Lines segs={net(4, { cx: 42, cy: 50, r: 20, step: 7, jitter: 0.2 })} stroke={C.dark} width={1} />
    </>
  ),
  blue_white_veil: (u) => (
    <>
      <path d={blob(50, 50, 32, 0.12, 4)} fill={C.brown} />
      <path d={blob(55, 46, 19, 0.3, 10, 8)} fill={C.blue} />
      <path d={blob(55, 46, 14, 0.3, 12, 8)} fill="#fff" fillOpacity="0.5" filter={`url(#${u.blur})`} />
    </>
  ),
  regression_structures: () => (
    <>
      <path d={blob(50, 50, 32, 0.12, 5)} fill={C.brown} />
      <path d={blob(60, 44, 17, 0.3, 3, 8)} fill="#f4ece6" />
      <Dots pts={scatter(42, 8, { cx: 60, cy: 46, r: 13, gap: 2.4 })} r={0.8} fill="#6f7f93" />
    </>
  ),
  homogeneous_blue: (u) => <path d={lesion(2, 29, 0.06)} fill={C.blue} filter={`url(#${u.soft})`} />,
  central_white_patch: (u) => (
    <>
      <circle cx="50" cy="50" r="33" fill={C.tan} fillOpacity="0.6" />
      <Lines segs={net(6, { r: 33, step: 6.5, jitter: 0.08 })} stroke={C.light} width={0.8} opacity={(s) => Math.max(0.15, 1 - s.edge ** 4)} />
      <path d={blob(50, 50, 16, 0.18, 4, 9)} fill="#fff" filter={`url(#${u.soft})`} />
    </>
  ),
  white_structureless: () => (
    <>
      <path d={lesion(3, 33, 0.08)} fill="#e7a79c" />
      <path d={blob(42, 44, 14, 0.25, 5, 8)} fill="#fbf5e6" />
      <path d={blob(63, 60, 10, 0.25, 7, 8)} fill="#fbf5e6" />
    </>
  ),
  pigment_within_scar: () => (
    <>
      <path d={blob(50, 50, 30, 0.1, 6, 11, 0.55)} fill="#fbf3ee" stroke="#ecd5c8" strokeWidth="1" />
      <path d="M30 50C36 44 40 54 46 48M44 56C50 50 56 58 62 50M56 44C60 40 66 46 70 44" stroke={C.dark} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Dots pts={[[36, 55], [52, 44], [66, 54]]} r={1.6} fill={C.dark} />
    </>
  ),
  red_structureless: (u) => <path d={lesion(4, 30, 0.08)} fill="#b8324a" filter={`url(#${u.soft})`} />,
  shiny_white_structures: () => (
    <>
      <path d={lesion(2, 33, 0.1)} fill="#c98f7d" />
      <path d="M30 40H42M36 34V46M54 30H66M60 26V36M48 56H62M55 50V63M30 62H40M35 58V68M64 48H74M68 44V54M44 72H52" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  rainbow_pattern: (u) => (
    <>
      <path d={lesion(3, 32, 0.08)} fill={C.purple} />
      <g filter={`url(#${u.blur})`}>
        {['#e84a4a', '#f2a03d', '#f4e04d', '#58c46a', '#4a8fe8', '#8a5be0'].map((c, i) => (
          <path key={c} d={`M${24 + i * 4} ${66 - i * 5}Q50 ${28 - i * 3 + 20} ${78 - i * 3} ${60 - i * 6}`} stroke={c} strokeWidth="4.5" fill="none" strokeOpacity="0.9" />
        ))}
      </g>
    </>
  ),
  white_collarette: () => (
    <>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#fff" strokeWidth="7" strokeDasharray="13 2.5" />
      <circle cx="50" cy="50" r="27" fill="#cc3f48" />
    </>
  ),

  // Acral
  parallel_furrow: () => (
    <Acral>{FURROWS.slice(1, 5).map((y) => <path key={y} d={wavy(y)} stroke={C.brown} strokeWidth="2" fill="none" />)}</Acral>
  ),
  lattice_pattern: () => (
    <Acral>
      {FURROWS.slice(1, 5).map((y) => <path key={y} d={wavy(y)} stroke={C.brown} strokeWidth="2" fill="none" />)}
      {FURROWS.slice(1, 4).flatMap((y, j) => [18, 34, 50, 66, 82].map((x) => (
        <line key={`${x}-${y}`} x1={x + (j % 2) * 8} y1={y} x2={x + (j % 2) * 8} y2={y + 16} stroke={C.brown} strokeWidth="1.6" />
      )))}
    </Acral>
  ),
  fibrillar_pattern: () => (
    <Acral>
      {Array.from({ length: 18 }, (_, i) => {
        const x = 8 + i * 5;
        return <line key={i} x1={x} y1={70 + (i % 3) * 3} x2={x + 12} y2={28 + (i % 4) * 3} stroke={C.brown} strokeWidth="1" />;
      })}
    </Acral>
  ),
  parallel_ridge: () => (
    <Acral>{RIDGES.slice(1, 5).map((y) => <path key={y} d={wavy(y)} stroke={C.dark} strokeWidth="9" fill="none" />)}</Acral>
  ),
  irregular_diffuse_pigmentation: (u) => (
    <Acral>
      <g filter={`url(#${u.soft})`}>
        <path d={blob(40, 44, 22, 0.35, 3, 8)} fill={C.dark} fillOpacity="0.9" />
        <path d={blob(64, 58, 18, 0.35, 5, 8)} fill={C.light} fillOpacity="0.9" />
        <path d={blob(58, 34, 12, 0.35, 7, 8)} fill="#59616e" fillOpacity="0.9" />
        <path d={blob(36, 68, 10, 0.3, 9, 8)} fill={C.black} fillOpacity="0.85" />
      </g>
    </Acral>
  ),

  // Facial
  asymmetric_follicular_openings: () => (
    <Face>
      {FOLLICLES.map((p, i) => (
        <path key={i} d={`M${p[0] - 3.4} ${p[1] - 2.4}A4.2 4.2 0 0 0 ${p[0] + 1.6} ${p[1] + 3.9}`} stroke={C.dark} strokeWidth="2.4" fill="none" strokeLinecap="round"
          transform={`rotate(${(i * 67) % 360} ${p[0]} ${p[1]})`} />
      ))}
    </Face>
  ),
  annular_granular: () => (
    <Face>
      {FOLLICLES.flatMap((p, i) => Array.from({ length: 9 }, (_, k) => {
        const a = (k / 9) * Math.PI * 2 + i;
        return <circle key={`${i}-${k}`} cx={n1(p[0] + Math.cos(a) * 5.4)} cy={n1(p[1] + Math.sin(a) * 5.4)} r="0.95" fill="#5f6875" />;
      }))}
    </Face>
  ),
  rhomboidal_structures: () => (
    <Face>
      {[0, 1, 2, 3].flatMap((j) => [0, 1, 2, 3, 4, 5].map((i) => {
        const x = 5 + i * 18 + (j % 2 ? 9 : 0) - 9;
        const y = 23 + j * 18;
        return <path key={`${i}-${j}`} d={`M${x} ${y}L${x + 9} ${y - 9}L${x + 18} ${y}L${x + 9} ${y + 9}Z`} stroke={C.dark} strokeWidth="2.2" fill="none" strokeLinejoin="round" />;
      }))}
    </Face>
  ),
  obliterated_follicles: () => (
    <Face>
      {FOLLICLES.map((p, i) => (i % 3 !== 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={C.dark} /> : null))}
    </Face>
  ),
  circle_within_circle: () => (
    <Face>
      {FOLLICLES.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="5.2" fill="none" stroke={C.dark} strokeWidth="1.5" />
          <circle cx={p[0]} cy={p[1]} r="1.7" fill="none" stroke={C.dark} strokeWidth="1.2" />
        </g>
      ))}
    </Face>
  ),

  // Hair and follicles
  hypertrichosis: () => (
    <>
      <path d={lesion(4, 31, 0.08)} fill={C.light} />
      {scatter(9, 5, { r: 22, gap: 11 }).map((p, i) => (
        <path key={i} d={`M${n1(p[0])} ${n1(p[1])}q${8 + (i % 3) * 3} ${-10 - (i % 2) * 6} ${22 + (i % 4) * 3} ${-18 + (i % 3) * 4}`} stroke={C.black} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      ))}
    </>
  ),
  perifollicular_hypopigmentation: () => (
    <>
      <path d={lesion(4, 32, 0.08)} fill={C.brown} />
      {scatter(9, 12, { r: 23, gap: 13 }).map((p, i) => (
        <g key={i}>
          <circle cx={n1(p[0])} cy={n1(p[1])} r="4.6" fill="#e6c4a3" />
          <circle cx={n1(p[0])} cy={n1(p[1])} r="0.9" fill={C.black} />
        </g>
      ))}
    </>
  ),

  // Keratin and surface
  milia_like_cysts: () => (
    <>
      <path d={lesion(3, 32, 0.08)} fill={C.brown} />
      {scatter(9, 16, { r: 23, gap: 11 }).map((p, i) => (
        <g key={i}>
          <circle cx={n1(p[0])} cy={n1(p[1])} r={3.6 + (i % 3)} fill="#fff7d6" fillOpacity="0.45" />
          <circle cx={n1(p[0])} cy={n1(p[1])} r={2 + (i % 3) * 0.6} fill="#fffbe8" />
        </g>
      ))}
    </>
  ),
  comedo_like_openings: () => (
    <>
      <path d={lesion(3, 32, 0.08)} fill={C.light} />
      {scatter(8, 23, { r: 23, gap: 12 }).map((p, i) => (
        <path key={i} d={blob(p[0], p[1], 3.2 + (i % 3), 0.2, i + 2, 7)} fill={C.black} stroke="#e6c08a" strokeWidth="1.3" />
      ))}
    </>
  ),
  fissures_ridges: () => (
    <>
      <path d={lesion(2, 33, 0.07)} fill={C.light} />
      <path d="M24 40C34 30 40 46 50 36S66 30 76 42M20 54C32 46 38 62 50 52S68 46 80 56M26 68C36 60 44 74 54 66S66 62 74 70M38 24C44 30 54 20 62 26" stroke={C.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  moth_eaten_border: () => {
    // A round lesion with concave bites taken out of its edge.
    const bites = [[-1.3, 9], [-0.2, 11], [0.75, 8], [1.9, 10], [2.9, 9], [3.9, 7]];
    return (
      <>
        <circle cx="50" cy="50" r="33" fill={C.light} />
        {bites.map(([a, r]) => (
          <circle key={a} cx={n1(50 + Math.cos(a) * 36)} cy={n1(50 + Math.sin(a) * 36)} r={r} fill={C.skin} />
        ))}
      </>
    );
  },
  keratin_scale: () => (
    <>
      <path d={lesion(4, 33, 0.08)} fill="#e19a8e" />
      {scatter(9, 27, { r: 23, gap: 12 }).map((p, i) => (
        <path key={i} d={blob(p[0], p[1], 5.5 + (i % 3), 0.4, i + 1, 6)} fill={i % 2 ? '#fdf8ea' : C.keratin} stroke="#d9c58c" strokeWidth="0.6" />
      ))}
    </>
  ),
  white_circles: () => (
    <>
      <rect width="100" height="100" fill="#e3a093" />
      {scatter(12, 33, { r: 34, gap: 15 }).map((p, i) => (
        <g key={i}>
          <circle cx={n1(p[0])} cy={n1(p[1])} r="4.8" fill="none" stroke="#fff" strokeWidth="2.2" />
          <circle cx={n1(p[0])} cy={n1(p[1])} r="1.5" fill="#e8c77d" />
        </g>
      ))}
    </>
  ),
  rosettes: () => (
    <>
      <path d={lesion(2, 34, 0.08)} fill="#c98f7d" />
      {scatter(8, 41, { r: 25, gap: 13 }).map((p, i) => (
        <g key={i} transform={`rotate(${i * 20} ${n1(p[0])} ${n1(p[1])})`}>
          {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={n1(p[0] + dx)} cy={n1(p[1] + dy)} r="1.5" fill="#fff" />
          ))}
        </g>
      ))}
    </>
  ),
  strawberry_pattern: () => (
    <>
      <rect width="100" height="100" fill="#d9584f" />
      {FOLLICLES.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="5" fill="#fbe9e4" />
          <circle cx={p[0]} cy={p[1]} r="2" fill="#e7c36c" />
        </g>
      ))}
    </>
  ),
  ulceration: () => (
    <>
      <path d={lesion(3, 33, 0.08)} fill="#e7a99e" />
      <path d={blob(52, 50, 17, 0.4, 19, 9)} fill="#7a1d1d" />
      <path d={blob(55, 52, 9, 0.4, 5, 8)} fill="#2a1010" />
      <path d={blob(42, 44, 5, 0.4, 7, 7)} fill="#c8662e" />
    </>
  ),
  multiple_small_erosions: () => (
    <>
      <path d={lesion(3, 33, 0.08)} fill="#e7a99e" />
      {scatter(8, 44, { r: 24, gap: 12 }).map((p, i) => (
        <path key={i} d={blob(p[0], p[1], 2.4 + (i % 2), 0.35, i + 1, 6)} fill={i % 2 ? '#a8432a' : '#c8662e'} />
      ))}
    </>
  ),

  // BCC structures
  blue_gray_ovoid_nests: () => (
    <>
      <path d={lesion(5, 34, 0.08)} fill={C.pink} />
      <ellipse cx="60" cy="58" rx="14" ry="18" fill={C.bluegray} transform="rotate(25 60 58)" />
      <ellipse cx="38" cy="40" rx="9" ry="7" fill={C.bluegray} />
      <ellipse cx="60" cy="30" rx="6" ry="4.5" fill={C.bluegray} />
      <ellipse cx="34" cy="62" rx="5" ry="6.5" fill={C.bluegray} />
      <ellipse cx="44" cy="52" rx="3" ry="2.4" fill={C.bluegray} />
    </>
  ),
  leaf_like_areas: () => (
    <>
      <path d={lesion(5, 33, 0.08)} fill={C.pink} />
      {[[205, 36, 44], [330, 62, 38], [95, 52, 66]].map(([rot, x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          {[-48, -16, 16, 48].map((a) => (
            <ellipse key={a} cx="10" cy="0" rx="10" ry="5" fill="#7d6f63" transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
    </>
  ),
  spoke_wheel: () => (
    <>
      <path d={lesion(5, 34, 0.08)} fill={C.pink} />
      {[[36, 42, 17], [66, 62, 14], [66, 28, 9]].map(([x, y, r], i) => (
        <g key={i}>
          {Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2;
            return <line key={k} x1={x} y1={y} x2={n1(x + Math.cos(a) * r)} y2={n1(y + Math.sin(a) * r)} stroke={C.light} strokeWidth={r / 6} strokeLinecap="round" />;
          })}
          <circle cx={x} cy={y} r={r / 3.2} fill={C.dark} />
        </g>
      ))}
    </>
  ),
  concentric_structures: () => (
    <>
      <path d={lesion(5, 34, 0.08)} fill={C.pink} />
      {[[36, 42, 9], [62, 36, 7], [58, 62, 10], [36, 66, 6]].map(([x, y, r], i) => (
        <g key={i}>
          <path d={blob(x, y, r, 0.16, i + 4, 8)} fill="#8e8a86" />
          <circle cx={x} cy={y} r={r / 2.6} fill={C.black} />
        </g>
      ))}
    </>
  ),
  in_focus_dots: () => (
    <>
      <path d={lesion(5, 34, 0.08)} fill={C.pink} />
      <Dots pts={scatter(16, 52, { r: 27, gap: 9 })} r={1.5} fill="#55606e" />
    </>
  ),

  // Vessels
  arborizing_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      <Vessel w={3.2} d="M18 70C32 62 40 56 50 48" />
      <Vessel w={2.4} d="M50 48C58 42 66 40 80 32M50 48C54 58 62 64 76 66" />
      <Vessel w={1.5} d="M34 61C34 50 30 42 32 32M62 41C62 34 58 28 60 20M66 62C72 56 78 54 82 48" />
      <Vessel w={0.9} d="M33 44C38 40 42 38 46 32M61 28C66 26 70 24 72 18M72 37C74 42 78 44 80 42M60 60C58 66 60 72 56 78M32 38C28 36 26 32 22 30" />
    </>
  ),
  short_fine_telangiectasias: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      {scatter(15, 61, { r: 27, gap: 10 }).map((p, i) => (
        <Vessel key={i} w={0.9} d={`M${n1(p[0] - 4)} ${n1(p[1])}q${3 + (i % 3)} ${(i % 2 ? -3 : 3)} ${8} ${(i % 3) - 1}`} />
      ))}
    </>
  ),
  comma_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill="#eec4ae" />
      {scatter(11, 64, { r: 26, gap: 13 }).map((p, i) => (
        <g key={i} transform={`rotate(${(i * 83) % 360} ${n1(p[0])} ${n1(p[1])})`}>
          <Vessel w={2} d={`M${n1(p[0] - 3)} ${n1(p[1] + 4)}q7 -1 5 -9`} />
        </g>
      ))}
    </>
  ),
  dotted_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      <Dots pts={scatter(48, 70, { r: 29, gap: 6.5 })} r={1.25} fill={C.red} />
    </>
  ),
  glomerular_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      {[...scatter(4, 72, { cx: 38, cy: 40, r: 14, gap: 13 }), ...scatter(3, 75, { cx: 64, cy: 62, r: 12, gap: 13 })].map((p, i) => (
        <g key={i} transform={`translate(${n1(p[0])} ${n1(p[1])}) rotate(${i * 50}) scale(1.7)`}>
          <Vessel w={1} d="M-3 0C-3 -4 3 -4 3 0C3 4 -2 3 -2 0C-2 -2 1.5 -2 1.5 0C1.5 1.6 -0.5 1.4 -0.4 0.2" />
        </g>
      ))}
    </>
  ),
  hairpin_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      {scatter(8, 81, { r: 24, gap: 15 }).map((p, i) => (
        <g key={i} transform={`translate(${n1(p[0])} ${n1(p[1])}) rotate(${(i * 47) % 360})`}>
          <path d="M-2.4 6V-3A2.4 2.4 0 0 1 2.4 -3V6" stroke="#fff" strokeWidth="5.4" fill="none" strokeLinecap="round" strokeOpacity="0.85" />
          <Vessel w={1.4} d="M-2.4 6V-3A2.4 2.4 0 0 1 2.4 -3V6" />
        </g>
      ))}
    </>
  ),
  polymorphous_vessels: () => (
    <>
      <path d={lesion(5, 35, 0.06)} fill={C.pink} />
      <Dots pts={scatter(12, 90, { cx: 36, cy: 38, r: 13, gap: 5 })} r={1.25} fill={C.red} />
      <Vessel w={1.3} d="M54 28q6 4 4 10t6 10M68 30q-4 8 4 12M56 58q8 -4 10 4t10 2" />
      {[[36, 66, 20], [46, 74, 120], [28, 56, 250]].map(([x, y, rot]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <Vessel w={1.3} d="M-2.2 5V-2.5A2.2 2.2 0 0 1 2.2 -2.5V5" />
        </g>
      ))}
    </>
  ),
  radiating_vessels: () => (
    <>
      <rect width="100" height="100" fill={C.skin} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const x = 50 + Math.cos(a) * 30;
        const y = 50 + Math.sin(a) * 30;
        const bend = i % 2 ? 6 : -6;
        return <Vessel key={i} w={1.2} d={`M50 50Q${n1(50 + Math.cos(a + 0.3) * 16)} ${n1(50 + Math.sin(a + 0.3) * 16 + bend / 3)} ${n1(x)} ${n1(y)}`} />;
      })}
      <circle cx="50" cy="50" r="4.5" fill={C.red} />
    </>
  ),
  milky_red_areas: (u) => (
    <>
      <path d={lesion(5, 35, 0.06)} fill="#eac0b4" />
      <g filter={`url(#${u.blur})`}>
        <path d={blob(44, 46, 17, 0.3, 4, 8)} fill="#e56f7f" />
        <path d={blob(64, 62, 11, 0.3, 6, 8)} fill="#e88a94" />
        <path d="M36 44q6 -4 12 2M60 60q4 4 8 0" stroke="#c8364a" strokeWidth="1.6" fill="none" />
      </g>
    </>
  ),
  red_lacunae: () => (
    <>
      <path d={lesion(5, 33, 0.06)} fill="#f3d3cb" />
      {lacunae(101, ['#c9303a', '#a4283f', '#d34a4a'], { count: 16, r: 26, gap: 11.5 })}
    </>
  ),
  dark_lacunae: () => (
    <>
      <path d={lesion(5, 33, 0.06)} fill="#c9a6a8" />
      {lacunae(111, ['#2a1722', '#44182a', '#1d1418'], { count: 16, r: 26, gap: 11.5 })}
    </>
  ),
  pale_lacunae: () => (
    <>
      <path d={lesion(5, 33, 0.06)} fill="#f0d2c4" />
      {lacunae(121, ['#f6ecc4', '#f3e3b0', '#f6ecc4', '#d9837b'], { count: 16, r: 26, gap: 11.5 })}
    </>
  ),
  whitish_veil: (u) => (
    <>
      <path d={lesion(5, 33, 0.06)} fill="#c9a6a8" />
      {lacunae(111, ['#2a1722', '#44182a', '#1d1418'], { count: 16, r: 26, gap: 11.5 })}
      <path d={blob(46, 46, 20, 0.3, 9, 8)} fill="#fff" fillOpacity="0.72" filter={`url(#${u.blur})`} />
    </>
  ),
};

/** The drawing for a feature, `size` pixels across. Decorative unless `title` is given. */
export function Schematic({ id, size = 64, title, className }) {
  const key = useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = { clip: `c${key}`, blur: `b${key}`, soft: `s${key}` };
  const draw = DRAWINGS[id];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={title ? 'img' : undefined}
      aria-label={title} aria-hidden={title ? undefined : true} style={{ flex: 'none', display: 'block' }}>
      <defs>
        <clipPath id={u.clip}><circle cx="50" cy="50" r="48" /></clipPath>
        <filter id={u.blur} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={u.soft} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <g clipPath={`url(#${u.clip})`}>
        <rect width="100" height="100" fill={C.skin} />
        {draw ? draw(u) : null}
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#1f2937" strokeOpacity="0.16" strokeWidth="1.5" />
    </svg>
  );
}
