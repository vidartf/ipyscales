#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defiens a scale widget base class, and any supporting functions
"""

from ipywidgets import Widget, register
from traitlets import Unicode, CFloat, Bool, Tuple, Any, Undefined

from ._frontend import module_name, module_version

from .traittypes import VarlenTuple


# TODO: Add and use an interpolator trait (Enum tested agaisnt d3)


class Scale(Widget):
    """A scale widget.

    This should be treated as an abstract class, and should
    not be directly instantiated.
    """
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)


class SequentialScale(Scale):
    """A sequential scale widget.
    """

    domain = Tuple(
        (CFloat(), ) * 2,
        default_value=(0., 1.),
    ).tag(sync=True)

    clamp = Bool(False).tag(sync=True)


class DivergingScale(Scale):
    """A diverging scale widget.
    """

    domain = Tuple(
        (CFloat(), ) * 3,
        default_value=(0., 0.5, 1.),
    ).tag(sync=True)

    clamp = Bool(False).tag(sync=True)


@register
class QuantizeScale(Scale):
    """A quantized scale widget.
    """
    _model_name = Unicode('QuantizeScaleModel').tag(sync=True)

    domain = Tuple(
        (CFloat(), ) * 2,
        default_value=(0., 1.),
    ).tag(sync=True)

    range = VarlenTuple(
        trait=Any(),
        default_value=(0., 1.),
        minlen=2,
    ).tag(sync=True)


@register
class QuantileScale(Scale):
    """A quantile scale widget.
    """
    _model_name = Unicode('QuantileScaleModel').tag(sync=True)

    domain = VarlenTuple(
        trait=CFloat(),
        default_value=(0,),
        minlen=1,
    ).tag(sync=True)

    range = VarlenTuple(
        trait=Any(),
        default_value=(0,),
        minlen=1,
    ).tag(sync=True)


@register
class TresholdScale(Scale):
    """A treshold scale widget.
    """
    _model_name = Unicode('TresholdScaleModel').tag(sync=True)

    domain = VarlenTuple(
        trait=Any(),
        default_value=(),
        minlen=0,
    ).tag(sync=True)

    range = VarlenTuple(
        trait=Any(),
        default_value=(0,),
        minlen=1,
    ).tag(sync=True)


@register
class OrdinalScale(Scale):
    """An ordinal scale widget.
    """
    _model_name = Unicode('OrdinalScaleModel').tag(sync=True)

    domain = VarlenTuple(
        trait=Any(),
        default_value=None,
        minlen=0,
        allow_none=True,
    ).tag(sync=True)

    range = VarlenTuple(
        trait=Any(),
        default_value=(),
        minlen=0,
    ).tag(sync=True)

    unknown = Any(Undefined).tag(sync=True)
