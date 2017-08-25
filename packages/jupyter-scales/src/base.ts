// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  JUPYTER_EXTENSION_VERSION
} from './version';



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
abstract class BaseModel extends WidgetModel {

  /**
   * Returns default values for the model attributes.
   */
  defaults() {
    return {...super.defaults(),
      _model_name: BaseModel.model_name,
      _model_module: BaseModel.model_module,
      _model_module_version: BaseModel.model_module_version,
      _view_name: BaseModel.view_name as any,
      _view_module: BaseModel.view_module as any,
      _view_module_version: BaseModel.view_module_version,
    };
  }

  /**
   * Backbone initialize function.
   */
  initialize(attributes: Backbone.ObjectHash, options: IInitializeOptions) {
    super.initialize(attributes, options);

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

  /**
   * Update the model attributes from the objects properties.
   *
   * The base method calls `this.set(toSet, 'pushFromObject');`
   * if `toSet` is given. Overriding methods should add its
   * properties to the hash before calling the super method.
   */
  syncToModel(toSet: Backbone.ObjectHash): void {
    if (toSet) {
      // Apply all direct changes at once
      this.set(toSet, 'pushFromObject');
    }
  }

  /**
   * Update the model attributes from the objects properties.
   */
  abstract syncToObject(): void;

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
   * and the widget manager.
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
      this.on('change', this.onChange, this);
      this.on('msg:custom', this.onCustomMessage, this);
  }

  onChange(model: Backbone.Model, options: any) {
    if (options !== 'pushFromObject') {
        this.syncToObject();
    }
  }

  onCustomMessage(content: any, buffers: any) {
  }

  static serializers: ISerializerMap = WidgetModel.serializers;

  static model_name: string;    // Base model should not be instantiated directly
  static model_module = 'jupyter-threeplot';
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
}
