import { BoardCell, HexCoord } from '../types';

export const SQRT_3 = Math.sqrt(3);

// Pointy-top hex neighbor directions
export const HEX_DIRECTIONS: [number, number][] = [
  [+1, 0],
  [+1, -1],
  [0, -1],
  [-1, 0],
  [-1, +1],
  [0, +1],
];

export function getCellId(q: number, r: number): string {
  return `${q}_${r}`;
}

export function parseCellId(id: string): HexCoord {
  const [q, r] = id.split('_').map(Number);
  return { q, r, s: -q - r };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

export function getNeighbors(q: number, r: number): { q: number; r: number; id: string }[] {
  return HEX_DIRECTIONS.map(([dq, dr]) => {
    const nq = q + dq;
    const nr = r + dr;
    return { q: nq, r: nr, id: getCellId(nq, nr) };
  });
}

/**
 * Generates concentric hexagonal honeycomb cells of given radius.
 * radius 1: 7 cells (center + 6 around it)
 * radius 2: 19 cells
 * radius 3: 37 cells
 */
export function generateHexHoneycomb(radius: number): BoardCell[] {
  const cells: BoardCell[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      cells.push({
        id: getCellId(q, r),
        q,
        r,
      });
    }
  }
  return cells;
}

/**
 * Converts axial coordinates to pixel coordinates (Pointy-topped hexagon)
 */
export function hexToPixel(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * (SQRT_3 * q + (SQRT_3 / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

/**
 * Calculates SVG polygon points for a 3D pointy-top hexagon (legacy helper)
 */
export function getHexPolygonPoints(centerX: number, centerY: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30; // Pointy-top orientation (-30 deg offset)
    const angleRad = (Math.PI / 180) * angleDeg;
    const px = centerX + size * Math.cos(angleRad);
    const py = centerY + size * Math.sin(angleRad);
    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return points.join(' ');
}

export interface RoundedHexCorner {
  vertex: { x: number; y: number };
  tIn: { x: number; y: number };
  tOut: { x: number; y: number };
}

/**
 * Calculates smooth rounded corner tangent and vertex data for a pointy-top hexagon.
 */
export function getRoundedHexCornerData(
  centerX: number,
  centerY: number,
  size: number,
  cornerRadius: number = size * 0.18
): {
  vertices: { x: number; y: number }[];
  corners: RoundedHexCorner[];
  d: number;
} {
  const d = Math.min(cornerRadius / SQRT_3, size * 0.42);
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = (Math.PI / 180) * (60 * i - 30);
    vertices.push({
      x: centerX + size * Math.cos(angleRad),
      y: centerY + size * Math.sin(angleRad),
    });
  }

  const corners: RoundedHexCorner[] = [];
  for (let i = 0; i < 6; i++) {
    const prev = vertices[(i + 5) % 6];
    const curr = vertices[i];
    const next = vertices[(i + 1) % 6];

    const tIn = {
      x: curr.x + (prev.x - curr.x) * (d / size),
      y: curr.y + (prev.y - curr.y) * (d / size),
    };
    const tOut = {
      x: curr.x + (next.x - curr.x) * (d / size),
      y: curr.y + (next.y - curr.y) * (d / size),
    };

    corners.push({ vertex: curr, tIn, tOut });
  }

  return { vertices, corners, d };
}

/**
 * Generates an SVG path data string for a pointy-top hexagon with smooth rounded corners.
 */
export function getRoundedHexPath(
  centerX: number,
  centerY: number,
  size: number,
  cornerRadius: number = size * 0.18
): string {
  const { corners } = getRoundedHexCornerData(centerX, centerY, size, cornerRadius);
  const start = corners[5].tOut;
  let path = `M ${start.x.toFixed(2)},${start.y.toFixed(2)}`;
  for (let i = 0; i < 6; i++) {
    const c = corners[i];
    path += ` L ${c.tIn.x.toFixed(2)},${c.tIn.y.toFixed(2)} Q ${c.vertex.x.toFixed(2)},${c.vertex.y.toFixed(2)} ${c.tOut.x.toFixed(2)},${c.tOut.y.toFixed(2)}`;
  }
  path += ' Z';
  return path;
}

/**
 * Generates the front 3D extrusion mantle path for a rounded hexagon layer with thickness t.
 */
export function getRoundedFrontSkirtPath(
  centerX: number,
  centerY: number,
  size: number,
  dy: number,
  thickness: number,
  cornerRadius: number = size * 0.18
): string {
  const { corners } = getRoundedHexCornerData(centerX, centerY + dy, size, cornerRadius);

  const halfWidth = (SQRT_3 / 2) * size;
  const pLeft = { x: centerX - halfWidth, y: centerY + dy };
  const pRight = { x: centerX + halfWidth, y: centerY + dy };

  const c3 = corners[3]; // bottom-left corner
  const c2 = corners[2]; // bottom-center corner
  const c1 = corners[1]; // bottom-right corner

  const t = thickness;

  // Top perimeter of front skirt
  let path = `M ${pLeft.x.toFixed(2)},${pLeft.y.toFixed(2)}`;
  path += ` L ${c3.tIn.x.toFixed(2)},${c3.tIn.y.toFixed(2)} Q ${c3.vertex.x.toFixed(2)},${c3.vertex.y.toFixed(2)} ${c3.tOut.x.toFixed(2)},${c3.tOut.y.toFixed(2)}`;
  path += ` L ${c2.tIn.x.toFixed(2)},${c2.tIn.y.toFixed(2)} Q ${c2.vertex.x.toFixed(2)},${c2.vertex.y.toFixed(2)} ${c2.tOut.x.toFixed(2)},${c2.tOut.y.toFixed(2)}`;
  path += ` L ${c1.tIn.x.toFixed(2)},${c1.tIn.y.toFixed(2)} Q ${c1.vertex.x.toFixed(2)},${c1.vertex.y.toFixed(2)} ${c1.tOut.x.toFixed(2)},${c1.tOut.y.toFixed(2)}`;
  path += ` L ${pRight.x.toFixed(2)},${pRight.y.toFixed(2)}`;

  // Extrude down by thickness t and return in reverse
  path += ` L ${pRight.x.toFixed(2)},${(pRight.y + t).toFixed(2)}`;
  path += ` L ${c1.tOut.x.toFixed(2)},${(c1.tOut.y + t).toFixed(2)} Q ${c1.vertex.x.toFixed(2)},${(c1.vertex.y + t).toFixed(2)} ${c1.tIn.x.toFixed(2)},${(c1.tIn.y + t).toFixed(2)}`;
  path += ` L ${c2.tOut.x.toFixed(2)},${(c2.tOut.y + t).toFixed(2)} Q ${c2.vertex.x.toFixed(2)},${(c2.vertex.y + t).toFixed(2)} ${c2.tIn.x.toFixed(2)},${(c2.tIn.y + t).toFixed(2)}`;
  path += ` L ${c3.tOut.x.toFixed(2)},${(c3.tOut.y + t).toFixed(2)} Q ${c3.vertex.x.toFixed(2)},${(c3.vertex.y + t).toFixed(2)} ${c3.tIn.x.toFixed(2)},${(c3.tIn.y + t).toFixed(2)}`;
  path += ` L ${pLeft.x.toFixed(2)},${(pLeft.y + t).toFixed(2)}`;
  path += ' Z';

  return path;
}

/**
 * Generates an SVG path for the front curved rim polyline (used for specular chamfer & contact shadow).
 */
export function getRoundedFrontRimPath(
  centerX: number,
  centerY: number,
  size: number,
  dy: number,
  yOffset: number = 0,
  cornerRadius: number = size * 0.18
): string {
  const { corners } = getRoundedHexCornerData(centerX, centerY + dy, size, cornerRadius);

  const halfWidth = (SQRT_3 / 2) * size;
  const pLeft = { x: centerX - halfWidth, y: centerY + dy + yOffset };
  const pRight = { x: centerX + halfWidth, y: centerY + dy + yOffset };

  const c3 = corners[3];
  const c2 = corners[2];
  const c1 = corners[1];

  let path = `M ${pLeft.x.toFixed(2)},${pLeft.y.toFixed(2)}`;
  path += ` L ${c3.tIn.x.toFixed(2)},${(c3.tIn.y + yOffset).toFixed(2)} Q ${c3.vertex.x.toFixed(2)},${(c3.vertex.y + yOffset).toFixed(2)} ${c3.tOut.x.toFixed(2)},${(c3.tOut.y + yOffset).toFixed(2)}`;
  path += ` L ${c2.tIn.x.toFixed(2)},${(c2.tIn.y + yOffset).toFixed(2)} Q ${c2.vertex.x.toFixed(2)},${(c2.vertex.y + yOffset).toFixed(2)} ${c2.tOut.x.toFixed(2)},${(c2.tOut.y + yOffset).toFixed(2)}`;
  path += ` L ${c1.tIn.x.toFixed(2)},${(c1.tIn.y + yOffset).toFixed(2)} Q ${c1.vertex.x.toFixed(2)},${(c1.vertex.y + yOffset).toFixed(2)} ${c1.tOut.x.toFixed(2)},${(c1.tOut.y + yOffset).toFixed(2)}`;
  path += ` L ${pRight.x.toFixed(2)},${pRight.y.toFixed(2)}`;

  return path;
}
