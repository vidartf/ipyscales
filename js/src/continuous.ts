// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  InterpolatorFactory, scaleLinear, scaleLog, scalePow, ScaleLinear
} from 'd3-scale';

import * as d3Interpolate from 'd3-interpolate';

import {
  JUPYTER_EXTENSION_VERSION
} from './version';

import {
  ScaleModel
} from './scale';


/**
 * Find the name of the d3-interpolate function
 */
function interpolatorName(fun: Function) {
  for (let key of Object.keys(d3Interpolate)) {
    if ((d3Interpolate as any)[key] === fun) {
      return key;
    }
  }
  throw ReferenceError(`Cannot find name of interpolator ${fun}`);
}

/**
 * A widget model of a continuous scale
 */
export abstract class ContinuousScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: [0, 1],
      range: [0, 1],

      interpolator: 'interpolate',
      clamp: false,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'range',
      'clamp',
    );
  }

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  abstract constructObject(): any;

  /**
   * Sync the model properties to the d3 object.
   */
  syncToObject() {
    super.syncToObject();
    let interpolatorName = this.get('interpolator') || 'interpolate';
    let interpolator = (d3Interpolate as any)[interpolatorName] as InterpolatorFactory<number, number>;
    this.obj.interpolate(interpolator);
  }

  /**
   * Synt the d3 object properties to the model.
   */
  syncToModel(toSet: Backbone.ObjectHash) {
    let interpolator = this.obj.interpolate() as InterpolatorFactory<any, any>;
    toSet['interpolator'] = interpolatorName(interpolator);
    super.syncToModel(toSet);
  }

  static serializers = {
    ...ScaleModel.serializers,
  }
}


/**
 * A widget model of a linear scale
 */
export
class LinearScaleModel extends ContinuousScaleModel {

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  constructObject(): any {
    return scaleLinear();
  }

  obj: ScaleLinear<any, any>;

  static serializers = {
    ...ContinuousScaleModel.serializers,
  }

  static model_name = 'LinearScaleModel';
}


/**
 * A widget model of a linear scale
 */
export
class LogScaleModel extends ContinuousScaleModel {
  defaults() {
    return {...super.defaults(),
      base: 10,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'base',
    );
  }

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  constructObject(): any {
    return scaleLog();
  }

  static serializers = {
    ...ContinuousScaleModel.serializers,
  }

  static model_name = 'LogScaleModel';
}


/**
 * A widget model of a linear scale
 */
export
class PowScaleModel extends ContinuousScaleModel {
  defaults() {
    this.constructor
    return {...super.defaults(),
      exponent: 1,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'exponent',
    );
  }

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  constructObject(): any {
    return scalePow();
  }

  static serializers = {
    ...ContinuousScaleModel.serializers,
  }

  static model_name = 'PowScaleModel';
}
