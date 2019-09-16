// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  rgb, hsl
} from 'd3-color';

import {
  interpolateRgb, interpolateHsl, piecewise
} from 'd3-interpolate';

import {
  scaleSequential, scaleDiverging, scaleOrdinal,
} from 'd3-scale';

// Polyfill missing typing for diverging scale:
declare module "d3-scale" {
  function scaleDiverging<Output>(interpolator: ((t: number) => Output)): ScaleSequential<Output>;
}

import * as d3Chromatic from 'd3-scale-chromatic';

import {
  data_union_array_serialization, TypedArray
} from 'jupyter-dataserializers';

import ndarray = require('ndarray')

import {
  LinearScaleModel, LogScaleModel
} from '../continuous';

import { SequentialScaleModel, OrdinalScaleModel } from '../scale';

import { arrayEquals } from '../utils';


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


export class ArrayColorScaleModel extends SequentialScaleModel<string> {

  isColorScale = true;

  defaults(): any {
    return {...super.defaults(),
      colors: ndarray(new Float32Array([0, 0, 0, 1, 1, 1]), [2, 3]),
      space: 'rgb',
      gamma: 1.0,
    };
  }

  createInterpolator(): (t: number) => any {
    const space = this.get('space') as string;
    const colors = this.get('colors') as ndarray;
    const factory = space === 'hsl' ? hsl : rgb;
    const spaceColors = [];
    const alpha = colors.shape[1] > 3;
    if (space === 'hsl') {
      for (let i = 0; i < colors.shape[0]; ++i) {
        spaceColors.push(factory(
          360 * colors.get(i, 0),
          colors.get(i, 1),
          colors.get(i, 2),
          alpha ? colors.get(i, 3) : 1.0
        ));
      }
      return piecewise(interpolateHsl, spaceColors);
    }

    for (let i = 0; i < colors.shape[0]; ++i) {
      spaceColors.push(factory(
        255 * colors.get(i, 0),
        255 * colors.get(i, 1),
        255 * colors.get(i, 2),
        alpha ? colors.get(i, 3) : 1.0
      ));
    }
    let gamma = this.get('gamma');
    if (gamma === undefined || gamma === null) {
      gamma = 1.0;
    }
    return piecewise(interpolateRgb.gamma(gamma), spaceColors);
  }

  syncToObject() {
    super.syncToObject();
    const interpProps = ['colors', 'space', 'gamma'];
    const interpChange = interpProps.some(prop => this.hasChanged(prop));
    if (interpChange) {
      this.obj.interpolator(this.createInterpolator());
    }
  }

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  constructObject(): any {
    return scaleSequential(this.createInterpolator());
  }

  protected colorInterp: ((t: number) => string) | null = null;

  static model_name = 'ArrayColorScaleModel';

  static serializers = {
    ...SequentialScaleModel.serializers,
    colors: data_union_array_serialization,
  }
}


export type ColorInterpolator = (t: number) => string;

const chromaticInterpLut: {[key: string]: ColorInterpolator} = {};
for (let key of Object.keys(d3Chromatic)) {
  if (key.indexOf('interpolate') === 0) {
    const lowKey = key.slice('interpolate'.length).toLowerCase();
    chromaticInterpLut[lowKey] = (d3Chromatic as any)[key];
  }
}

const chromaticSchemeLut: {[key: string]: string[] | string[][]} = {};
for (let key of Object.keys(d3Chromatic)) {
  if (key.indexOf('scheme') === 0) {
    const lowKey = key.slice('scheme'.length).toLowerCase();
    chromaticSchemeLut[lowKey] = (d3Chromatic as any)[key];
  }
}

function isFixedScheme(candidate: string[] | string[][]): candidate is string[] {
  return candidate.length < 4 || !Array.isArray(candidate[3]);
}


/**
 * A contiguous color map created from a named color map.
 */
class NamedSequentialColorMapBase extends SequentialScaleModel<string> {

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
export class NamedSequentialColorMap extends NamedSequentialColorMapBase {
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
export class NamedDivergingColorMap extends NamedSequentialColorMapBase {
  defaults(): any {
    return {...super.defaults(),
      name: 'BrBG',
      domain: [0, 0.5, 1],
    };
  }

  constructObject() {
    const interpolator = this.getInterpolatorFactory();
    return scaleDiverging(interpolator);
  }

  static model_name = 'NamedDivergingColorMap';
}


/**
 * A contiguous color map created from a named color map.
 */
export class NamedOrdinalColorMap extends OrdinalScaleModel {
  defaults(): any {
    const def = {...super.defaults(),
      name: 'Category10',
      cardinality: 10,
    };
    delete def.range;
    return def;
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.splice(
      this.simpleProperties.indexOf('range'), 1
    );
  }

  getScheme(): string[] {
    const name = this.get('name') as string;
    const scheme = chromaticSchemeLut[name.toLowerCase()];
    if (!scheme) {
      throw new Error(`Unknown scheme name: ${name}`);
    }
    if (isFixedScheme(scheme)) {
      return scheme;
    }
    const cardinality = this.get('cardinality') as number;
    return scheme[cardinality];
  }

  getSchemeName(): string | null {
    const scheme = this.obj.range() as string[];
    // Do a reverse lookup in d3Chromatic
    const lut = d3Chromatic as any;
    for (let key of Object.keys(lut)) {
      let candidate = lut[key];
      if (!candidate || !Array.isArray(candidate)) {
        continue;
      }
      if (!isFixedScheme(candidate)) {
        candidate = candidate[scheme.length];
        if (!candidate) {
          continue;
        }
      }
      if (arrayEquals(scheme, candidate)) {
        const name = key.replace(/^scheme/, '');
        return name;
      }
    }
    throw new Error(`Unknown color scheme name for range: ${scheme}`);
  }

  constructObject() {
    const scheme = this.getScheme();
    return scaleOrdinal(scheme);
  }

  /**
   * Sync the model properties to the d3 object.
   */
  syncToObject() {
    super.syncToObject();
    const scheme = this.getScheme();
    this.obj
      .range(scheme);
  }

  syncToModel(toSet: Backbone.ObjectHash) {
    toSet['name'] = this.getSchemeName();
    super.syncToModel(toSet);
  }

  isColorScale = true;

  static model_name = 'NamedOrdinalColorMap';
}


export interface ColorScale {
  copy(): this;
  domain(domain: number[]): this;
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
  let scale;

  let values = Array.from(new Array(n), (x,i) => i); // range(n)
  if (mapModel instanceof NamedDivergingColorMap) {
    scale = mapModel.obj.copy().domain([0, n/2, n]);
  } else if (mapModel instanceof OrdinalScaleModel) {
    scale = mapModel.obj;
    values = scale.domain();
  } else {
    scale = mapModel.obj.copy().domain([0, n - 1]);
  }
  for (let i of values) {
    const color = rgb(scale(i));
    data[i * 4 + 0] = color.r;
    data[i * 4 + 1] = color.g;
    data[i * 4 + 2] = color.b;
    data[i * 4 + 3] = 255 * color.opacity;
  }

  return data;
}
