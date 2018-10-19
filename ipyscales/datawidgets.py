#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Scaled data widget.
"""

from ipywidgets import register, widget_serialization
from traitlets import Instance, Unicode, Undefined, Union
from ipydatawidgets import (
    DataUnion, data_union_serialization, NDArraySource,
    NDArrayBase
)

from .scale import Scale
from .color import ColorScale
from ._frontend import module_name, module_version


@register
class ScaledArray(NDArraySource):
    """A widget that provides a scaled version of the array.

    The widget will compute the scaled version of the array on the
    frontend side in order to avoid re-transmission of data when
    only the scale changes.
    """

    _model_name = Unicode('ScaledArrayModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)

    data = DataUnion(
        help='The data to scale.'
    ).tag(sync=True, **data_union_serialization)

    scale = Instance(Scale).tag(sync=True, **widget_serialization)

    # TODO: Use Enum instead of free-text:
    output_dtype = Unicode('inherit').tag(sync=True)

    def __init__(self, data=Undefined, scale=Undefined, **kwargs):
        super(ScaledArray, self).__init__(data=data, scale=scale, **kwargs)

    def _get_dtype(self):
        if self.output_dtype == 'inherit':
            return self.data.dtype
        return self.output_dtype

    def _get_shape(self):
        if isinstance(self.scale, ColorScale):
            return self.data.shape + (4,)
        return self.data.shape
