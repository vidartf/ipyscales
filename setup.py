#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function

# the name of the project
name = 'ipyscales'

import sys

#-----------------------------------------------------------------------------
# get on with it
#-----------------------------------------------------------------------------

import io
import os
from glob import glob

from setuptools import setup, find_packages

from setupbase import (create_cmdclass, install_npm, ensure_targets,
    combine_commands, ensure_python, get_version)

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
js_dir = pjoin(here, 'js')

ensure_python(['2.7', '>=3.4'])

version = get_version(pjoin(here, name, '_version.py'))

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(here, name, 'nbextension', 'static', 'extension.js'),
    os.path.join(here, 'js', 'lib', 'index.js'),
    os.path.join(here, 'js', 'lib', 'plugin.js'),
]


package_data = {
    name: [
        'nbextension/static/*.*',
    ]
}


data_spec = [
    ('share/jupyter/nbextensions/jupyter-scales',
     name + '/nbextension/static',
     '*.js'),
    ('share/jupyter/lab/extensions',
     'js/lab',
     '*.tgz'),
    ('etc/jupyter',
     'jupyter-config',
     '**/*.json'),
]


cmdclass = create_cmdclass('js', data_files_spec=data_spec)
cmdclass['js'] = combine_commands(
    install_npm(js_dir, build_targets=jstargets, sources=js_dir),
    ensure_targets(jstargets),
)


setup_args = dict(
    name            = name,
    description     = 'A widget library for scales',
    version         = version,
    scripts         = glob(pjoin('scripts', '*')),
    cmdclass        = cmdclass,
    packages        = find_packages(here),
    package_data    = package_data,
    author          = 'Jupyter Development Team',
    author_email    = 'jupyter@googlegroups.com',
    url             = 'https://github.com/vidartf/ipyscales',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'Widgets', 'IPython'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Framework :: Jupyter',
    ],
)


setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipywidgets>=7.0.0',
]

extras_require = setuptools_args['extras_require'] = {
    'test': [
        'pytest>=3.6',
        'pytest-cov',
        'nbval',
        'ipydatawidgets>=4.0',
    ],
    'examples': [
        'ipydatawidgets>=4.0',
    ],
    'docs': [
        'sphinx>=1.5',
        'recommonmark',
        'sphinx_rtd_theme',
        'nbsphinx>=0.2.13',
        'jupyter_sphinx',
        'nbsphinx-link>=1.1.1',
        'pypandoc',
    ],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

    setup_args.pop('scripts', None)

    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
