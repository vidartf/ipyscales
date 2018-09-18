// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  createTestModel, createTestView
} from './utils.spec';

import {
  ColorBarModel, ColorBarView,
  ColorMapEditorModel, ColorMapEditorView,
  LinearColorScaleModel
} from '../../src/'


describe('ColorBar', () => {

  describe('ColorBarModel', () => {

    it('should be createable', () => {
      const model = createTestModel(ColorBarModel);
      expect(model).to.be.an(ColorBarModel);
      expect(model.get('colormap')).to.be(null);
    });

    it('should be createable non-default values', () => {
      const cm = createTestModel(LinearColorScaleModel);
      const state = {
        colormap: cm
      };
      const model = createTestModel(ColorBarModel, state);
      expect(model).to.be.an(ColorBarModel);
      expect(model.get('colormap')).to.be(cm);
    });

    it('should trigger event when colormap is modified', async () => {
      const map = createTestModel(LinearColorScaleModel);
      const state = {
        colormap: map,
      };
      const model = createTestModel(ColorBarModel, state);
      let triggered = 0;
      model.on('childchange', () => { triggered += 1; })
      map.set('range', ['red', 'blue']);
      expect(triggered).to.be(1);
    });

    it('should update bindings when colormap changes', async () => {
      const mapA = createTestModel(LinearColorScaleModel);
      const mapB = createTestModel(LinearColorScaleModel)
      const state = {
        colormap: mapA,
      };
      const model = createTestModel(ColorBarModel, state);
      let changeTriggered = 0;
      let childChangeTriggered = 0;
      model.on('change', () => { changeTriggered += 1; })
      model.on('childchange', () => { childChangeTriggered += 1; })

      model.set('colormap', mapB);
      expect(changeTriggered).to.be(1);
      expect(childChangeTriggered).to.be(0);

      mapA.set('range', ['red', 'blue']);
      expect(childChangeTriggered).to.be(0);

      mapB.set('range', ['red', 'blue']);
      expect(childChangeTriggered).to.be(1);
    });

  });

  describe('ColorBarView', () => {

    it('should be createable', async () => {
      const state = {
        colormap: createTestModel(LinearColorScaleModel),
      };
      const model = createTestModel(ColorBarModel, state);
      const view = await createTestView(model, ColorBarView);
      expect(view).to.be.an(ColorBarView);
      expect(view.model).to.be(model);
    });

  });

  describe('ColorMapEditorModel', () => {

    it('should be createable', () => {
      let model = createTestModel(ColorMapEditorModel);
      expect(model).to.be.an(ColorMapEditorModel);
      expect(model.get('colormap')).to.be(null);
    });

    it('should trigger event when colormap is modified', async () => {
      const map = createTestModel(LinearColorScaleModel);
      const state = {
        colormap: map,
      };
      const model = createTestModel(ColorMapEditorModel, state);
      let triggered = 0;
      model.on('childchange', () => { triggered += 1; })
      map.set('range', ['red', 'blue']);
      expect(triggered).to.be(1);
    });

    it('should update bindings when colormap changes', async () => {
      const mapA = createTestModel(LinearColorScaleModel);
      const mapB = createTestModel(LinearColorScaleModel)
      const state = {
        colormap: mapA,
      };
      const model = createTestModel(ColorMapEditorModel, state);
      let changeTriggered = 0;
      let childChangeTriggered = 0;
      model.on('change', () => { changeTriggered += 1; })
      model.on('childchange', () => { childChangeTriggered += 1; })

      model.set('colormap', mapB);
      expect(changeTriggered).to.be(1);
      expect(childChangeTriggered).to.be(0);

      mapA.set('range', ['red', 'blue']);
      expect(childChangeTriggered).to.be(0);

      mapB.set('range', ['red', 'blue']);
      expect(childChangeTriggered).to.be(1);
    });

  });

  describe('ColorMapEditorView', () => {

    it('should be createable', async () => {
      const state = {
        colormap: createTestModel(LinearColorScaleModel),
      };
      const model = createTestModel(ColorMapEditorModel, state);
      const view = await createTestView(model, ColorMapEditorView);
      expect(view).to.be.an(ColorMapEditorView);
      expect(view.model).to.be(model);
    });

  });

});
