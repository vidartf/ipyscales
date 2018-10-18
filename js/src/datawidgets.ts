// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, unpack_models
} from '@jupyter-widgets/base';

import {
  ObjectHash
} from 'backbone';

import {
  data_union_serialization, listenToUnion,
  TypedArray, typesToArray, TypedArrayConstructor,
  ISerializers, getArray, IDataWriteBack, setArray
} from 'jupyter-dataserializers';

import {
  NDArrayBaseModel
} from 'jupyter-datawidgets/lib/ndarray';

import {
  LinearScaleModel
} from './continuous';


import ndarray = require('ndarray');


/**
 * Serializer that prevents syncing to kernel
 */
function undefSerializer(obj: any, widget?: WidgetModel): undefined {
  return undefined;
}


/**
 * Utility to create a copy of an ndarray
 *
 * @param {ndarray.NDArray} array
 * @returns {ndarray.NDArray}
 */
export function copyArray(array: ndarray, dtype?: ndarray.DataType): ndarray {
  if (dtype === undefined) {
    return ndarray((array.data as TypedArray).slice(),
                   array.shape,
                   array.stride,
                   array.offset);
  }
  let ctor: TypedArrayConstructor;
  if (dtype === 'buffer' || dtype === 'generic' || dtype === 'array') {
    throw new Error(`Cannot copy ndarray of dtype "${dtype}".`);
  }
  return ndarray(new typesToArray[dtype](array.data as TypedArray),
                 array.shape,
                 array.stride,
                 array.offset)
}


/**
 * Whether two ndarrays differ in shape.
 */
function arrayShapesDiffer(a: ndarray | null, b: ndarray | null) {
  if (a === null && b === null) {
    return false;
  }
  return a === null || b === null ||
    JSON.stringify(a.shape) !== JSON.stringify(b.shape) ||
    a.dtype !== b.dtype;
}


/**
 * Scaled array model.
 *
 * This model provides a scaled version of an array, that is
 * automatically recomputed when either the array or the scale
 * changes.
 *
 * It triggers an event 'change:scaledData' when the array is
 * recomputed. Note: 'scaledData' is a direct propetry, not a
 * model attribute. The event triggers with an argument
 * { resized: boolean}, which indicates whether the array changed
 * size. Note: When the 'resized' flag is false, the old array will
 * have been reused, otherwise a new array is allocated.
 *
 * @export
 * @class ScaledArrayModel
 * @extends {DataModel}
 */
export class ScaledArrayModel extends NDArrayBaseModel implements IDataWriteBack {
  defaults() {
    return {...super.defaults(), ...{
      array: ndarray([]),
      scale: null,
      _model_name: ScaledArrayModel.model_name,
      scaledData: null,
    }} as any;
  }

  /**
   * (Re-)compute the scaledData data.
   *
   * @returns {void}
   * @memberof ScaledArrayModel
   */
  computeScaledData(options?: any): void {
    let array = getArray(this.get('array'));
    let scale = this.get('scale') as LinearScaleModel | null;
    // Handle null case immediately:
    if (array === null || scale === null) {
      this.set('scaledData', null, 'setScaled');
      return;
    }
    let resized = this.arrayMismatch();
    let scaledData = this.get('scaledData') as ndarray;
    if (resized) {
      // Allocate new array
      scaledData = copyArray(array, this.scaledDtype());
    } else {
      // Reuse data, but wrap in new ndarray object to trigger change
      const version = (scaledData as any)._version + 1 || 0;
      scaledData = ndarray(
        scaledData.data,
        scaledData.shape,
        scaledData.stride,
        scaledData.offset
      );
      // Tag on a version# to differntiate it:
      (scaledData as any)._version = version;
    }
    let data = array.data as TypedArray;
    let target = scaledData!.data as TypedArray;

    // Set values:
    for (let i = 0; i < data.length; ++i) {
      target[i] = scale.obj(data[i])
    }

    this.set('scaledData', scaledData, 'setScaled');
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
    const scale = (this.get('scale') as LinearScaleModel | null) || undefined;
    // Await scale object for init:
    this.initPromise = Promise.resolve(scale && scale.initPromise).then(() => {
      this.computeScaledData();
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
    // Listen to direct changes on our model:
    this.on('change:scale', this.onChange, this);

    // Listen to changes within array and scale models:
    listenToUnion(this, 'array', this.onChange.bind(this), true);
    this.listenTo(this.get('scale'), 'change', this.onChange);
  }

  getNDArray(key='scaledData'): ndarray | null {
    if (key === 'scaledData') {
      if (this.get('scaledData') === null) {
        this.computeScaledData();
      }
      return this.get('scaledData');
    } else {
      return super.getNDArray(key);
    }
  }

  canWriteBack(key='scaledData'): boolean {
    if (key === 'array') {
      return true;
    }
    if (key !== 'scaledData') {
      return false;
    }
    const scale = this.get('scale') as LinearScaleModel | null;
    return !!scale && typeof scale.obj.invert === 'function';
  }

  setNDArray(array: ndarray | null, key='scaledData', options?: any): void {
    if (key === 'scaledData') {
      // Writing back, we need to feed the data through scale.invert()

      const current = getArray(this.get('array'));
      const scale = this.get('scale') as LinearScaleModel | null;
      // Handle null case immediately:
      if (array === null || scale === null) {
        setArray(this, 'array', null, options);
        return;
      }
      // Allocate new array
      const newArray = copyArray(array, this.scaledDtype());

      let data = array.data as TypedArray;
      let target = newArray.data as TypedArray;

      // Set values:
      for (let i = 0; i < data.length; ++i) {
        target[i] = scale.obj.invert(data[i])
      }

      setArray(this, 'array', newArray, options);

    } else {
      setArray(this, key, array, options);
    }
  }

  /**
   * Callback for when the source data changes.
   *
   * @param {WidgetModel} model
   * @memberof ScaledArrayModel
   */
  protected onChange(model: WidgetModel, options?: any): void {
    if (options !== 'setScaled') {
      this.computeScaledData(options);
    }
  }

  /**
   * Whether the array and scaledData have a mismatch in shape or type.
   *
   * @protected
   * @returns {boolean}
   * @memberof ScaledArrayModel
   */
  protected arrayMismatch(): boolean {
    let array = getArray(this.get('array'));
    return arrayShapesDiffer(array, this.get('scaledData'));
  }

  protected scaledDtype(): ndarray.DataType | undefined {
    let array = getArray(this.get('array'));
    if (array === null) {
      return undefined;
    }
    return array.dtype;
  }

  /**
   * A promise that resolves once the model has finished its initialization.
   *
   * @type {Promise<void>}
   * @memberof ScaledArrayModel
   */
  initPromise: Promise<void>;

  static serializers: ISerializers = {
      ...NDArrayBaseModel.serializers,
      array: data_union_serialization,
      scale: { deserialize: unpack_models },
      scaledData: {serialize: undefSerializer},
    };

  static model_name = 'ScaledArrayModel';
}
