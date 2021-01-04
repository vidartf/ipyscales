// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid, WidgetModel
} from '@jupyter-widgets/base';

import {
  LinearScaleModel
} from '../../src/continuous';

import {
  LinearColorScaleModel
} from '../../src/colormap';

import {
  ScaledValueModel
} from '../../src/value';

import {
  DummyManager, createTestModel
} from './helpers.spec';


async function createWidgetModel(widget_manager?: WidgetModel['widget_manager']): Promise<ScaledValueModel> {
  widget_manager = widget_manager || new DummyManager();

  let scale = createTestModel(LinearScaleModel, {
      domain: [0, 10],
      range: [-10, -5],
    }, widget_manager);
  widget_manager.register_model(scale.model_id, Promise.resolve(scale));

  let attributes = {
    scale,
    input: 5,
  };
  const model = createTestModel(ScaledValueModel, attributes, widget_manager);
  widget_manager.register_model(model.model_id, Promise.resolve(model));
  await model.initPromise;
  return model;
}

describe('ScaledValueModel', () => {

  it('should be creatable', async () => {
    let widget_manager = new DummyManager();
    let modelOptions = {
      widget_manager: widget_manager,
      model_id: uuid(),
    }
    let serializedState = {};
    let model = new ScaledValueModel(serializedState, modelOptions as any);
    await model.initPromise;

    expect(model).to.be.an(ScaledValueModel);
    expect(model.get('output')).to.be(null);
  });

  it('should not include output in serialization', async () => {
    const model = await createWidgetModel();
    const state = await model.widget_manager.get_state();
    const models = Object.keys(state.state).map(k => state.state[k].state);
    expect(models.length).to.be(2);
    expect(models[1]._model_name).to.be('ScaledValueModel');
    expect(models[1].output).to.be(undefined);
  });

  it('should compute scaled input when initialized with scale and input', async () => {
    let model = await createWidgetModel();
    expect(model).to.be.an(ScaledValueModel);
    expect(model.get('output')).to.eql(-7.5);
  });

  it('should trigger change when setting scale to null', async () => {
    let model = await createWidgetModel();

    let triggered = false;
    model.on('change:output', (model: WidgetModel, value: number | null, options: any) => {
      triggered = true;
    });
    model.set('scale', null);
    expect(model).to.be.an(ScaledValueModel);
    expect(triggered).to.be(true);
    expect(model.get('output')).to.be(null);
  });

  it('should trigger change when changing from null', async () => {
    let model = await createWidgetModel();

    let input = model.get('input') as number;
    model.set('input', null);
    let triggered = false;
    model.on('change:output', (model: WidgetModel, value: number | null, options: any) => {
      triggered = true;
    });
    model.set('input', input);
    expect(model).to.be.an(ScaledValueModel);
    expect(model.get('output')).to.eql(-7.5);
    expect(triggered).to.be(true);
  });

  it('should not trigger change when still incomplete', async () => {
    let model = await createWidgetModel();

    let input = model.get('input') as number;
    model.set({input: null, scale: null});
    let triggered = false;
    model.on('change:output', (model: WidgetModel, value: number | null, options: any) => {
      triggered = true;
    });
    model.set('input', input);
    expect(model).to.be.an(ScaledValueModel);
    expect(triggered).to.be(false);
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
    expect(model.get('output')).to.be('rgb(128, 0, 128)');
  });

  it('should accept another scale as input', async () => {
    let modelA = await createWidgetModel();
    let modelB = await createWidgetModel(modelA.widget_manager as DummyManager);

    let scale = createTestModel(LinearColorScaleModel, {
      domain: modelA.get('scale').get('range'),
      range: ['red', 'blue'],
    }, modelA.widget_manager);
    await scale.initPromise;
    modelB.set({
      input: modelA,
      scale,
    });
    expect(modelB.get('output')).to.be('rgb(128, 0, 128)');
  });

});
