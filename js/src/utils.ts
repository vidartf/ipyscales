// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export function arrayEquals(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  const al = a.length;
  for (let i=0; i < al; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


/**
 * Parse a CSS color string to an RGBA number array.
 *
 * Handles the formats:
 * - #ffffff
 * - rgb(255, 255, 255)
 * - rgba(255, 255, 255, 1.0)
 */
export function parseCssColor(color: string): [number, number, number, number] {
  let m = color.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    return [
      parseInt(m[1].substr(0, 2), 16),
      parseInt(m[1].substr(2, 2), 16),
      parseInt(m[1].substr(4, 2), 16),
      255
    ];
  }
  m = color.match(/^rgb\((\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d+)\s*)\)$/i);
  if (m) {
    return [
      parseInt(m[2], 10),
      parseInt(m[4], 10),
      parseInt(m[6], 10),
      255
    ];
  }
  m = color.match(/^rgba\((\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d\.?|\d*\.\d+)\s*)\)$/i);
  if (m) {
    return [
      parseInt(m[2], 10),
      parseInt(m[4], 10),
      parseInt(m[6], 10),
      Math.round(255 * Math.max(0, Math.min(1, parseFloat(m[8])))),
    ];
  }
  throw new Error(`Invalid CSS color: "${color}"`);
}