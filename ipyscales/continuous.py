#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines linear scale widget, and any supporting functions
"""

from traitlets import Float, CFloat, Unicode, List, Union, Bool, Any, Instance
from ipywidgets import Color, register, DOMWidget, widget_serialization

from ._frontend import module_name, module_version
from .scale import Scale
from .traittypes import VarlenTuple


class ContinuousScale(Scale):
    """A continuous scale widget.

    This should be treated as an abstract class, and should
    not be directly instantiated.
    """

    domain = VarlenTuple(
        trait=CFloat(),
        default_value=(0., 1.),
        minlen=2,
    ).tag(sync=True)

    range = VarlenTuple(trait=Any(), default_value=(0., 1.), minlen=2).tag(sync=True)

    interpolator = Unicode('interpolate').tag(sync=True)
    clamp = Bool(False).tag(sync=True)

    def edit(self):
        return ContinuousScaleEditor(scale=self)


@register
class LinearScale(ContinuousScale):
    """A linear scale widget.

    See the documentation for d3-scale's linear for
    further details.
    """
    _model_name = Unicode('LinearScaleModel').tag(sync=True)


@register
class LogScale(ContinuousScale):
    """A logarithmic scale widget.

    See the documentation for d3-scale's scaleLog for
    further details.
    """
    _model_name = Unicode('LogScaleModel').tag(sync=True)

    base = Float(10).tag(sync=True)

@register
class PowScale(ContinuousScale):
    """A power scale widget.

    See the documentation for d3-scale's scaleLog for
    further details.
    """
    _model_name = Unicode('PowScaleModel').tag(sync=True)

    exponent = Float(1).tag(sync=True)



@register
class ContinuousScaleEditor(DOMWidget):
    """A continuous scale editor widget"""

    _model_name = Unicode('ContinuousScaleEditorModel').tag(sync=True)
    _view_name = Unicode('ContinuousScaleEditorView').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    scale = Instance(ContinuousScale, allow_none=False).tag(sync=True, **widget_serialization)
