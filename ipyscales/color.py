#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines color scale widget, and any supporting functions
"""

from traitlets import Float, Unicode, Bool, Enum

from .scale import Scale
from .linear import LinearScale
from .log import LogScale
from .traittypes import FullColor, VarlenTuple


class ColorScale(Scale):
    """A common base class for color scales"""
    pass


class LinearColorScale(LinearScale, ColorScale):
    """A color scale widget.

    The same as a LinearScale, but validates range as color.

    See d3-interpolate for a list of interpolator names
    to use. Default uses 'interpolateRgb' for colors.
    """
    range = VarlenTuple(trait=FullColor(), default_value=('black', 'white'), minlen=2).tag(sync=True)


class LogColorScale(LogScale, ColorScale):
    """A logarithmic color scale widget.

    The same as a LogScale, but validates range as color.

    See d3-interpolate for a list of interpolator names
    to use. Default uses 'interpolateRgb' for colors.
    """
    range = VarlenTuple(trait=FullColor(), default_value=('black', 'white'), minlen=2).tag(sync=True)

