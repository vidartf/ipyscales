// Copyright (c) Vidar Tonaas Fauske.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView, ISerializers, WidgetModel, unpack_models
} from '@jupyter-widgets/base';

import {
  chromaEditor
} from 'chromabar';


import { select } from 'd3-selection';

import {
  version, moduleName
} from '../version';

import {
  ScaleModel
} from '../scale'


export
class ColorMapEditorModel extends DOMWidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ColorMapEditorModel.model_name,
      _model_module: ColorMapEditorModel.model_module,
      _model_module_version: ColorMapEditorModel.model_module_version,
      _view_name: ColorMapEditorModel.view_name,
      _view_module: ColorMapEditorModel.view_module,
      _view_module_version: ColorMapEditorModel.view_module_version,
      colormap: null,

      orientation: 'horizontal',
      length: 300,
      breadth: 30,
      border_thickness: 1,
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

  onChildChanged(model: WidgetModel) {
    // Propagate up hierarchy:
    this.trigger('childchange', this);
  }

  static serializers: ISerializers = {
      ...DOMWidgetModel.serializers,
      colormap: {deserialize: unpack_models}
    }

  static model_name = 'ColorMapEditorModel';
  static model_module = moduleName;
  static model_module_version = version;
  static view_name = 'ColorMapEditorView';
  static view_module = moduleName;
  static view_module_version = version;
}


export
class ColorMapEditorView extends DOMWidgetView {
  render() {
    this.onChange();
    this.model.on('change', this.onChange, this);
    this.model.on('childchange', this.onChange, this);
  }

  onChange() {
    const cmModel = this.model.get('colormap') as ScaleModel;
    const horizontal = this.model.get('orientation') === 'horizontal';
    const editorFn = chromaEditor(cmModel.obj)
      .orientation(this.model.get('orientation'))
      .barLength(this.model.get('length'))
      .breadth(this.model.get('breadth'))
      .borderThickness(this.model.get('border_thickness'))
      .onUpdate((save: boolean) => {
        // Sync back all changes to both server and here
        cmModel.syncToModel({});
        if (save) {
          cmModel.save_changes();
        }
      });
    let svg = select(this.el)
      .selectAll<SVGSVGElement, null>('svg.jupyterColorbar').data([null]);
    svg = svg.merge(svg.enter().append<SVGSVGElement>('svg')
      .attr('class', 'jupyterColorbar'));
    svg
      .attr('height', editorFn.minHeight() + (horizontal ? 20 : 10))
      .attr('width', editorFn.minWidth() + (horizontal ? 10 : 20));
    let g = svg.selectAll<SVGGElement, null>('g').data([null]);
    g = g.merge(g.enter().append('g'));
    g
      .attr('transform', `translate(${
        horizontal ? 10 : 5
      }, ${
        horizontal ? 5 : 10
      })`)
      .call(editorFn);
  }
}
