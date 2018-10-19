// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView, unpack_models, WidgetModel
} from '@jupyter-widgets/base';

import {
  version, moduleName
} from './version';

import {
  arrayEquals
} from './utils';
import { lab } from 'd3-color';


/**
 * Base model for scales
 */
export abstract class SelectorBaseModel extends DOMWidgetModel {

  defaults() {
    const ctor = this.constructor as any;
    return {...super.defaults(),
      _model_name: ctor.model_name,
      _model_module: ctor.model_module,
      _model_module_version: ctor.model_module_version,
      _view_name: ctor.view_name,
      _view_module: ctor.view_module,
      _view_module_version: ctor.view_module_version,
    };
  }

  abstract getLabels(): string[];

  abstract get selectedLabel(): string | null;
  abstract set selectedLabel(value: string | null);

  static serializers = {
    ...DOMWidgetModel.serializers,
  }

  static model_name: string;    // Base model should not be instantiated directly
  static model_module = moduleName;
  static model_module_version = version;
  static view_name = null;
  static view_module = moduleName;
  static view_module_version = version;
}


/**
 * A widget model of a linear scale
 */
export class StringDropdownModel extends SelectorBaseModel {

  defaults() {
    return {
      ...super.defaults(),
      value: null,
      options: [],
    };
  }

  getLabels(): string[] {
    return this.get('options') || [];
  };

  get selectedLabel(): string | null {
    return this.get('value');
  }

  set selectedLabel(value: string | null) {
    this.set({value}, 'fromView');
    this.save_changes();
  }


  static serializers = {
    ...SelectorBaseModel.serializers,
  }

  static model_name = 'StringDropdownModel';
}


type WidgetMap = {[key: string]: WidgetModel};


/**
 * A widget model of a linear scale
 */
export class WidgetDropdownModel extends SelectorBaseModel {

  defaults() {
    return {
      ...super.defaults(),
      value: null,
      options: {},
    };
  }

  initialize(attributes: any, options: any): void {
    super.initialize(attributes, options);
    this.setupListeners();
    this.updateReverse(this, this.get('options') || []);
  }

  setupListeners(): void {
    this.on('change:options', this.updateReverse, this);
  }

  updateReverse(model: WidgetModel, value: WidgetMap, options?: any) {
    this.reverseMap = {};
    for (let key of Object.keys(value)) {
      const v = value[key];
      if (v && v.toJSON) {
        this.reverseMap[value[key].toJSON({})] = key;
      }
    }
  }

  getLabels(): string[] {
    const options: WidgetMap = this.get('options') || {};
    return Object.keys(options);
  };

  get selectedLabel(): string | null {
    const value = this.get('value') as WidgetModel | null;
    return value && this.reverseMap[value.toJSON(undefined)];
  }

  set selectedLabel(value: string | null) {
    const options: WidgetMap = this.get('options') || {};
    this.set({value: value ? options[value] || null : null}, 'fromView');
    this.save_changes();
  }

  protected reverseMap: {[key: string]: string};

  static serializers = {
    ...SelectorBaseModel.serializers,
    value: {deserialize: unpack_models},
    options: {deserialize: unpack_models},
  }

  static model_name = 'StringDropdownModel';
}


export class DropdownView extends DOMWidgetView {
  /**
   * Public constructor.
   */
  initialize(parameters: any) {
    super.initialize(parameters);
    this.listenTo(this.model, 'change', this.onModelChange.bind(this));
  }

  onModelChange(model: SelectorBaseModel, options?: any) {
    if (options === 'fromView') {
      return;
    }
    this.update();
  }

  /**
   * Called when view is rendered.
   */
  render() {
    super.render();

    this.el.classList.add('jupyter-widgets');
    this.el.classList.add('widget-inline-hbox');
    this.el.classList.add('widget-dropdown');

    this.listbox = document.createElement('select');
    this.el.appendChild(this.listbox);
    this.update();
  }

  /**
   * Update the contents of this view
   */
  update() {
    const labels = this.model.getLabels();
    if (!arrayEquals(labels, this._current_options)) {
      this._updateOptions(labels);
    }

    // Select the correct element
    const sel = this.model.selectedLabel;
    if (sel === null) {
      this.listbox.selectedIndex = -1;
    } else {
      this.listbox.value = sel;
    }
    return super.update();
  }

  protected _updateOptions(labels: string[]) {
    this.listbox.textContent = '';
    for (let label of labels) {
      let option = document.createElement('option');
      option.textContent = label.replace(/ /g, '\xa0'); // space -> &nbsp;
      option.value = label;
      this.listbox.appendChild(option);
    }
    this._current_options = labels.slice();
  }

  events(): {[e: string]: string} {
    return {
      'change select': '_handle_change'
    };
  }

  /**
   * Handle when a new value is selected.
   */
  _handle_change() {
    this.model.selectedLabel = this.listbox.selectedIndex === -1
      ? null
      : this.listbox.value;
  }

  listbox: HTMLSelectElement;

  model: SelectorBaseModel;

  _current_options: string[] = [];
}

