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
  DataModel
} from 'jupyter-datawidgets/lib/base';

import {
  isColorMapModel
} from './colormap';

import {
  LinearScaleModel
} from './continuous';

import {
  version, moduleName
} from './version';


import ndarray = require('ndarray');


/**
 * Serializer that prevents syncing to kernel
 */
function undefSerializer(obj: any, widget?: WidgetModel): undefined {
  return undefined;
}


/**
 * Create new ndarray, with default attributes taken from another
 *
 * @param {ndarray.NDArray} array
 * @returns {ndarray.NDArray}
 */
export function arrayFrom(
  array: ndarray,
  dtype?: ndarray.DataType | null,
  shape?: number[] | null
): ndarray {

  dtype = dtype || array.dtype;
  shape = shape || array.shape;
  if (dtype === 'buffer' || dtype === 'generic' || dtype === 'array') {
    throw new Error(`Cannot create ndarray of dtype "${dtype}".`);
  }
  return ndarray(
    new typesToArray[dtype](shape.reduce((ac, v) => {
      ac *= v;
      return ac;
    }, 1)),
    shape,
    array.stride,
    array.offset,
  );
}


/**
 * Whether two ndarrays differ in shape.
 */
function shapesDiffer(a: number[] | null, b: number[] | null) {
  if (a === null && b === null) {
    return false;
  }
  return a === null || b === null ||
    JSON.stringify(a) !== JSON.stringify(b);
}


function parseCssColor(color: string): [number, number, number, number] {
  let m = color.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    return [
      parseInt(m[1].substr(0, 2), 16),
      parseInt(m[1].substr(2, 2), 16),
      parseInt(m[1].substr(4, 2), 16),
      255
    ];
  }
  m = color.match(/^rgb\((\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d+)\s*)\)$/i);
  if (m) {
    return [
      parseInt(m[2], 10),
      parseInt(m[4], 10),
      parseInt(m[6], 10),
      255
    ];
  }
  m = color.match(/^rgba\((\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d+)\s*),(\s*(\d|\d*\.\d+)\s*)\)$/i);
  if (m) {
    return [
      parseInt(m[2], 10),
      parseInt(m[4], 10),
      parseInt(m[6], 10),
      255 * parseFloat(m[8]),
    ];
  }
  throw new Error(`Invalid CSS color: "${color}"`);
}


/**
 * Scaled array model.
 *
 * This model provides a scaled version of an array, that is
 * automatically recomputed when either the array or the scale
 * changes.
 *
 * @export
 * @class ScaledArrayModel
 * @extends {DataModel}
 */
export class ScaledArrayModel extends DataModel implements IDataWriteBack {
  defaults() {
    return {...super.defaults(), ...{
      data: ndarray([]),
      scale: null,
      scaledData: null,
      output_dtype: 'inherit',
    }} as any;
  }

  /**
   * (Re-)compute the scaledData data.
   *
   * @returns {void}
   * @memberof ScaledArrayModel
   */
  computeScaledData(options?: any): void {
    options = typeof options === 'object'
      ? {...options, setScaled: true}
      : {setScaled: true};
    let array = getArray(this.get('data'));
    let scale = this.get('scale') as LinearScaleModel | null;
    // Handle null case immediately:
    if (array === null || scale === null) {
      this.set('scaledData', null, options);
      return;
    }
    let resized = this.arrayMismatch();
    let scaledData = this.get('scaledData') as ndarray;
    if (resized) {
      // Allocate new array
      scaledData = arrayFrom(array, this.scaledDtype(), this.scaledShape());
    } else {
      // Reuse data, but wrap in new ndarray object to trigger change
      const version = scaledData
        ? (scaledData as any)._version + 1 || 0
        : 0;
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
    if (isColorMapModel(scale)) {
      for (let i = 0; i < data.length; ++i) {
        const c = parseCssColor(scale!.obj(data[i]))
        target[i*4+0] = c[0];
        target[i*4+1] = c[1];
        target[i*4+2] = c[2];
        target[i*4+3] = c[3];
      }
    } else {
      for (let i = 0; i < data.length; ++i) {
        target[i] = scale.obj(data[i]);
      }
    }

    this.set('scaledData', scaledData, options);
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
    listenToUnion(this, 'data', this.onChange.bind(this), true);
    this.listenTo(this.get('scale'), 'change', this.onChange);
  }

  getNDArray(key='scaledData'): ndarray | null {
    if (key === 'scaledData') {
      if (this.get('scaledData') === null) {
        this.computeScaledData();
      }
      return this.get('scaledData');
    } else {
      return this.get(key);
    }
  }

  canWriteBack(key='scaledData'): boolean {
    if (key === 'data') {
      return true;
    }
    if (key !== 'scaledData') {
      return false;
    }
    const current = getArray(this.get('data'))
    const scale = this.get('scale') as LinearScaleModel | null;
    if (isColorMapModel(scale) && current === null) {
      return false;
    }
    return !!scale && typeof scale.obj.invert === 'function';
  }

  setNDArray(array: ndarray | null, key='scaledData', options?: any): void {
    if (key === 'scaledData') {
      // Writing back, we need to feed the data through scale.invert()

      const current = getArray(this.get('data'));
      const scale = this.get('scale') as LinearScaleModel | null;
      // Handle null case immediately:
      if (array === null || scale === null) {
        setArray(this, 'data', null, options);
        return;
      }
      // Allocate new array
      const dtype = current ? current.dtype : array.dtype;
      // Special case colors, as we allow them to transform the shape
      const shape = isColorMapModel(scale)
        ? array.shape.slice(0, array.shape.length-1)
        : array.shape;
      const newArray = arrayFrom(array, dtype, shape);

      let data = array.data as TypedArray;
      let target = newArray.data as TypedArray;

      // Set values:
      for (let i = 0; i < data.length; ++i) {
        target[i] = scale.obj.invert(data[i])
      }

      setArray(this, 'data', newArray, options);

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
    if (!options || options.setScaled !== true) {
      this.computeScaledData(options);
    }
  }

  /**
   * Whether scaledData has the incorrect shape or type.
   *
   * @protected
   * @returns {boolean}
   * @memberof ScaledArrayModel
   */
  protected arrayMismatch(): boolean {
    const current = this.get('scaledData') as ndarray | null;
    if (current && current.dtype !== this.scaledDtype()) {
      return true;
    }
    return shapesDiffer(current && current.shape, this.scaledShape());
  }

  /**
   * Get what the dtype of the scaled data *should* be
   */
  protected scaledDtype(): ndarray.DataType | null {
    let output_dtype = this.get('output_dtype') as ndarray.DataType | 'inherit';
    if (output_dtype !== 'inherit') {
      return output_dtype;
    }
    let array = getArray(this.get('data'));
    if (array === null) {
      return null;
    }
    return array.dtype;
  }

  /**
   * Get what the shape of the scaled data *should* be
   */
  protected scaledShape(): number[] | null {
    const scale = this.get('scale');
    const array = getArray(this.get('data'));
    // Special case colors, as we allow them to transform the shape
    if (isColorMapModel(scale)) {
      return array && array.shape.concat(4);
    }
    return array && array.shape;
  }

  /**
   * A promise that resolves once the model has finished its initialization.
   *
   * @type {Promise<void>}
   * @memberof ScaledArrayModel
   */
  initPromise: Promise<void>;

  static serializers: ISerializers = {
      ...DataModel.serializers,
      data: data_union_serialization,
      scale: { deserialize: unpack_models },
      scaledData: {serialize: undefSerializer},
    };

  static model_name = 'ScaledArrayModel';
  static model_module = moduleName;
  static model_module_version = version;
}
