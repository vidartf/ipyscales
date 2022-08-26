// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, unpack_models, IWidgetManager
} from '@jupyter-widgets/base';

import {
  ObjectHash
} from 'backbone';

import {
  ISerializers, listenToUnion
} from 'jupyter-dataserializers';

import {
  ScaleModel
} from './scale';

import {
  MODULE_NAME, MODULE_VERSION
} from './version';

import {
  undefSerializer
} from './utils';


// Override typing
declare module "@jupyter-widgets/base" {
  function unpack_models(value?: any, manager?: IWidgetManager): Promise<any>;
}


/**
 * Scaled value model.
 *
 * This model provides a scaled value, that is automatically recomputed when
 * either the input value or the scale changes.
 */
export class ScaledValueModel extends WidgetModel {
  defaults() {
    const ctor = this.constructor as any;
    return {...super.defaults(), ...{
      _model_name: ctor.model_name,
      _model_module: ctor.model_module,
      _model_module_version: ctor.model_module_version,
      _view_name: ctor.view_name,
      _view_module: ctor.view_module,
      _view_module_version: ctor.view_module_version,
      input: null,
      scale: null,
      output: null,
    }} as any;
  }

  /**
   * (Re-)compute the output.
   *
   * @returns {void}
   * @memberof ScaledArrayModel
   */
  computeScaledValue(options?: any): void {
    options = typeof options === 'object'
      ? {...options, setOutputOf: this}
      : {setOutput: true};
    let scale = this.get('scale') as ScaleModel | null;
    let input = this.get('input') as unknown;

    // If input is another ScaledValueModel, use its output as our input:
    if (input instanceof ScaledValueModel) {
      input = input.get('output') as unknown;
    }

    // Handle null case immediately:
    if (input === null || scale === null) {
      this.set('output', null, options);
      return;
    }
    this.set('output', scale.obj(input), options);
  }

  /**
   * Initialize the model
   *
   * @param {Backbone.ObjectHash} attributes
   * @param {{model_id: string; comm?: any; widget_manager: any; }} options
   * @memberof ScaledArrayModel
   */
  initialize(attributes: ObjectHash, options: {model_id: string; comm?: any; widget_manager: any; }): void {
    super.initialize(attributes, options);
    const scale = (this.get('scale') as ScaleModel | null) || undefined;
    // Await scale object for init:
    this.initPromise = Promise.resolve(scale && scale.initPromise).then(() => {
      this.computeScaledValue();
      this.setupListeners();
    });
  }

  /**
   * Sets up any relevant event listeners after the object has been initialized,
   * but before the initPromise is resolved.
   *
   * @memberof ScaledArrayModel
   */
  setupListeners(): void {
    // Listen to changes on scale model:
    this.listenTo(this.get('scale'), 'change', this.onChange);
    // make sure to (un)hook listeners when child points to new object
    this.on('change:scale', (model: this, value: ScaleModel, options: any) => {
      const prevModel = this.previous('scale') as ScaleModel;
      const currModel = value;
      if (prevModel) {
        this.stopListening(prevModel);
      }
      if (currModel) {
        this.listenTo(currModel, 'change', this.onChange.bind(this));
      }
      this.onChange(this);
    }, this);

    // Listen to changes on input union:
    listenToUnion(this, 'input', this.onChange.bind(this), true);
  }

  /**
   * Callback for when the source input changes.
   *
   * @param {WidgetModel} model
   * @memberof ScaledArrayModel
   */
  protected onChange(model: WidgetModel, options?: any): void {
    if (!options || options.setOutputOf !== this) {
      this.computeScaledValue(options);
    }
  }

  /**
   * A promise that resolves once the model has finished its initialization.
   *
   * @type {Promise<void>}
   * @memberof ScaledArrayModel
   */
  initPromise: Promise<void>;

  static serializers: ISerializers = {
      input: { deserialize: unpack_models },
      scale: { deserialize: unpack_models },
      output: { serialize: undefSerializer },
    };

  static model_name = 'ScaledValueModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = null;
  static view_module = null;
  static view_module_version = MODULE_VERSION;
}
