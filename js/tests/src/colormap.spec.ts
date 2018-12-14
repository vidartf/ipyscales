// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  interpolate, interpolateHsl
} from 'd3-interpolate';

import {
  createTestModel
} from './helpers.spec';

import {
  LinearColorScaleModel, LogColorScaleModel,
  NamedDivergingColorMap, NamedSequentialColorMap,
  colormapAsRGBArray, colormapAsRGBAArray,
  NamedOrdinalColorMap, ArrayColorScaleModel, isColorMapModel
} from '../../src/'
import ndarray = require('ndarray');


describe('ColorScales', () => {

  describe('LinearColorScaleModel', () => {

    it('should be createable', () => {
        let model = createTestModel(LinearColorScaleModel);
        expect(model).to.be.an(LinearColorScaleModel);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(LinearColorScaleModel);
        expect(model).to.be.an(LinearColorScaleModel);
        return model.initPromise.then(() => {
          expect(model.get('range')).to.eql(['black', 'white']);
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
          expect(model.get('interpolator')).to.be('interpolate');
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(LinearColorScaleModel);
        expect(model).to.be.an(LinearColorScaleModel);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql(['black', 'white']);
          expect(model.obj.domain()).to.eql([0, 1]);
          expect(model.obj.clamp()).to.be(false);
          expect(model.obj.interpolate()).to.be(interpolate);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          range: ['#f00', 'rgba(0, 0, 255, 0.5)'],
          domain: [-1e7, 1e5],
          clamp: true,
          interpolator: 'interpolateHsl',
        };
        let model = createTestModel(LinearColorScaleModel, state);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql(['#f00', 'rgba(0, 0, 255, 0.5)']);
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(model.obj.interpolate()).to.be(interpolateHsl);
        });
    });

  });

  describe('LogColorScaleModel', () => {
    it('should be createable', () => {
        let model = createTestModel(LogColorScaleModel);
        expect(model).to.be.an(LogColorScaleModel);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(LogColorScaleModel);
        expect(model).to.be.an(LogColorScaleModel);
        return model.initPromise.then(() => {
          expect(model.get('range')).to.eql(['black', 'white']);
          expect(model.get('domain')).to.eql([1, 10]);
          expect(model.get('clamp')).to.be(false);
          expect(model.get('interpolator')).to.be('interpolate');
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(LogColorScaleModel);
        expect(model).to.be.an(LogColorScaleModel);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql(['black', 'white']);
          expect(model.get('domain')).to.eql([1, 10]);
          expect(model.obj.clamp()).to.be(false);
          expect(model.obj.interpolate()).to.be(interpolate);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          range: ['#f00', 'rgba(0, 0, 255, 0.5)'],
          domain: [-1e7, 1e5],
          clamp: true,
          interpolator: 'interpolateHsl',
        };
        let model = createTestModel(LogColorScaleModel, state);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql(['#f00', 'rgba(0, 0, 255, 0.5)']);
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(model.obj.interpolate()).to.be(interpolateHsl);
        });
    });

  });

  describe('NamedSequentialColorMap', () => {

    it('should be createable', () => {
        let model = createTestModel(NamedSequentialColorMap);
        expect(model).to.be.an(NamedSequentialColorMap);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(NamedSequentialColorMap);
        expect(model).to.be.an(NamedSequentialColorMap);
        return model.initPromise.then(() => {
          expect(model.get('name')).to.be('Viridis');
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(NamedSequentialColorMap);
        expect(model).to.be.an(NamedSequentialColorMap);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([0, 1]);
          expect(model.obj.clamp()).to.be(false);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          name: 'PuBuGn',
          domain: [-1e7, 1e5],
          clamp: true,
        };
        let model = createTestModel(NamedSequentialColorMap, state);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(colormapAsRGBArray(model as any, 10)).to.eql([
            255, 247, 251,
            239, 231, 242,
            219, 216, 234,
            190, 201, 226,
            152, 185, 217,
            105, 168, 207,
            64, 150, 192,
            25, 135, 159,
            3, 120, 119,
            1, 99, 83 ]);
        });
    });

  });

  describe('NamedDivergingColorMap', () => {

    it('should be createable', () => {
        let model = createTestModel(NamedDivergingColorMap);
        expect(model).to.be.an(NamedDivergingColorMap);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(NamedDivergingColorMap);
        expect(model).to.be.an(NamedDivergingColorMap);
        return model.initPromise.then(() => {
          expect(model.get('name')).to.be('BrBG');
          expect(model.get('domain')).to.eql([0, 0.5, 1]);
          expect(model.get('clamp')).to.be(false);
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(NamedDivergingColorMap);
        expect(model).to.be.an(NamedDivergingColorMap);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([0, 0.5, 1]);
          expect(model.obj.clamp()).to.be(false);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          name: 'PiYG',
          domain: [-1e7, 0, 1e5],
          clamp: true,
        };
        let model = createTestModel(NamedDivergingColorMap, state);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([-1e7, 0,  1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(colormapAsRGBAArray(model as any, 10)).to.eql([
            142, 1, 82, 255,
            192, 38, 126, 255,
            221, 114, 173, 255,
            240, 179, 214, 255,
            250, 221, 237, 255,
            245, 243, 239, 255,
            225, 242, 202, 255,
            182, 222, 135, 255,
            128, 187, 71, 255,
            79, 145, 37, 255,
          ]);
        });
    });

  });

  describe('NamedOrdinalColorMap', () => {

    it('should be createable', () => {
        let model = createTestModel(NamedOrdinalColorMap);
        expect(model).to.be.an(NamedOrdinalColorMap);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(NamedOrdinalColorMap);
        expect(model).to.be.an(NamedOrdinalColorMap);
        return model.initPromise.then(() => {
          expect(model.get('name')).to.be('Category10');
          expect(model.get('cardinality')).to.be(10);
          expect(model.get('domain')).to.eql([]);
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(NamedOrdinalColorMap);
        expect(model).to.be.an(NamedOrdinalColorMap);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([]);
          expect(model.obj.range().length).to.eql(10);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          name: 'PuBuGn',
          domain: [-1e7, 1e5],
          cardinality: 3,
        };
        let model = createTestModel(NamedOrdinalColorMap, state);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.range()).to.eql(['#ece2f0', '#a6bddb', '#1c9099']);
        });
    });

    it('should throw an error for invalid name', () => {
        let state = {
          name: 'FooBar',
        };
        expect(createTestModel).withArgs(NamedOrdinalColorMap, state)
          .to.throwError(/^Unknown scheme name: FooBar/);
    });

    it('should throw an error for unkown range', () => {
        let model = createTestModel(NamedOrdinalColorMap);
        return model.initPromise.then(() => {
          model.obj.range(['#ffffff', '#000000']);
          expect(model.syncToModel.bind(model)).withArgs({}).to.throwError(
            /^Unknown color scheme name /);
        });
    });

  });

  describe('ArrayColorScaleModel', () => {

    it('should be createable', () => {
        let model = createTestModel(ArrayColorScaleModel);
        expect(model).to.be.an(ArrayColorScaleModel);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(ArrayColorScaleModel);
        expect(model).to.be.an(ArrayColorScaleModel);
        return model.initPromise.then(() => {
          const colors = model.get('colors');
          expect(colors.shape).to.eql([2, 3]);
          expect(colors.data).to.eql([0, 0, 0, 1, 1, 1]);
          expect(model.get('space')).to.be('rgb');
          expect(model.get('gamma')).to.be(1.0);
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
          expect(model.isColorScale).to.be(true);
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(ArrayColorScaleModel);
        expect(model).to.be.an(ArrayColorScaleModel);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([0, 1]);
          expect(model.obj.clamp()).to.be(false);
        });
    });

    it('should update in object on change', () => {
        let model = createTestModel(ArrayColorScaleModel);
        expect(model).to.be.an(ArrayColorScaleModel);
        return model.initPromise.then(() => {
          model.set('colors', ndarray(new Float32Array([1, 1, 1, 0, 0, 0]), [2, 3]));
          expect(model.obj.interpolator()(1)).to.be('rgb(0, 0, 0)');
          model.set('space', 'hsl');
          expect(model.obj.interpolator()(0)).to.be('rgb(255, 255, 255)');
          expect(model.obj.interpolator()(1)).to.be('rgb(0, 0, 0)');
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          colors: ndarray(new Float32Array([
            0.5, 0.5, 0.5, 0.5,
            1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 0.0,
          ]), [3, 4]),
          domain: [-1e7, 1e5],
          clamp: true,
          gamma: 2.2
        };
        let model = createTestModel(ArrayColorScaleModel, state);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(colormapAsRGBAArray(model as any, 7)).to.eql([
            128, 128, 128, 128,
            182, 182, 106, 170,
            222, 222, 77, 212,
            255, 255, 0, 255,
            212, 212, 0, 170,
            155, 155, 0, 85,
            0, 0, 0, 0,
          ]);
        });
    });

  });

});
