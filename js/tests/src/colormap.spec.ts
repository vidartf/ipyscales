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
} from '../../src/'


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
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
          expect(model.get('interpolator')).to.be('interpolate');
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(LogColorScaleModel);
        expect(model).to.be.an(LogColorScaleModel);
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
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(NamedDivergingColorMap);
        expect(model).to.be.an(NamedDivergingColorMap);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([0, 1]);
          expect(model.obj.clamp()).to.be(false);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          name: 'PiYG',
          domain: [-1e7, 1e5],
          clamp: true,
        };
        let model = createTestModel(NamedDivergingColorMap, state);
        return model.initPromise.then(() => {
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(colormapAsRGBAArray(model as any, 10)).to.eql([
            142, 1, 82, 1,
            192, 38, 126, 1,
            221, 114, 173, 1,
            240, 179, 214, 1,
            250, 221, 237, 1,
            245, 243, 239, 1,
            225, 242, 202, 1,
            182, 222, 135, 1,
            128, 187, 71, 1,
            79, 145, 37, 1,
          ]);
        });
    });

  });

});
