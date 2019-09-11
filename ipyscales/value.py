#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines a widget for getting a scaled value client-side.
"""

from ipywidgets import Widget, register, widget_serialization
from traitlets import Unicode, Instance, Union, Any, Undefined

from ._frontend import module_name, module_version
from .scale import Scale


@register
class ScaledValue(Widget):
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _model_name = Unicode("ScaledValueModel").tag(sync=True)

    scale = Instance(Scale).tag(sync=True, **widget_serialization)

    input = Union(
        [Instance("ipyscales.ScaledValue"), Any()],
        allow_none=True,
        help="The input to be scaled. If set to another ScaledValue, it will use its output as the input.",
    ).tag(sync=True, **widget_serialization)

    output = Any(
        None,
        allow_none=True,
        read_only=True,
        help="Placeholder trait for linking with ipywidgets.jslink(). Not synced.",
    ).tag(
        sync=True
    )  # Not actually synced, even if sync=True
