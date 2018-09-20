#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines radial scale widget, and any supporting functions
"""

from math import tau

from traitlets import CFloat, Unicode, Enum, Instance
from ipywidgets import register

from .continuous import ContinuousScale
from .traittypes import VarlenTuple


@register
class RadialScale(ContinuousScale):
    """A radial scale widget.

    Similar to a linear scale, but
    """
    _model_name = Unicode('RadialScaleModel').tag(sync=True)

    def __init__(self, base=None, **kwargs):
        super(RadialScale, self).__init__(**kwargs)
        self.set_trait('_base', base)

    domain = VarlenTuple(
        trait=CFloat(),
        default_value=(0., 360.),
        minlen=2,
    ).tag(sync=True)

    range = VarlenTuple(
        trait=CFloat(),
        default_value=(0., tau),
        minlen=2
    ).tag(sync=True)

    unit = Enum(('deg', 'rad', 'grad'), 'deg', allow_none=True).tag(sync=True)

    _base = Instance(ContinuousScale, allow_none=True, read_only=True).tag(sync=True)
