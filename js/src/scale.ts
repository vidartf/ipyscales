// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  ScaleSequential, ScaleQuantize, scaleQuantize, ScaleQuantile, scaleQuantile,
  ScaleOrdinal, scaleOrdinal, scaleImplicit
} from 'd3-scale';

import {
  listenToUnion,
} from 'jupyter-dataserializers';

import {
  JUPYTER_EXTENSION_VERSION, MODULE_NAME
} from './version';

import ndarray = require('ndarray');



export
interface ISerializerMap {
  [key: string]: {
    deserialize?: (value?: any, manager?: ManagerBase<any>) => any;
    serialize?: (value?: any, widget?: WidgetModel) => any;
  };
}

export
interface IInitializeOptions {
  model_id: string;
  comm?: any;
  widget_manager: ManagerBase<any>;
}


/**
 * Base model for scales
 */
export
abstract class ScaleModel extends WidgetModel {

  /**
   * Returns default values for the model attributes.
   */
  defaults() {
    const ctor = this.constructor as any;
    return {...super.defaults(),
      _model_name: ctor.model_name,
      _model_module: ctor.model_module,
      _model_module_version: ctor.model_module_version,
      _view_name: ctor.view_name,
      _view_module: ctor.view_module,
      _view_module_version: ctor.view_module_version,
    };
  }

  /**
   * Backbone initialize function.
   */
  initialize(attributes: Backbone.ObjectHash, options: IInitializeOptions) {
    super.initialize(attributes, options);
    this.createPropertiesArrays();

    // Instantiate scale object
    this.initPromise = this.createObject().then(() => {

      // sync the properties from the server to the model
      this.syncToObject();

      // sync any properties that might have mutated back
      this.syncToModel({});

      // setup msg, model, and children change listeners
      this.setupListeners();

    });
  }

  createPropertiesArrays() {
    this.datawidgetProperties = [];
    this.childModelProperties = [];
    this.simpleProperties = [];
  }

  /**
   * Update the model attributes from the objects properties.
   *
   * The base method calls `this.set(toSet, 'pushFromObject');`.
   * Overriding methods should add any properties not in
   * simpleProperties to the hash before calling the super
   * method.
   */
  syncToModel(toSet: Backbone.ObjectHash): void {
    for (let name of this.simpleProperties) {
      toSet[name] = this.get(name);
    }
    // Apply all direct changes at once
    this.set(toSet, 'pushFromObject');
  }

  /**
   * Update the model attributes from the objects properties.
   */
  syncToObject(): void {
    // Sync the simple properties:
    for (let name of this.simpleProperties) {
      this.obj[name](this.get(name));
    }
  };

  /**
   * Create or return the underlying object this model represents.
   */
  protected createObject(): Promise<any> {
    // call constructor method overridden by every class
    let objPromise = Promise.resolve(this.constructObject());


    return objPromise.then(this.processNewObj.bind(this));

  }

  /**
   * Construct and return the underlying object this model represents.
   *
   * Override this in inherting classes.
   */
  protected abstract constructObject(): any | Promise<any>;

  /**
   * Process a new underlying object to represent this model.
   *
   * The base implementation sets up mapping between the model,
   * the cache, and the widget manager.
   */
  protected processNewObj(obj: any): any | Promise<any> {
      obj.ipymodelId = this.model_id; // brand that sucker
      obj.ipymodel = this;

      this.obj = obj;
      return obj;
  }

  /**
   * Set up any event listeners.
   *
   * Called after object initialization is complete.
   */
  setupListeners() {
    // Handle changes in child model instance props
    for (let propName of this.childModelProperties) {
      // register listener for current child value
      var curValue = this.get(propName) as ScaleModel;
      if (curValue) {
        this.listenTo(curValue, 'change', this.onChildChanged.bind(this));
        this.listenTo(curValue, 'childchange', this.onChildChanged.bind(this));
      }

      // make sure to (un)hook listeners when child points to new object
      this.on('change:' + propName, (model: ScaleModel, value: ScaleModel, options: any) => {
        const prevModel = this.previous(propName) as ScaleModel;
        const currModel = value;
        if (prevModel) {
          this.stopListening(prevModel);
        }
        if (currModel) {
          this.listenTo(currModel, 'change', this.onChildChanged.bind(this));
          this.listenTo(currModel, 'childchange', this.onChildChanged.bind(this));
        }
      }, this);
    };

    // Handle changes in data widgets/union properties
    for (let propName of this.datawidgetProperties) {
      listenToUnion(this, propName, this.onChildChanged.bind(this), false);
    };
    this.on('change', this.onChange, this);
    this.on('msg:custom', this.onCustomMessage, this);
  }

  onChange(model: Backbone.Model, options: any) {
    if (options !== 'pushFromObject') {
      this.syncToObject();
    }
  }

  onChildChanged(model: WidgetModel, options: any) {
    // Propagate up hierarchy:
    this.trigger('childchange', this);
  }

  onCustomMessage(content: any, buffers: any) {
  }

  static serializers: ISerializerMap = WidgetModel.serializers;

  static model_name: string;    // Base model should not be instantiated directly
  static model_module = MODULE_NAME;
  static model_module_version = JUPYTER_EXTENSION_VERSION;
  static view_name = null;
  static view_module = null;
  static view_module_version = JUPYTER_EXTENSION_VERSION;

  /**
   * The underlying object this model represents.
   */
  obj: any;

  /**
   * Promise that resolves when initialization is complete.
   */
  initPromise: Promise<void>;

  datawidgetProperties: string[];
  childModelProperties: string[];
  simpleProperties: string[];
}


/**
 * A widget model of a linear scale
 */
export abstract class SequentialScaleModel<Output> extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: [0, 1],
      clamp: false,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'clamp',
    );
  }

  obj: ScaleSequential<Output>;

  static serializers = {
    ...ScaleModel.serializers,
  }
}


/**
 * A widget model of a linear scale
 */
export class QuantizeScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: [0, 1],
      range: [0, 1],
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'range',
    );
  }

  constructObject() {
    this.obj = scaleQuantize<any>();
  }

  obj: ScaleQuantize<any>;

  static serializers = {
    ...ScaleModel.serializers,
  }

  static model_name = 'QuantizeScaleModel';
}


/**
 * A widget model of a linear scale
 */
export class QuantileScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: [0],
      range: [0],
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'range',
    );
  }

  constructObject() {
    this.obj = scaleQuantile<any>();
  }

  obj: ScaleQuantile<any>;

  static serializers = {
    ...ScaleModel.serializers,
  }

  static model_name = 'QuantileScaleModel';
}


/**
 * A widget model of a linear scale
 */
export class TresholdScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: [],
      range: [0],
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'range',
    );
  }

  constructObject() {
    this.obj = scaleQuantile<any>();
  }

  obj: ScaleQuantile<any>;

  static serializers = {
    ...ScaleModel.serializers,
  }

  static model_name = 'TresholdScaleModel';
}



/**
 * A widget model of a linear scale
 */
export class OrdinalScaleModel extends ScaleModel {
  defaults() {
    return {...super.defaults(),
      domain: null,
      range: [],
      unknown: undefined,
    };
  }

  createPropertiesArrays() {
    super.createPropertiesArrays();
    this.simpleProperties.push(
      'domain',
      'range',
    );
  }

  constructObject() {
    this.obj = scaleOrdinal();
  }

  syncToObject() {
    super.syncToObject();
    let unknown = this.get('unknown');
    if (unknown === undefined) {
      unknown = scaleImplicit;
    }
    this.obj.unknown(unknown);
  }

  syncToModel(toSet: Backbone.ObjectHash) {
    let unknown = this.obj.unknown();
    if (unknown === scaleImplicit) {
      unknown = undefined;
    }
    toSet['unknown'] = unknown;
    super.syncToModel(toSet);
  }

  obj: ScaleOrdinal<any, any>;

  static serializers = {
    ...ScaleModel.serializers,
  }

  static model_name = 'OrdinalScaleModel';
}
