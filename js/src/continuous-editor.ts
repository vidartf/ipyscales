// Copyright (c) Vidar Tonaas Fauske.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView, ISerializers, WidgetModel, unpack_models
} from '@jupyter-widgets/base';

import {extent, merge, zip, range as genRange} from 'd3-array';

import {
  Axis, axisBottom, axisLeft, AxisDomain
} from 'd3-axis';

import { select, Selection } from 'd3-selection';

import { line, symbol, symbolCircle } from 'd3-shape';

import {
  version, moduleName
} from './version';

import {
  ContinuousScaleModel
} from './continuous'
import { scaleLinear, ScaleContinuousNumeric } from 'd3-scale';



export interface ContinuousScale {
  copy(): this;
  domain(domain: number[]): this;
  domain(): number[];
  range(range: number[]): this;
  range(): number[];
  (value: number | { valueOf(): number }): number;
}


export class ContinuousScaleEditorModel extends DOMWidgetModel {
  defaults() {
    return {...super.defaults(),
      _model_name: ContinuousScaleEditorModel.model_name,
      _model_module: ContinuousScaleEditorModel.model_module,
      _model_module_version: ContinuousScaleEditorModel.model_module_version,
      _view_name: ContinuousScaleEditorModel.view_name,
      _view_module: ContinuousScaleEditorModel.view_module,
      _view_module_version: ContinuousScaleEditorModel.view_module_version,

      scale: null,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.setupListeners();
  }

  setupListeners() {
    // register listener for current child value
    const childAttrName = 'scale';
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
      scale: {deserialize: unpack_models}
    }

  static model_name = 'ContinuousScaleEditorModel';
  static model_module = moduleName;
  static model_module_version = version;
  static view_name = 'ContinuousScaleEditorView';
  static view_module = moduleName;
  static view_module_version = version;
}


export class ContinuousScaleEditorView extends DOMWidgetView {
  render() {
    this.onChange();
    this.model.on('change', this.onChange, this);
    this.model.on('childchange', this.onChange, this);
    (this.el as HTMLElement).classList.add('jupyterContinuousEditor');
  }

  onChange() {
    const scaleModel = this.model.get('scale') as ContinuousScaleModel;
    const horizontal = this.model.get('orientation') === 'horizontal';

    select(this.el).data([null])
      .call(this.editor
        .scale(this.model.get('scale').obj)
        .onUpdate(this.onEdit.bind(this)));
  }

  onEdit(save: boolean) {
    // Sync back all changes to both server and here
    const scale = this.model.get('scale') as ContinuousScaleModel;
    scale.syncToModel({});
    if (save) {
      scale.save_changes();
    }
  }

  editor = continuousEditor();
}

type EditorSelection<Datum> = Selection<HTMLDivElement, Datum, any, any>;

interface ContinuousEditor {

  /**
   * Render the color bar to the given context.
   *
   * @param context A selection of SVG containers (either SVG or G elements).
   */
  (context: EditorSelection<unknown>): void;

  /**
   * Gets the current scale used for color lookup.
   */
  scale(): ContinuousScale;

  /**
   * Sets the scale and returns the color bar.
   *
   * @param scale The scale to be used for color lookup.
   */
  scale(scale: ContinuousScale): this;

  onUpdate(): ((save: boolean) => void) | null;
  onUpdate(value: ((save: boolean) => void) | null): this;
};

function continuousEditor(): ContinuousEditor {

  let scale: ContinuousScale;
  let onUpdate: ((save: boolean) => void) | null = null;

  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const xScale = scaleLinear()
    .range([0, width]);
  let yScale: ContinuousScale;

  const xAxis = axisBottom(xScale);
  let yAxis: Axis<AxisDomain>;
  const marker = symbol()
    .type(symbolCircle);

  const valueline = line<number>()
    .x(function(d) { return xScale(d); })
    .y(function(d) { return yScale(scale(d)); });

  const continuousEditor: any = (selection: EditorSelection<unknown>): void => {
    const domain = scale ? scale.domain() : [0, 0];
    const range = scale ? scale.range() : [0, 0];

    // Update the scales:
    xScale.domain(extent(domain) as [number, number]);
    yScale.domain(extent(range) as [number, number]);

    // Ensure SVG root:
    let svg = selection.selectAll('svg').data([null]);
    svg.exit().remove();
    const newSvg = svg.enter().append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    svg = svg.merge(newSvg);

    const newRoot = newSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    newRoot.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    newRoot.append('g')
      .attr('class', 'y-axis');

    newRoot.append('path')
      .attr('class', 'line')
      .attr("fill", "none");

    const root = svg.select('g');

    root.select('g.x-axis').call(xAxis);
    root.select('g.y-axis').call(yAxis);
    const de = extent(domain) as [number, number];
    root.select('path.line')
      .data([genRange(de[0], de[1], (de[1] - de[0]) / width)]) // [domain]
      .attr('d', valueline);

    let points = root.selectAll("path.points")
      .data(domain)
    points.exit().remove();
    points = points.merge(points.enter().append('path')
      .attr('class', 'points'));
    points
      .attr("d", marker)
      .attr("transform", function(d) {
        return `translate(${xScale(d)},${yScale(scale(d))})`;
      });


    // Ensure edit root:
    let edit = selection.selectAll('div').data([null]);
    edit.exit().remove();
    edit = edit.merge(edit.enter().append('div'));

    let entries = edit.selectAll('span').data(
      merge<number>(zip(domain, range))
    );
    entries.exit().remove();
    const newEntries = entries.enter().append('span');
    newEntries.append('label');
    newEntries.append('input')
      .attr('type', 'number')
      .attr('value', d => d);

    entries = entries.merge(newEntries)
      .attr('class', (d, i) => i % 2 ? 'range' : 'domain');

    const domainEntries = edit.selectAll('span.domain');
    const rangeEntries = edit.selectAll('span.range');

    domainEntries.select('label').text('Domain:');
    rangeEntries.select('label').text('Range:');

    domainEntries.select('input')
      .attr('min', (d, i) => domain[i - 1] || '')
      .attr('max', (d, i) => domain[i + 1] || '')
      .on('change', function(d, i) {
        domain[i] = parseFloat((this as HTMLInputElement).value);
        scale.domain(domain);
        _change();
      });

    rangeEntries.select('input')
      .attr('min', (d, i) => range[i - 1] || '')
      .attr('max', (d, i) => range[i + 1] || '')
      .on('change', function(d, i) {
        range[i] = parseFloat((this as HTMLInputElement).value);
        scale.range(range);
        _change();
      });

  };

  function _change() {
    if (onUpdate) {
      onUpdate(true)
    }
  }

  continuousEditor.scale = function(_: any) {
    if (arguments.length) {
      scale = _;
      yScale = scale.copy()
        .range([height, 0]);
      yAxis = axisLeft(yScale);
      return continuousEditor;
    }
    return scale;
  };

  continuousEditor.onUpdate = function(_: any) {
    return arguments.length ? (onUpdate = _, continuousEditor) : onUpdate;
  };


  return continuousEditor;
}
