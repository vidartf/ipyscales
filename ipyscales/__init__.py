#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


from ._version import __version__, version_info

from .scale import ScaleWidget
from .linear import LinearScaleWidget

from .nbextension import _jupyter_nbextension_paths
