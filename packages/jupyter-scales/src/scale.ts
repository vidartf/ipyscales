// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  BaseModel, ISerializerMap
 } from "./base";

import {
  JUPYTER_EXTENSION_VERSION
} from './version';


/**
 * Base model for scales
 */
export
abstract class ScaleModel extends BaseModel {
  static serializers: ISerializerMap = BaseModel.serializers;
}
