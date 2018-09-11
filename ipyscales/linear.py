#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines linear scale widget, and any supporting functions
"""

from traitlets import CFloat, Unicode, List, Union, Bool

from .scale import ScaleWidget
from .traittypes import FullColor

class VarlenTuple(List):
    klass = tuple
    _cast_types = (list,)

class LinearScaleWidget(ScaleWidget):
    """A linear scale widget.

    See the documentation for d3-scale's linear for
    further details.
    """
    _model_name = Unicode('LinearScaleModel').tag(sync=True)

    domain = VarlenTuple(trait=CFloat(), default_value=(0., 1.), minlen=2).tag(sync=True)
    range = VarlenTuple(trait=Union((CFloat(), FullColor())), default_value=(0., 1.), minlen=2).tag(sync=True)

    interpolator = Unicode('interpolate').tag(sync=True)
    clamp = Bool(False).tag(sync=True)
