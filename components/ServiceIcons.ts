import { ServiceType } from '../types';

// Minimal inline SVG icons as data URLs for performance and no external assets.
// Each icon uses simple shapes and distinct colors to represent the service.
export const SERVICE_ICONS: Record<ServiceType, string> = {
  [ServiceType.MASON]: svg(`M12 3L3 21h18L12 3z`, '#d97706'),
  [ServiceType.CARPENTER]: svgPathPair(
    `M4 14l6-6 6 6-6 6-6-6z`,
    `M16 4l4 4-8 8H8V12l8-8z`,
    '#6b7280', '#f59e0b'
  ),
  [ServiceType.MARBLE]: svg(`M3 3h18v18H3z M7 7l10 10 M17 7L7 17`, '#334155', true),
  [ServiceType.GRILL]: grid('#475569'),
  [ServiceType.ELECTRICIAN]: svg(`M13 3L5 14h6l-1 7 8-11h-6l1-7z`, '#f59e0b'),
  [ServiceType.PLUMBER]: svgPathPair(
    `M5 12h6a3 3 0 006 0h2v6h-4v-3a3 3 0 10-6 0v3H5v-6z`,
    `M4 8h8v2H4z`,
    '#0ea5e9', '#64748b'
  ),
  [ServiceType.PAINT]: svgPathPair(
    `M4 4h12a2 2 0 012 2v4a4 4 0 11-8 0V6H4V4z`,
    `M10 14v6h4v-6h-4z`,
    '#ef4444', '#facc15'
  ),
  [ServiceType.MODULAR_KITCHEN]: svg(`M3 5h18v6H3z M3 13h8v6H3z M13 13h8v6h-8z`, '#64748b', true),
  [ServiceType.FALSE_CEILING]: grid('#94a3b8'),
  [ServiceType.EVENT]: svg(`M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z`, '#22c55e'),
  [ServiceType.LAND]: svgPathPair(
    `M3 13l9-7 9 7v8H3v-8z`,
    `M9 21v-6h6v6`,
    '#16a34a', '#86efac'
  ),
  [ServiceType.AYA]: svg(`M12 21s-6-4.35-6-9a6 6 0 0112 0c0 4.65-6 9-6 9z`, '#fb7185'),
  [ServiceType.AC_REPAIR]: svg(`M4 6h16v12H4z M7 10a2 2 0 104 0 2 2 0 10-4 0zm6 0a2 2 0 104 0 2 2 0 10-4 0z M8 16h8`, '#60a5fa', true),
};

function svg(path: string, color: string, multi?: boolean) {
  const extra = multi ? '' : '';
  const data = `data:image/svg+xml;utf8,` +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='640' height='360'>` +
    `<rect width='100%' height='100%' fill='black'/>` +
    `<path d='${path}' fill='${color}' stroke='${color}' stroke-width='1.5'/>` + extra + `</svg>`;
  return data;
}
function svgPathPair(p1: string, p2: string, c1: string, c2: string) {
  const data = `data:image/svg+xml;utf8,` +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='640' height='360'>` +
    `<rect width='100%' height='100%' fill='black'/>` +
    `<path d='${p1}' fill='${c1}' stroke='${c1}' stroke-width='1.5'/>` +
    `<path d='${p2}' fill='${c2}' stroke='${c2}' stroke-width='1.5'/>` +
    `</svg>`;
  return data;
}
function grid(color: string) {
  const data = `data:image/svg+xml;utf8,` +
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='640' height='360'>` +
    `<rect width='100%' height='100%' fill='black'/>` +
    `<g stroke='${color}' stroke-width='1'>` +
    Array.from({ length: 10 }, (_, i) => `<line x1='${i*2+2}' y1='2' x2='${i*2+2}' y2='22'/>`).join('') +
    Array.from({ length: 10 }, (_, i) => `<line x1='2' y1='${i*2+2}' x2='22' y2='${i*2+2}'/>`).join('') +
    `</g></svg>`;
  return data;
}
