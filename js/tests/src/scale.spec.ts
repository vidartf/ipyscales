// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import { scaleImplicit } from 'd3-scale';

import {
  createTestModel, DummyManager
} from './utils.spec';

import {
  ScaleModel, QuantizeScaleModel, QuantileScaleModel, TresholdScaleModel,
  OrdinalScaleModel
} from '../../src/'


class TestModel extends ScaleModel {
  constructObject(): any | Promise<any> {
    return {};
  }

  syncToObject(): void {
    this.syncCalled++;
  }

  onCustomMessage(content: any, buffers: any) {
    super.onCustomMessage.call(this, arguments);  // Get that coverage!
    this.customMessages++;
  }

  syncCalled = 0;
  customMessages = 0;
}


class BrokenModel extends ScaleModel {
  constructObject(): any | Promise<any> {
    return {};
  }

  syncToObject(): void {
    this.syncCalled++;
  }

  syncCalled = 0;
}

delete BrokenModel.prototype.constructObject;


describe('BaseModel', () => {

  describe('constrution', () => {

    it('should be createable', () => {
      let model = createTestModel(TestModel);
      expect(model).to.be.an(TestModel);
      return model.initPromise.then(() => {
        expect(typeof model.obj).to.be('object');
      });
    });

    it('should fail if not getting model_id', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: undefined,
      }

      let p = Promise.resolve(new TestModel({}, modelOptions)).then(model => {
        return model.initPromise;
      })

      p.then(() => { expect().fail('Promise should be rejected!'); })
      return p.catch(reason => {
        expect(reason).to.match(/Model missing ID/);
      });
    });

    it('should be createable with a value', () => {
      let state = { value: 'Foo Bar!' }
      let model = createTestModel(TestModel, state);
      expect(model).to.be.an(TestModel);
    });

  });

  describe('syncToModel', () => {

    it('should do nothing if object falsy', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        model.on('change', expect().fail);
        model.syncToModel({});
        model.syncToModel(null!);
      });
    });

    it('should set properties if passed', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        let numCalled = 0;
        model.on('change', () => { ++numCalled; });
        model.syncToModel({testAttrib: 5});
        expect(numCalled).to.be(1);
      });
    });

    it('should not trigger a sync back to object', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        let old = model.syncCalled;
        model.syncToModel({testAttrib: 5});
        expect(model.syncCalled).to.be(old);
      });
    });

  });

  describe('syncToObject', () => {

    it('should get called during creation', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        expect(model.syncCalled).to.be(1);
      });
    });

    it('should trigger when attributes change', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        model.set({testAttrib: 5});
        expect(model.syncCalled).to.be(2);
      });
    });

    it('should not trigger when attributes change with flag set', () => {
      let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        model.set({testAttrib: 5}, 'pushFromObject');
        expect(model.syncCalled).to.be(1);
      });
    });

  });

  it('should call custom message handler', () => {
    let model = createTestModel(TestModel);
      return model.initPromise.then(() => {
        model.trigger('msg:custom', {}, []);
        expect(model.customMessages).to.be(1);
      });
  });

});


describe('QuantizeScaleModel', () => {

  it('should be createable', () => {
    let model = createTestModel(QuantizeScaleModel);
    expect(model).to.be.an(QuantizeScaleModel);
    return model.initPromise.then(() => {
      expect(typeof model.obj).to.be('function');
    });
  });

  it('should have expected default values in model', () => {
    let model = createTestModel(QuantizeScaleModel);
    expect(model).to.be.an(QuantizeScaleModel);
    return model.initPromise.then(() => {
      expect(model.get('range')).to.eql([0, 1]);
      expect(model.get('domain')).to.eql([0, 1]);
    });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(QuantizeScaleModel);
      expect(model).to.be.an(QuantizeScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0, 1]);
        expect(model.obj.domain()).to.eql([0, 1]);
      });
  });

});


describe('QuantileScaleModel', () => {

  it('should be createable', () => {
    let model = createTestModel(QuantileScaleModel);
    expect(model).to.be.an(QuantileScaleModel);
    return model.initPromise.then(() => {
      expect(typeof model.obj).to.be('function');
    });
  });

  it('should have expected default values in model', () => {
    let model = createTestModel(QuantileScaleModel);
    expect(model).to.be.an(QuantileScaleModel);
    return model.initPromise.then(() => {
      expect(model.get('range')).to.eql([0]);
      expect(model.get('domain')).to.eql([0]);
    });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(QuantileScaleModel);
      expect(model).to.be.an(QuantileScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0]);
        expect(model.obj.domain()).to.eql([0]);
      });
  });

});


describe('TresholdScaleModel', () => {

  it('should be createable', () => {
    let model = createTestModel(TresholdScaleModel);
    expect(model).to.be.an(TresholdScaleModel);
    return model.initPromise.then(() => {
      expect(typeof model.obj).to.be('function');
    });
  });

  it('should have expected default values in model', () => {
    let model = createTestModel(TresholdScaleModel);
    expect(model).to.be.an(TresholdScaleModel);
    return model.initPromise.then(() => {
      expect(model.get('range')).to.eql([0]);
      expect(model.get('domain')).to.eql([]);
    });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(TresholdScaleModel);
      expect(model).to.be.an(TresholdScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0]);
        expect(model.obj.domain()).to.eql([]);
      });
  });

});


describe('OrdinalScaleModel', () => {

  it('should be createable', () => {
    let model = createTestModel(OrdinalScaleModel);
    expect(model).to.be.an(OrdinalScaleModel);
    return model.initPromise.then(() => {
      expect(typeof model.obj).to.be('function');
    });
  });

  it('should have expected default values in model', () => {
    let model = createTestModel(OrdinalScaleModel);
    expect(model).to.be.an(OrdinalScaleModel);
    return model.initPromise.then(() => {
      expect(model.get('range')).to.eql([]);
      expect(model.get('domain')).to.eql([]);
      expect(model.get('unknown')).to.be(undefined);
    });
  });

  it('should have expected default values in object', () => {
      let model = createTestModel(OrdinalScaleModel);
      expect(model).to.be.an(OrdinalScaleModel);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([]);
        expect(model.obj.domain()).to.eql([]);
        expect(model.obj.unknown()).to.eql(scaleImplicit);
      });
  });

  it('should be createable with non-default values', () => {
      let state = {
        range: [0.01, 2.35],
        domain: [-1e7, 1e5],
        unknown: 100,
       };
      let model = createTestModel(OrdinalScaleModel, state);
      return model.initPromise.then(() => {
        expect(model.obj.range()).to.eql([0.01, 2.35]);
        expect(model.obj.domain()).to.eql([-1e7, 1e5]);
        expect(model.obj.unknown()).to.be(100);
      });
  });

});
