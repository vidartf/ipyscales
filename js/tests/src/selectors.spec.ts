// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  StringDropdownModel, WidgetDropdownModel, DropdownView
} from '../../src/selectors'

import {
  DummyManager, createTestModel
} from './helpers.spec';

import ndarray = require('ndarray');


describe('StringDropdown', () => {

  describe('StringDropdownModel', () => {

    it('should be creatable', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'A',
      });

      expect(model).to.be.an(StringDropdownModel);
      expect(model.getLabels()).to.eql(['A', 'B', 'C']);
      expect(model.selectedLabel).to.be('A');
    });

  });

  describe('View', () => {

    it('should be creatable', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'A',
      });

      let view = new DropdownView({model});

      expect(view).to.be.an(DropdownView);
      view.render();
      const viewEl = view.el as HTMLElement;
      expect(viewEl.tagName.toLowerCase()).to.be('div');
      expect(viewEl.children.length).to.be(1);
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.tagName.toLowerCase()).to.be('select');
      const optEls = selEl.children;
      expect(optEls.length).to.be(3);
      expect(selEl.selectedIndex).to.be(0);
      view.remove();
    });

    it('should update when model selection changes', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'A',
      });

      let view = new DropdownView({model});
      view.render();
      model.set('value', 'B');
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(1);
      view.remove();
    });

    it('should update when model options changes', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'A',
      });

      let view = new DropdownView({model});
      view.render();
      model.set('options', ['B', 'C', 'D', 'A'],);
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(3);
      view.remove();
    });

    it('should select index -1 when value is null', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: null,
      });

      let view = new DropdownView({model});
      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(-1);
      view.remove();
    });

    it('should select index -1 when value is not in options', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'D',
      });

      let view = new DropdownView({model});

      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(-1);
      view.remove();
    });

    it('should update model user selects an option', () => {
      const model = createTestModel(StringDropdownModel, {
        options: ['A', 'B', 'C'],
        value: 'A',
      });

      let view = new DropdownView({model});
      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;

      selEl.selectedIndex = 2;
      selEl.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }));
      expect(model.get('value')).to.be('C');

      selEl.selectedIndex = -1;
      selEl.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }));
      expect(model.get('value')).to.be(null);

      view.remove();
    });

  });

});


describe('WidgetDropdown', () => {

  describe('WidgetDropdownModel', () => {

    it('should be creatable', () => {
      const mgr = new DummyManager();
      const A = createTestModel(WidgetModel, {}, mgr);
      const B = createTestModel(WidgetModel, {}, mgr);
      const C = createTestModel(WidgetModel, {}, mgr);
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: A,
      }, mgr);

      expect(model).to.be.an(WidgetDropdownModel);
      expect(model.getLabels()).to.eql(['A', 'B', 'C']);
      expect(model.selectedLabel).to.be('A');
    });

  });

  describe('View', () => {

    let mgr: DummyManager;
    let A: WidgetModel;
    let B: WidgetModel;
    let C: WidgetModel;
    let D: WidgetModel;

    beforeEach(() => {
      mgr = new DummyManager();
      A = createTestModel(WidgetModel, {}, mgr);
      B = createTestModel(WidgetModel, {}, mgr);
      C = createTestModel(WidgetModel, {}, mgr);
      D = createTestModel(WidgetModel, {}, mgr);
    })

    it('should be creatable', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: A,
      }, mgr);

      let view = new DropdownView({model});

      expect(view).to.be.an(DropdownView);
      view.render();
      const viewEl = view.el as HTMLElement;
      expect(viewEl.tagName.toLowerCase()).to.be('div');
      expect(viewEl.children.length).to.be(1);
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.tagName.toLowerCase()).to.be('select');
      const optEls = selEl.children;
      expect(optEls.length).to.be(3);
      expect(selEl.selectedIndex).to.be(0);
      view.remove();
    });

    it('should update when model selection changes', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: A,
      }, mgr);

      let view = new DropdownView({model});
      view.render();
      model.set('value', B);
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(1);
      view.remove();
    });

    it('should update when model options changes', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: A,
      }, mgr);

      let view = new DropdownView({model});
      view.render();
      model.set('options', {B, D, A});
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(2);
      view.remove();
    });

    it('should select index -1 when value is null', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: null,
      }, mgr);

      let view = new DropdownView({model});
      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(-1);
      view.remove();
    });

    it('should select index -1 when value is not in options', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: D,
      }, mgr);

      let view = new DropdownView({model});

      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;
      expect(selEl.selectedIndex).to.be(-1);
      view.remove();
    });

    it('should update model user selects an option', () => {
      const model = createTestModel(WidgetDropdownModel, {
        options: {A, B, C},
        value: A,
      }, mgr);

      let view = new DropdownView({model});
      view.render();
      const viewEl = view.el as HTMLElement;
      const selEl = viewEl.children[0] as HTMLSelectElement;

      selEl.selectedIndex = 2;
      selEl.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }));
      expect(model.get('value')).to.be(C);

      selEl.selectedIndex = -1;
      selEl.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }));
      expect(model.get('value')).to.be(null);

      view.remove();
    });

  });

});
