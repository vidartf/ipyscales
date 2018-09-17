// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, unpack_models
} from '@jupyter-widgets/base';

import {
  rgb
} from 'd3-color';

import {
  scaleSequential
} from 'd3-scale';

import * as d3Interpolate from 'd3-interpolate';

import {
  TypedArray
} from 'jupyter-dataserializers';

import {
  LinearScaleModel, LogScaleModel
} from '../continuous';

import { SequentialScaleModel } from '../scale';

import { capitalize, unCapitalize } from '../util';

import {
  JUPYTER_EXTENSION_VERSION
} from '../version';


/**
 * Contiguous color map.
 */
export class LinearColorScaleModel extends LinearScaleModel {
  defaults(): any {
    return {...super.defaults(),
      range: ['black', 'white'],
    };
  }

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

  static model_name = 'LogColorScaleModel';
}


export type ColorInterpolator = (t: number) => string;

/**
 * A contiguous color map created from a named color map.
 */
class NamedColorMapBase extends SequentialScaleModel<string> {

  getInterpolatorFactory(): ColorInterpolator {
    let name = this.get('name') as string || 'viridis';
    name = `interpolate${capitalize(name)}`
    return (d3Interpolate as any)[name];
  }

  getInterpolatorFactoryName(): string | null {
    const interp = this.obj.interpolator();
    // Do a reverse lookup un d3Interpolate
    const lut = d3Interpolate as any;
    for (let key of Object.keys(lut)) {
      if (interp === lut[key]) {
        const name = key.replace(/^interpolate/, '');
        return unCapitalize(name);
      }
    }
    throw new Error(`Unknown color interpolator name: ${interp}`);
  }

  constructObject() {
    const interpolator = this.getInterpolatorFactory();
    this.obj = scaleSequential(interpolator);
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
}

/**
 * A contiguous color map created from a named color map.
 */
export class NamedSequentialColorMap extends NamedColorMapBase {
  defaults(): any {
    return {...super.defaults(),
      name: 'viridis'
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
  domain(value: number[]): this;
  (value: number | { valueOf(): number }): string;
}

export interface ColorMapModel {
  obj: ColorScale;
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
