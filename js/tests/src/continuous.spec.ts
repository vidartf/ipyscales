// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  scaleLinear, InterpolatorFactory
} from 'd3-scale';

import {
  interpolate, interpolateRound
} from 'd3-interpolate';

import {
  createTestModel
} from './utils.spec';

import {
  LinearScaleModel, LogScaleModel, PowScaleModel
} from '../../src/'


describe('LinearScaleModel', () => {

    it('should be createable', () => {
        let model = createTestModel(LinearScaleModel);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(typeof model.obj).to.be('function');
        });
    });

    it('should have expected default values in model', () => {
        let model = createTestModel(LinearScaleModel);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(model.get('range')).to.eql([0, 1]);
          expect(model.get('domain')).to.eql([0, 1]);
          expect(model.get('clamp')).to.be(false);
          expect(model.get('interpolator')).to.be('interpolate');
        });
    });

    it('should have expected default values in object', () => {
        let model = createTestModel(LinearScaleModel);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql([0, 1]);
          expect(model.obj.domain()).to.eql([0, 1]);
          expect(model.obj.clamp()).to.be(false);
          expect(model.obj.interpolate()).to.be(interpolate);
        });
    });

    it('should be createable with non-default values', () => {
        let state = {
          range: [0.01, 2.35],
          domain: [-1e7, 1e5],
          clamp: true,
          interpolator: 'interpolateRound'
         };
        let model = createTestModel(LinearScaleModel, state);
        return model.initPromise.then(() => {
          expect(model.obj.range()).to.eql([0.01, 2.35]);
          expect(model.obj.domain()).to.eql([-1e7, 1e5]);
          expect(model.obj.clamp()).to.be(true);
          expect(model.obj.interpolate()).to.be(interpolateRound);
        });
    });

    it('should throw an error for an invalid interpolator', () => {
        let state = {
          interpolator: 'interpolateFunctionThatDoesNotExist'
         };
        let model = createTestModel(LinearScaleModel, state);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.catch(reason => {
          expect(reason).to.match(/.*: Cannot find name of interpolator.*/);
        });
    });

    it('should sync to the default interpolator for null', () => {
        let state = {
          interpolator: null
         };
        let model = createTestModel(LinearScaleModel, state);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(model.get('interpolator')).to.be('interpolate');
          expect(model.obj.interpolate()).to.be(interpolate);
        });
    });

    it('should sync to the default interpolator for undefined', () => {
        let state = {
          interpolator: undefined
         };
        let model = createTestModel(LinearScaleModel, state);
        expect(model).to.be.an(LinearScaleModel);
        return model.initPromise.then(() => {
          expect(model.get('interpolator')).to.be('interpolate');
          expect(model.obj.interpolate()).to.be(interpolate);
        });
    });

});


describe('LogScaleModel', () => {

  it('should be createable', () => {
      let model = createTestModel(LogScaleModel);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.then(() => {
        expect(typeof model.obj).to.be('function');
      });
  });

  it('should have expected default values in model', () => {
      let model = createTestModel(LogScaleModel);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('range')).to.eql([0, 1]);
        expect(model.get('domain')).to.eql([0, 1]);
        expect(model.get('clamp')).to.be(false);
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.get('base')).to.be(10);
      });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(LogScaleModel);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0, 1]);
        expect(model.obj.domain()).to.eql([0, 1]);
        expect(model.obj.clamp()).to.be(false);
        expect(model.obj.interpolate()).to.be(interpolate);
        expect(model.obj.base()).to.be(10);
      });
  });

  it('should be createable with non-default values', () => {
      let state = {
        range: [0.01, 2.35],
        domain: [-1e7, 1e5],
        clamp: true,
        interpolator: 'interpolateRound',
        base: 2.78,
       };
      let model = createTestModel(LogScaleModel, state);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0.01, 2.35]);
        expect(model.obj.domain()).to.eql([-1e7, 1e5]);
        expect(model.obj.clamp()).to.be(true);
        expect(model.obj.interpolate()).to.be(interpolateRound);
        expect(model.obj.base()).to.be(2.78);
      });
  });

  it('should throw an error for an invalid interpolator', () => {
      let state = {
        interpolator: 'interpolateFunctionThatDoesNotExist'
       };
      let model = createTestModel(LogScaleModel, state);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.catch(reason => {
        expect(reason).to.match(/.*: Cannot find name of interpolator.*/);
      });
  });

  it('should sync to the default interpolator for null', () => {
      let state = {
        interpolator: null
       };
      let model = createTestModel(LogScaleModel, state);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.obj.interpolate()).to.be(interpolate);
      });
  });

  it('should sync to the default interpolator for undefined', () => {
      let state = {
        interpolator: undefined
       };
      let model = createTestModel(LogScaleModel, state);
      expect(model).to.be.an(LogScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.obj.interpolate()).to.be(interpolate);
      });
  });

});


describe('PowScaleModel', () => {

  it('should be createable', () => {
      let model = createTestModel(PowScaleModel);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.then(() => {
        expect(typeof model.obj).to.be('function');
      });
  });

  it('should have expected default values in model', () => {
      let model = createTestModel(PowScaleModel);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('range')).to.eql([0, 1]);
        expect(model.get('domain')).to.eql([0, 1]);
        expect(model.get('clamp')).to.be(false);
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.get('exponent')).to.be(1);
      });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(PowScaleModel);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0, 1]);
        expect(model.obj.domain()).to.eql([0, 1]);
        expect(model.obj.clamp()).to.be(false);
        expect(model.obj.interpolate()).to.be(interpolate);
        expect(model.obj.exponent()).to.be(1);
      });
  });

  it('should be createable with non-default values', () => {
      let state = {
        range: [0.01, 2.35],
        domain: [-1e7, 1e5],
        clamp: true,
        interpolator: 'interpolateRound',
        exponent: 2.78
       };
      let model = createTestModel(PowScaleModel, state);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0.01, 2.35]);
        expect(model.obj.domain()).to.eql([-1e7, 1e5]);
        expect(model.obj.clamp()).to.be(true);
        expect(model.obj.interpolate()).to.be(interpolateRound);
        expect(model.obj.exponent()).to.be(2.78);
      });
  });

  it('should throw an error for an invalid interpolator', () => {
      let state = {
        interpolator: 'interpolateFunctionThatDoesNotExist'
       };
      let model = createTestModel(PowScaleModel, state);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.catch(reason => {
        expect(reason).to.match(/.*: Cannot find name of interpolator.*/);
      });
  });

  it('should sync to the default interpolator for null', () => {
      let state = {
        interpolator: null
       };
      let model = createTestModel(PowScaleModel, state);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.obj.interpolate()).to.be(interpolate);
      });
  });

  it('should sync to the default interpolator for undefined', () => {
      let state = {
        interpolator: undefined
       };
      let model = createTestModel(PowScaleModel, state);
      expect(model).to.be.an(PowScaleModel);
      return model.initPromise.then(() => {
        expect(model.get('interpolator')).to.be('interpolate');
        expect(model.obj.interpolate()).to.be(interpolate);
      });
  });

});
