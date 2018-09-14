// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  scaleLog
} from 'd3-scale';

import {
  JUPYTER_EXTENSION_VERSION
} from './version';

import {
  ContinuousScaleModel
} from './continuous';



/**
 * A widget model of a linear scale
 */
export
class LogScaleModel extends ContinuousScaleModel {
  defaults() {
    return {...super.defaults(),
      _model_name: LogScaleModel.model_name,
    };
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
