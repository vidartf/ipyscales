#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines color scale widget, and any supporting functions
"""

from traitlets import Float, Unicode, Bool, CaselessStrEnum, Undefined
from ipywidgets import register, jslink, VBox

from .scale import Scale, SequentialScale, DivergingScale, OrdinalScale
from .continuous import LinearScale, LogScale
from .selectors import StringDropdown
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
    "Viridis",
    "Inferno",
    "Magma",
    "Plasma",
    "Warm",
    "Cool",
    "CubehelixDefault",
    "Rainbow",
    "Sinebow",
    "Blues",
    "Greens",
    "Greys",
    "Oranges",
    "Purples",
    "Reds",
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
    "Spectral",
)


@register
class NamedSequentialColorMap(SequentialScale, ColorScale):
    """A linear scale widget for colors, initialized from a named color map.
    """
    _model_name = Unicode('NamedSequentialColorMap').tag(sync=True)

    name = CaselessStrEnum(seq_colormap_names, "Viridis").tag(sync=True)

    def __init__(self, name="Viridis", **kwargs):
        super(NamedSequentialColorMap, self).__init__(name=name, **kwargs)

    def edit(self):
        "Create linked widgets for this data."
        children = []

        w = StringDropdown(
            value=self.name,
            options=seq_colormap_names,
            description="Name")
        jslink((self, "name"), (w, "value"))
        children.append(w)

        return VBox(children=children)


@register
class NamedDivergingColorMap(DivergingScale, ColorScale):
    """A linear scale widget for colors, initialized from a named color map.
    """
    _model_name = Unicode('NamedDivergingColorMap').tag(sync=True)

    name = CaselessStrEnum(div_colormap_names, "BrBG").tag(sync=True)

    def __init__(self, name="BrBG", **kwargs):
        super(NamedDivergingColorMap, self).__init__(name=name, **kwargs)

    def edit(self):
        "Create linked widgets for this data."
        children = []

        w = StringDropdown(
            value=self.name,
            options=div_colormap_names,
            description="Name")
        jslink((self, "name"), (w, "value"))
        children.append(w)

        return VBox(children=children)
