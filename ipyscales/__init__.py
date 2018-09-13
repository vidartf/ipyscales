#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


from ._version import __version__, version_info

from .scale import Scale
from .linear import LinearScale
from .log import LogScale
from .color import LinearColorScale, LogColorScale

# do not import data widgets, to ensure optional dep. on ipydatawidget

from .nbextension import _jupyter_nbextension_paths


# deprecated:
LinearScaleWidget = LinearScale
ScaleWidget = Scale
