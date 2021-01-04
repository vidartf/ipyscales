// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid, WidgetModel
} from '@jupyter-widgets/base';

import {
  JSONToArray, getArray
} from 'jupyter-dataserializers';

import {
  LinearScaleModel
} from '../../src/continuous';

import {
  LinearColorScaleModel
} from '../../src/colormap';

import {
  arrayFrom, ScaledArrayModel
} from '../../src/datawidgets';

import {
  DummyManager, createTestModel
} from './helpers.spec';

import ndarray = require('ndarray');


class TestModel extends ScaledArrayModel {
  public arrayMismatch() {
    return super.arrayMismatch();
  }

  public scaledDtype() {
    return super.scaledDtype();
  }
}


async function createWidgetModel(): Promise<ScaledArrayModel> {
  let widget_manager = new DummyManager();

  let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
  let view = new DataView(raw_data.buffer);
  let scale = createTestModel(LinearScaleModel, {
      domain: [0, 10],
      range: [-10, -5],
    }, widget_manager);
  widget_manager.register_model(scale.model_id, Promise.resolve(scale));

  let attributes = {
    scale,
    data: JSONToArray({
      buffer: view,
      shape: [2, 3],
      dtype: 'float32',
    }, widget_manager)
  };
  const model = createTestModel(ScaledArrayModel, attributes, widget_manager);
  widget_manager.register_model(model.model_id, Promise.resolve(model));
  await model.initPromise;
  return model;
}

describe('ScaledArrayModel', () => {

  it('should be creatable', async () => {
    let widget_manager = new DummyManager();
    let modelOptions = {
      widget_manager: widget_manager,
      model_id: uuid(),
    }
    let serializedState = {};
    let model = new ScaledArrayModel(serializedState, modelOptions as any);
    await model.initPromise;

    expect(model).to.be.an(ScaledArrayModel);
    expect(model.get('scaledData')).to.be(null);
  });

  it('should not include scaledData in serialization', async () => {
    const model = await createWidgetModel();
    const state = await model.widget_manager.get_state();
    const models = Object.keys(state.state).map(k => state.state[k].state);
    expect(models.length).to.be(2);
    expect(models[1]._model_name).to.be('ScaledArrayModel');
    expect(models[1].scaledData).to.be(undefined);
  });

  it('should compute scaled data when initialized with scale and data', async () => {
    let model = await createWidgetModel();
    expect(model).to.be.an(ScaledArrayModel);
    expect(model.get('scaledData')!.data).to.eql(new Float32Array([
      -9.5, -9, -8.5, -8, -7.5, -5
    ]));
  });

  it('should trigger change when setting scale to null', async () => {
    let model = await createWidgetModel();

    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('scale', null);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(model.get('scaledData')).to.be(null);
  });

  it('should trigger change when changing from null', async () => {
    let model = await createWidgetModel();

    let array = model.get('data') as ndarray;
    model.set('data', null);
    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('data', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(model.get('scaledData')!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -5]));

  });

  it('should trigger change when changing dtype', async () => {
    let model = await createWidgetModel();

    let array = ndarray(new Float64Array([1, 2, 3, 4, 5, 10]));
    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('data', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(model.get('scaledData')!.data).to.be.a(Float64Array);
    expect(model.get('scaledData')!.data).to.eql(new Float64Array([-9.5, -9, -8.5, -8, -7.5, -5]));

  });

  it('should not trigger change when still incomplete', async () => {
    let model = await createWidgetModel();

    let array = model.get('data') as ndarray;
    model.set({data: null, scale: null});
    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('data', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(false);

  });

  it('should write in-place when only content changed', async () => {
    let model = await createWidgetModel();

    let array = model.get('data') as ndarray;
    array = arrayFrom(array);
    (array.data as Float32Array).set([1, 2, 3, 4, 5, 0]);
    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('data', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(model.get('scaledData')!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -10]));

  });

  it('should map to rgba for color scale', async () => {
    let model = await createWidgetModel();

    let scale = createTestModel(LinearColorScaleModel, {
      domain: [0, 10],
      range: ['red', 'blue'],
    }, model.widget_manager as DummyManager);
    await scale.initPromise;
    model.set({
      scale,
    });

    // RGBA values from red to blue:
    expect(model.get('scaledData')!.data).to.eql(
      new Float32Array([
        230, 0, 26, 255,
        204, 0, 51, 255,
        179, 0, 77, 255,
        153, 0, 102, 255,
        128, 0, 128, 255,
        0,   0, 255, 255
      ])
    );

  });

  describe('arrayMismatch', () => {

    it('should be false when both are null', async () => {
      let model = createTestModel(TestModel, {
        data: null,
        scale: null,
      });
      await model.initPromise;

      expect(model.arrayMismatch()).to.be(false);
    });

    it('should be false when all match', async () => {
      let scale = createTestModel(LinearScaleModel, {
        domain: [0, 10],
        range: [-10, -5],
      });
      let model = createTestModel(TestModel, {
        data: ndarray(new Float32Array([1, 2, 3, 4, 5, 10])),
        scale: scale,
      });
      await model.initPromise;

      expect(model.arrayMismatch()).to.be(false);
    });

  });

  describe('scaledDtype', () => {

    it('should be null when array is null', async () => {
      let model = createTestModel(TestModel, {
        data: null,
        scale: null,
      });
      await model.initPromise;

      expect(model.scaledDtype()).to.be(null);
    });

  });

  describe('getNDArray', async () => {

    const model = await createWidgetModel();

    it('should return the scaled array', () => {
      expect(model.getNDArray()).to.be(model.get('scaledData'));
      expect(model.getNDArray('scaledData')).to.be(model.get('scaledData'));
    });

    it('should be able to retrieve the source array', () => {
      expect(model.getNDArray('data')).to.be(model.get('data'));
    });

    it('should fail for an incorrcet key', () => {
      expect(model.getNDArray).withArgs('invalid_key').to.throwError();
    });

    it('should recalculate data if invalidated', () => {
      model.set('scaledData', null);
      let result = model.getNDArray();
      expect(result).to.be(model.get('scaledData'));
      expect(result).to.not.be(null);
    });

    it('should work when called via getArray', async () => {
      let model = await createWidgetModel();
      let output = getArray(model)!;
      let inputArray = model.get('data');
      expect(output.shape).to.eql(inputArray.shape);
      expect(output.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -5]));
    });

  });

  describe('IDataWriteBack', () => {

    describe('canWriteBack', () => {

      let model: ScaledArrayModel;

      beforeEach(async () => {
        model = await createWidgetModel();
      });

      afterEach(() => {
        model.close();
      });

      it('should return true for key "array"', () => {
        expect(model.canWriteBack('data')).to.be(true);
      });

      it('should return false for "scaledData" if scale is null', () => {
        model.set('scale', null);
        expect(model.canWriteBack()).to.be(false);
      });

      it('should return false for "scaledData" if scale does not have invert', () => {
        const scale = model.get('scale');
        scale.obj.invert = undefined;
        expect(model.canWriteBack()).to.be(false);
      });

      it('should return true for "scaledData" if scale has invert', () => {
        expect(model.canWriteBack()).to.be(true);
      });

      it('should return false for other keys', () => {
        expect(model.canWriteBack('foo')).to.be(false);
      });

      it('should return false when scale is color scale', () => {
        let scale = createTestModel(LinearColorScaleModel, {
          domain: [0, 10],
          range: ['red', 'blue'],
        }, model.widget_manager as DummyManager);
        model.set({
          scale,
          data: null
        });
        expect(model.canWriteBack()).to.be(false);
      });

    });

    describe('setNDArray', () => {

      let model: ScaledArrayModel;

      beforeEach(async () => {
        model = await createWidgetModel();
      });

      afterEach(() => {
        model.close();
      });

      it('should set the array on the model for key "array"', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.setNDArray(array, 'data');
        expect(model.getNDArray('data')).to.be(array);
        // Should also recompute scaledData when setting array:
        const scaled = model.getNDArray('scaledData')!;
        expect(scaled.data).to.eql(new Float32Array([-6, -7, -8]));
      });

      it('should set both to null with null input and default key', () => {
        model.setNDArray(null);
        expect(model.getNDArray('data')).to.be(null);
        expect(model.getNDArray()).to.be(null);
      });

      it('should set both to null if scale is null with default key', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.set('scale', null);
        model.setNDArray(array);
        expect(model.getNDArray('data')).to.be(null);
        expect(model.getNDArray()).to.be(null);
      });

      it('should set both arrays as expected', () => {
        const array = ndarray(new Float32Array([-6, -7, -8]));
        model.setNDArray(array);
        expect(model.getNDArray('data')!.data).to.eql(new Float32Array([8, 6, 4]));
        expect(model.getNDArray()!.data).to.eql(array.data);
      });

      it('should set the array on the model for other keys', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.setNDArray(array, 'foobar');
        expect(model.getNDArray('foobar')).to.be(array);
      });

      it('should pass the options to change event', () => {
        let condA = false;
        let condB = false;
        model.once('change:data', (model: WidgetModel, value: ndarray | null, options?: any) => {
          if (options.foo === 'bar') {
            condA = true;
          } else {
            throw new Error(`options.foo !== 'bar'. options: ${JSON.stringify(options)}`);
          }
        });
        model.once('change:scaledData', (model: WidgetModel, value: ndarray | null, options?: any) => {
          if (options.foo === 'bar') {
            condB = true;
          } else {
            throw new Error(`options.foo !== 'bar'. options: ${JSON.stringify(options)}`);
          }
        });
        const array = ndarray(new Float32Array([8, 6, 4]));
        const options = {foo: 'bar'};
        model.setNDArray(array, 'scaledData', options);
        expect(condA).to.be(true);
        expect(condB).to.be(true);
      });

    });

  });

});


describe('arrayFrom', () => {
  const raw_data = new Float32Array([1.4, 2.6, 3.4, 4.4, 5.6, 10.1]);
  const uninit = new Float32Array(raw_data.length);
  const source = ndarray(raw_data, [2, 3]);

  it('should create a copy but uninitialized', () => {
    let copy = arrayFrom(source);
    expect(copy.data).to.not.be(raw_data);
    expect(copy.data).to.eql(uninit);
    expect(copy.shape).to.not.be(source.shape);
    expect(copy.shape).to.eql(source.shape);
    expect(copy.stride).to.not.be(source.stride);
    expect(copy.stride).to.eql(source.stride);
  });

  it('should convert dtype when argument given', () => {
    let copy = arrayFrom(source, 'uint8');
    expect(copy.data).to.eql(new Uint8Array(raw_data.length));
  });

  it('should give an error for buffer dtype', () => {
    expect(arrayFrom).withArgs(source, 'buffer').to.throwError(/Cannot create ndarray/);
  });

  it('should give an error for generic dtype', () => {
    expect(arrayFrom).withArgs(source, 'generic').to.throwError(/Cannot create ndarray/);
  });

  it('should give an error for array dtype', () => {
    expect(arrayFrom).withArgs(source, 'array').to.throwError(/Cannot create ndarray/);
  });

  it('should give an error for invalid dtype', () => {
    expect(arrayFrom).withArgs(source, 'invalid').to.throwError();
  });

});
