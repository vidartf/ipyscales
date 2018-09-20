// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  scaleLinear, ScaleContinuousNumeric
} from 'd3-scale';

import { extent, range } from 'd3-array';

import { format } from 'd3-format';


const THRESHOLD = Math.PI / 4;


const TAU = 2 * Math.PI;


function radialSegments(start: number, stop: number, count: number | undefined) {
  const ext = stop - start;
  if (count === undefined) {
    // Use pattern of eights
    return 8;
  }
  // Split into integer subdivisions of circle:
  let N = Math.round(count * TAU / ext);
  if (N > 5 && N % 2) { // N should be even if > 5
    N = 2 * Math.round(count * Math.PI / ext);
  }
  return N;
}


export type RadialUnit = 'deg' | 'rad' | 'grad';

export interface RadialScale extends ScaleContinuousNumeric<number, number> {
  unit(): RadialUnit | null;
  unit(value: RadialUnit | null): this;
}


export function radialScale(base?: ScaleContinuousNumeric<number, number>): RadialScale {
  let scale: ScaleContinuousNumeric<number, number>;
  scale = base ? base.copy() : scaleLinear().domain([0, 360]).range([0, TAU]);
  const origTicks = scale.ticks;
  const origNice = scale.nice;
  const origTickFormat = scale.tickFormat;
  const origCopy = scale.copy;

  let unit: RadialUnit | null = 'deg';

  scale.ticks = function(count?: number): number[] {
    const re = extent(scale.range());
    const rangeExtent = re[1]! - re[0]!;
    // If the segment is less than treshold, use orginal ticks
    if (rangeExtent < THRESHOLD) {
      return origTicks.call(scale, count);
    }
    const N = radialSegments(re[0]!, re[1]!, count);
    const step = TAU / N;
    const istart = Math.ceil(re[0]! / step);
    const istop = (0.5 + Math.floor(re[1]! / step));
    return range(istart, istop)
      .map(x => scale.invert(x * step));
  }

  scale.nice = function(count?: number): ScaleContinuousNumeric<number, number> {
    const re = extent(scale.range());
    const rangeExtent = re[1]! - re[0]!;
    // If the segment is less than treshold, use orginal
    if (rangeExtent < THRESHOLD) {
      return origNice.call(scale, count);
    }

    const rstep = TAU / radialSegments(re[0]!, re[1]!, count);
    const rstart = rstep * Math.floor(re[0]! / rstep);
    const rstop = rstep * Math.ceil(re[1]! / rstep)
    const dstart = scale.invert(rstart);
    const dstop = scale.invert(rstop);
    const d = scale.domain();
    const r = scale.range();
    return scale
      .domain([dstart, ...d.slice(1, d.length -2), dstop])
      .range([rstart, ...r.slice(1, r.length - 2), rstop]);
  }

  const cast = scale as RadialScale;

  cast.unit = function(value?: RadialUnit | null): RadialScale | RadialUnit | null {
    return value ? (unit = value, cast) : unit;
  } as any;


  cast.tickFormat = function(count?: number, specifier?: string): ((d: number | { valueOf(): number }) => string) {
    if (unit === null) {
      return origTickFormat(count, specifier);
    } else if (unit !== 'rad') {
      const inner = origTickFormat(count, specifier);
      const unitString = unit === 'deg'
        ? '\u00b0'  // degree symbol
        : unit === 'grad'
          ? '\u1d4d'  // superscript g
          : '';
      return function(d: number | { valueOf(): number }): string {
        return `${inner(d)}${unitString}`;
      }
    } else if (specifier != null) { // unit === 'rad'
      return origTickFormat(count, specifier);
    } else {
      const re = extent(scale.range());
      const rangeExtent = re[1]! - re[0]!;
      if (rangeExtent < THRESHOLD) {
        return origTickFormat(count, specifier);
      }
      // Format as integer fraction of PI
      const intFormatter = format('d');
      return function(d: number): string {
        const n = TAU / d;
        const N = Math.round(n);
        if (Math.abs(N-n) > 0.01) {
          // Fallback after failed sanity check:
          return origTickFormat(count, specifier)(d);
        }
        return `\u1D70B / ${intFormatter(N)}`;
      }
    }
  }

  scale.copy = function(): RadialScale {
    const ourCopy = scale.copy;
    scale.copy = origCopy;
    let cp;
    try {
      cp = radialScale(scale);
    } finally {
      scale.copy = ourCopy;
    }
    cp.unit(cast.unit());
    return cp;
  }

  return cast;
}
