#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Scaled data widget.
"""

from ipywidgets import register, widget_serialization
from traitlets import Instance, Unicode, Undefined
from ipydatawidgets import DataUnion, data_union_serialization, NDArrayWidget

from .scale import Scale


@register
class ScaledArray(NDArrayWidget):
    """A widget that provides a scaled version of the array.

    The widget will compute the scaled version of the array on the
    frontend side in order to avoid re-transmission of data when
    only the scale changes.
    """

    _model_name = Unicode('ScaledArrayModel').tag(sync=True)

    scale = Instance(Scale).tag(sync=True, **widget_serialization)

    def __init__(self, array=Undefined, scale=Undefined, **kwargs):
        super(ScaledArray, self).__init__(array=array, scale=scale, **kwargs)
