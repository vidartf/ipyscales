// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  scaleLinear, InterpolatorFactory
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
 * A widget model of a linear scale
 */
export
class LinearScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      _model_name: LinearScaleModel.model_name,

      domain: [0, 1],
      range: [0, 1],

      interpolator: 'interpolate',
      clamp: false,
    };
  }

  /**
   * Create the wrapped d3-scale scaleLinear object
   */
  constructObject(): any {
    return scaleLinear();
  }

  /**
   * Sync the model properties to the d3 object.
   */
  syncToObject() {
    let interpolatorName = this.get('interpolator') || 'interpolate';
    let interpolator = (d3Interpolate as any)[interpolatorName] as InterpolatorFactory<number, number>;
    this.obj.domain(this.get('domain'))
      .range(this.get('range'))
      .interpolate(interpolator)
      .clamp(this.get('clamp'));
  }

  /**
   * Synt the d3 object properties to the model.
   */
  syncToModel(toSet: Backbone.ObjectHash) {
    toSet['domain'] = this.obj.domain();
    toSet['range'] = this.obj.range();
    toSet['clamp'] = this.obj.clamp();
    let interpolator = this.obj.interpolate() as InterpolatorFactory<number, number>;
    toSet['interpolator'] = interpolatorName(interpolator);
    super.syncToModel(toSet);
  }

  static serializers = {
      ...ScaleModel.serializers,
      // Add any extra serializers here
    }

  static model_name = 'LinearScaleModel';
}
