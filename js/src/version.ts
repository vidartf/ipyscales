// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

const data = require('../package.json') as any;

/**
 * The current package version.
 */
export const version = data.version;

/**
 * The package name.
 */
export const moduleName = data.name;
