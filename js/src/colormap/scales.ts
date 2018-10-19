// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  rgb
} from 'd3-color';

import {
  scaleSequential
} from 'd3-scale';

import * as d3Chromatic from 'd3-scale-chromatic';

import {
  TypedArray
} from 'jupyter-dataserializers';

import {
  LinearScaleModel, LogScaleModel
} from '../continuous';

import { SequentialScaleModel } from '../scale';


/**
 * Contiguous color map.
 */
export class LinearColorScaleModel extends LinearScaleModel {
  defaults(): any {
    return {...super.defaults(),
      range: ['black', 'white'],
    };
  }

  isColorScale = true;

  static model_name = 'LinearColorScaleModel';
}

/**
 * Contiguous color map.
 */
export class LogColorScaleModel extends LogScaleModel {
  defaults(): any {
    return {...super.defaults(),
      range: ['black', 'white'],
    };
  }

  isColorScale = true;

  static model_name = 'LogColorScaleModel';
}


export type ColorInterpolator = (t: number) => string;

const chromaticInterpLut: {[key: string]: ColorInterpolator} = {};
for (let key of Object.keys(d3Chromatic)) {
  if (key.indexOf('interpolate') === 0) {
    const lowKey = key.slice('interpolate'.length).toLowerCase();
    chromaticInterpLut[lowKey] = (d3Chromatic as any)[key];
  }
}


/**
 * A contiguous color map created from a named color map.
 */
class NamedColorMapBase extends SequentialScaleModel<string> {

  getInterpolatorFactory(): ColorInterpolator {
    let name = this.get('name') as string;
    return chromaticInterpLut[name.toLowerCase()];
  }

  getInterpolatorFactoryName(): string | null {
    const interp = this.obj.interpolator();
    // Do a reverse lookup in d3Chromatic
    const lut = d3Chromatic as any;
    for (let key of Object.keys(lut)) {
      if (interp === lut[key]) {
        const name = key.replace(/^interpolate/, '');
        return name;
      }
    }
    throw new Error(`Unknown color interpolator name of function: ${interp}`);
  }

  constructObject() {
    const interpolator = this.getInterpolatorFactory();
    return scaleSequential(interpolator);
  }

  /**
   * Sync the model properties to the d3 object.
   */
  syncToObject() {
    super.syncToObject();
    const interpolator = this.getInterpolatorFactory();
    this.obj
      .interpolator(interpolator);
  }

  syncToModel(toSet: Backbone.ObjectHash) {
    toSet['name'] = this.getInterpolatorFactoryName();
    super.syncToModel(toSet);
  }

  isColorScale = true;
}

/**
 * A contiguous color map created from a named color map.
 */
export class NamedSequentialColorMap extends NamedColorMapBase {
  defaults(): any {
    return {...super.defaults(),
      name: 'Viridis'
    };
  }

  static model_name = 'NamedSequentialColorMap';
}

/**
 * A contiguous color map created from a named color map.
 */
export class NamedDivergingColorMap extends NamedColorMapBase {
  defaults(): any {
    return {...super.defaults(),
      name: 'BrBG'
    };
  }

  static model_name = 'NamedDivergingColorMap';
}


export interface ColorScale {
  copy(): this;
  domain(domain: [number, number]): this;
  (value: number | { valueOf(): number }): string;
}

export interface ColorMapModel {
  obj: ColorScale;
  isColorScale: true;
}

export function isColorMapModel(candidate: any): candidate is ColorMapModel {
  return (
    candidate !== null && candidate !== undefined &&
    candidate.isColorScale === true);
}


export function colormapAsRGBArray(mapModel: ColorMapModel, size: number): Uint8ClampedArray;
export function colormapAsRGBArray<T extends TypedArray>(mapModel: ColorMapModel, array: T): T;
export function colormapAsRGBArray(mapModel: ColorMapModel, data: number | TypedArray): TypedArray {
  let n;
  if (typeof data === 'number') {
    n = data;
    data = new Uint8ClampedArray(n * 3);
  } else {
    n = data.length / 3;
  }
  const scale = mapModel.obj.copy().domain([0, n]);
  for (let i=0; i<n; ++i) {
    const color = rgb(scale(i));
    data[i * 3 + 0] = color.r;
    data[i * 3 + 1] = color.g;
    data[i * 3 + 2] = color.b;
  }

  return data;
}


export function colormapAsRGBAArray(mapModel: ColorMapModel, size: number): Uint8ClampedArray;
export function colormapAsRGBAArray<T extends TypedArray>(mapModel: ColorMapModel, array: T): T;
export function colormapAsRGBAArray(mapModel: ColorMapModel, data: number | TypedArray): TypedArray {
  let n;
  if (typeof data === 'number') {
    n = data;
    data = new Uint8ClampedArray(n * 4);
  } else {
    n = data.length / 4;
  }
  const scale = mapModel.obj.copy().domain([0, n]);
  for (let i=0; i<n; ++i) {
    const color = rgb(scale(i));
    data[i * 4 + 0] = color.r;
    data[i * 4 + 1] = color.g;
    data[i * 4 + 2] = color.b;
    data[i * 4 + 3] = color.opacity;
  }

  return data;
}
