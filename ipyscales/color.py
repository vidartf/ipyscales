#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines color scale widget, and any supporting functions
"""

from traitlets import Float, Unicode, Bool, Enum
from ipywidgets import register, Dropdown, jslink, VBox

from .scale import Scale, SequentialScale, DivergingScale, OrdinalScale
from .continuous import LinearScale, LogScale
from .traittypes import FullColor, VarlenTuple


class ColorScale(Scale):
    """A common base class for color scales"""
    pass


@register
class LinearColorScale(LinearScale, ColorScale):
    """A color scale widget.

    The same as a LinearScale, but validates range as color.

    See d3-interpolate for a list of interpolator names
    to use. Default uses 'interpolateRgb' for colors.
    """
    _model_name = Unicode('LinearColorScaleModel').tag(sync=True)

    range = VarlenTuple(trait=FullColor(), default_value=('black', 'white'), minlen=2).tag(sync=True)

    def edit(self):
        from .colorbar import ColorMapEditor
        return ColorMapEditor(colormap=self)

@register
class LogColorScale(LogScale, ColorScale):
    """A logarithmic color scale widget.

    The same as a LogScale, but validates range as color.

    See d3-interpolate for a list of interpolator names
    to use. Default uses 'interpolateRgb' for colors.
    """
    _model_name = Unicode('LogColorScaleModel').tag(sync=True)

    range = VarlenTuple(trait=FullColor(), default_value=('black', 'white'), minlen=2).tag(sync=True)

    def edit(self):
        from .colorbar import ColorMapEditor
        return ColorMapEditor(colormap=self)



# List of valid colormap names 
# TODO: Write unit test that validates this vs the actual values in d3
seq_colormap_names = (
    "viridis",
    "inferno",
    "magma",
    "plasma",
    "warm",
    "cool",
    "cubehelixDefault",
    "rainbow",
    "sinebow",
    "blues",
    "greens",
    "greys",
    "oranges",
    "purples",
    "reds",
    "BuGn",
    "BuPu",
    "GnBu",
    "OrRd",
    "PuBuGn",
    "PuBu",
    "PuRd",
    "RdPu",
    "YlGnBu",
    "YlGn",
    "YlOrBr",
    "YlOrRd",
)

div_colormap_names = (
    "BrBG",
    "PRGn",
    "PiYG",
    "PuOr",
    "RdBu",
    "RdGy",
    "RdYlBu",
    "RdYlGn",
    "spectral",
)


@register
class NamedSequentialColorMap(SequentialScale, ColorScale):
    """A linear scale widget for colors, initialized from a named color map.
    """
    _model_name = Unicode('NamedContiguousColorMap').tag(sync=True)

    name = Enum(seq_colormap_names, "viridis").tag(sync=True)

    def dashboard(self):
        "Create linked widgets for this data."
        children = []

        w = Dropdown(
            value=self.name,
            options=seq_colormap_names,
            description="Name")
        jslink((w, "value"), (self, "name"))
        children.append(w)

        return VBox(children=children)


@register
class NamedDivergingColorMap(DivergingScale, ColorScale):
    """A linear scale widget for colors, initialized from a named color map.
    """
    _model_name = Unicode('NamedDivergingColorMap').tag(sync=True)

    name = Enum(div_colormap_names, "BrBG").tag(sync=True)

    def dashboard(self):
        "Create linked widgets for this data."
        children = []

        w = Dropdown(
            value=self.name,
            options=div_colormap_names,
            description="Name")
        jslink((w, "value"), (self, "name"))
        children.append(w)

        return VBox(children=children)
