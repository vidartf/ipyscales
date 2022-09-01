// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/base';
import { ManagerBase } from '@jupyter-widgets/base-manager';
import * as services from '@jupyterlab/services';

let numComms = 0;


export class MockComm implements widgets.IClassicComm {
  constructor() {
    this.comm_id = `mock-comm-id-${numComms}`;
    numComms += 1;
  }

  on_close(fn: Function | null) {
    this._on_close = fn;
  }

  on_msg(fn: Function | null) {
    this._on_msg = fn;
  }

  _process_msg(msg: services.KernelMessage.ICommMsgMsg) {
    if (this._on_msg) {
      return this._on_msg(msg);
    } else {
      return Promise.resolve();
    }
  }

  open(data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string {
    if (this._on_open) {
      this._on_open();
    }
    return '';
  }

  close(data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string {
    if (this._on_close) {
      this._on_close();
    }
    return '';
  }

  send(data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): string {
    return '';
  }

  comm_id: string;
  target_name: string;
  _on_msg: Function | null = null;
  _on_close: Function | null = null;
  _on_open: Function | null = null;
}

export class DummyManager extends ManagerBase {
  constructor() {
    super();
    this.el = window.document.createElement('div');
  }

  display_view(msg: services.KernelMessage.IMessage, view: widgets.DOMWidgetView, options: any) {
    // TODO: make this a spy
    // TODO: return an html element
    return Promise.resolve(view).then(view => {
      this.el.appendChild(view.el);
      view.on('remove', () => console.log('view removed', view));
      return view.el;
    });
  }

  protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
    if (moduleName === '@jupyter-widgets/base') {
      if ((widgets as any)[className]) {
        return Promise.resolve((widgets as any)[className]);
      } else {
        return Promise.reject(`Cannot find class ${className}`)
      }
    } else if (moduleName === 'jupyter-scales') {
      if (this.testClasses[className]) {
        return Promise.resolve(this.testClasses[className]);
      } else {
        return Promise.reject(`Cannot find class ${className}`)
      }
    } else {
      return Promise.reject(`Cannot find module ${moduleName}`);
    }
  }

  _get_comm_info() {
    return Promise.resolve({});
  }

  _create_comm(comm_target_name: string, model_id: string, data?: any, metadata?: any, buffers?: ArrayBuffer[] | ArrayBufferView[]): Promise<widgets.IClassicComm> {
    return Promise.resolve(new MockComm());
  }

  el: HTMLElement;
  testClasses: { [key: string]: any } = {};
}


export interface Constructor<T> {
  new (attributes?: any, options?: any): T;
}


export function createTestModel<T extends widgets.WidgetModel>(
  constructor: Constructor<T>,
  attributes?: any,
  widget_manager?: widgets.WidgetModel['widget_manager'],
): T {

  let id = widgets.uuid();
  let modelOptions = {
    widget_manager: widget_manager || new DummyManager(),
    model_id: id,
  }

  return new constructor(attributes, modelOptions);

}


export async function createTestModelFromSerialized<T extends widgets.WidgetModel>(
  constructor: Constructor<T>,
  state?: any,
  widget_manager?: widgets.WidgetModel['widget_manager'],
): Promise<T> {
  widget_manager = widget_manager || new DummyManager();
  let attributes = await (constructor as any)._deserialize_state(state, widget_manager);

  return createTestModel(constructor, attributes, widget_manager);
}


export function createTestView<T extends widgets.WidgetView>(
  model: widgets.WidgetModel,
  viewCtor: Constructor<T>
): Promise<T> {

  let mgr = model.widget_manager as DummyManager;
  mgr.testClasses[model.get('_view_name')] = viewCtor;
  return model.widget_manager.create_view(model, undefined) as any;

}
