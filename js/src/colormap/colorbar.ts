// Copyright (c) Vidar Tonaas Fauske.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView, ISerializers, IWidgetManager, WidgetModel, unpack_models
} from '@jupyter-widgets/base';

import { Message } from '@lumino/messaging';

import {
  chromabar, ChromaBar
} from 'chromabar';

import { select } from 'd3-selection';

import {
  MODULE_NAME, MODULE_VERSION
} from '../version';


// Override typing
declare module "@jupyter-widgets/base" {
  function unpack_models(value?: any, manager?: IWidgetManager): Promise<any>;
}


export class ColorBarModel extends DOMWidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ColorBarModel.model_name,
      _model_module: ColorBarModel.model_module,
      _model_module_version: ColorBarModel.model_module_version,
      _view_name: ColorBarModel.view_name,
      _view_module: ColorBarModel.view_module,
      _view_module_version: ColorBarModel.view_module_version,
      colormap: null,

      orientation: 'vertical',
      side: 'bottomright',
      length: 100,
      breadth: 30,
      border_thickness: 1,
      title: null,
      padding: 5,
      title_padding: 0,
      axis_padding: 0,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.setupListeners();
  }

  setupListeners() {
    // register listener for current child value
    const childAttrName = 'colormap';
    var curValue = this.get(childAttrName);
    if (curValue) {
        this.listenTo(curValue, 'change', this.onChildChanged.bind(this));
        this.listenTo(curValue, 'childchange', this.onChildChanged.bind(this));
    }

    // make sure to (un)hook listeners when child points to new object
    this.on(`change:${childAttrName}`, (model: this, value: WidgetModel) => {
        var prevModel = this.previous(childAttrName);
        var currModel = value;
        if (prevModel) {
            this.stopListening(prevModel);
        }
        if (currModel) {
            this.listenTo(currModel, 'change', this.onChildChanged.bind(this));
            this.listenTo(currModel, 'childchange', this.onChildChanged.bind(this));
        }
    }, this);

  }

  onChildChanged(model: Backbone.Model) {
    // Propagate up hierarchy:
    this.trigger('childchange', this);
  }

  static serializers: ISerializers = {
      ...DOMWidgetModel.serializers,
      colormap: { deserialize: unpack_models }
    }

  static model_name = 'ColorBarModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ColorBarView';
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}


export class ColorBarView extends DOMWidgetView {
  render() {
    const cmModel = this.model.get('colormap');
    this.barFunc = chromabar(cmModel.obj);

    this.onChange();
    this.model.on('change', this.onChange, this);
    this.model.on('childchange', this.onChange, this);
  }

  _processLuminoMessage(msg: Message, _super: (msg: Message) => void): void {
    _super.call(this, msg);
    switch (msg.type) {
    case 'after-attach':
      // Auto-sizing should be updated when attached to DOM:
      this.onChange();
      break;
    }
  }

  processPhosphorMessage(msg: Message): void {
    this._processLuminoMessage(msg, (DOMWidgetView as any).processPhosphorMessage);
  }

  processLuminoMessage(msg: Message): void {
    this._processLuminoMessage(msg, (DOMWidgetView as any).processLuminoMessage);
  }

  onChange() {
    // Sync config:
    this.barFunc
      .orientation(this.model.get('orientation'))
      .side(this.model.get('side'))
      .barLength(this.model.get('length'))
      .breadth(this.model.get('breadth'))
      .borderThickness(this.model.get('border_thickness'))
      .title(this.model.get('title'))
      .padding(this.model.get('padding'))
      .titlePadding(this.model.get('title_padding'))
      .axisPadding(this.model.get('axis_padding'));

    // Update DOM:
    let svg = select(this.el)
      .selectAll<SVGSVGElement | SVGGElement, null>('svg.jupyterColorbar').data([null]);
    svg = svg.merge(svg.enter().append<SVGSVGElement | SVGGElement>('svg')
      .attr('class', 'jupyterColorbar'))
      .call(this.barFunc);
  }

  barFunc: ChromaBar;
}
