#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines color scale widget, and any supporting functions
"""

from traitlets import (
    Float, Unicode, Bool, CaselessStrEnum, Undefined, Int,
    TraitError, observe, validate
)
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

scheme_only_colormaps = {
    # Name: fixed cardinality
    'Category10': 10,
    'Accent': 8,
    'Dark2': 8,
    'Paired': 12,
    'Pastel1': 9,
    'Pastel2': 8,
    'Set1': 9,
    'Set2': 8,
    'Set3': 12,
}

# These sequential scales do not have a discreet variant:
non_scheme_sequential = (
    'CubehelixDefault',
    'Rainbow',
    'Warm',
    'Cool',
    'Sinebow',
    'Viridis',
    'Magma',
    'Inferno',
    'Plasma',
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


@register
class NamedOrdinalColorMap(OrdinalScale, ColorScale):
    """An ordinal scale widget for colors, initialized from a named color map.
    """

    _model_name = Unicode('NamedOrdinalColorMap').tag(sync=True)

    name = CaselessStrEnum(
        sorted(
            set(scheme_only_colormaps.keys()) |
            (set(seq_colormap_names) - set(non_scheme_sequential)) |
            set(div_colormap_names)
        ),
        "Category10"
    ).tag(sync=True)

    cardinality = Int(10, min=3, max=12).tag(sync=True)

    def __init__(self, name="Category10", cardinality=Undefined, **kwargs):
        # Ensure correct N if fixed length scheme is used:
        try:
            cardinality = scheme_only_colormaps[name]
        except KeyError:
            pass
        super(NamedOrdinalColorMap, self).__init__(name=name, cardinality=cardinality, **kwargs)

    @observe('name', type='change')
    def _on_name_change(self, change):
        # Ensure that N gets updated if fixed length scheme is used:
        try:
            self.cardinality = scheme_only_colormaps[change['new']]
        except KeyError:
            pass

    # Range is fixed by colormap name:
    range = None

    def edit(self):
        "Create linked widgets for this data."
        children = []

        w = StringDropdown(
            value=self.name,
            options=NamedOrdinalColorMap.name.values,
            description="Name")
        jslink((self, "name"), (w, "value"))
        children.append(w)

        return VBox(children=children)
