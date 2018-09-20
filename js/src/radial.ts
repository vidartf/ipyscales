// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { radialScale, RadialScale } from './custom-scales';

import { ContinuousScaleModel } from "./continuous";


/**
 * A widget model of a radial scale
 */
export class RadialScaleModel extends ContinuousScaleModel {

  defaults() {
    return {...super.defaults(),
      unit: 'deg',
      _base: null,
    }
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'unit',
    );
  }

  /**
   * Create the wrapped radialScale object
   */
  constructObject(): any {
    return radialScale(this.get('_base'));
  }

  obj: RadialScale;

  static serializers = {
    ...ContinuousScaleModel.serializers,
  }

  static model_name = 'RadialScaleModel';
}
