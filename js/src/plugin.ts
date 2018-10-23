// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Application, IPlugin
} from '@phosphor/application';

import {
  Widget
} from '@phosphor/widgets';

import {
  Token
} from '@phosphor/coreutils';

import * as scales from '.';

import {
  IJupyterWidgetRegistry, ExportMap
} from "@jupyter-widgets/base";

import '../styles/plugin.css';


const EXTENSION_ID = 'jupyter.extensions.jupyter-scales'


/**
 * The token identifying the JupyterLab plugin.
 */
export const IJupyterScales = new Token<IJupyterScales>(EXTENSION_ID);

/**
 * The type of the provided value of the plugin in JupyterLab.
 */
export interface IJupyterScales {
};


/**
 * The notebook diff provider.
 */
const scalesProvider: IPlugin<Application<Widget>, IJupyterScales> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default scalesProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: Application<Widget>, widgetsManager: IJupyterWidgetRegistry): IJupyterScales {
  widgetsManager.registerWidget({
      name: 'jupyter-scales',
      version: scales.version,
      exports: scales as any as ExportMap,   // Typing isn't smart enough here
    });
  return {};
}
