#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines array color scale widget, and any supporting functions
"""

from traitlets import Unicode, TraitError, Undefined, Enum, CFloat
from ipywidgets import register
from ipydatawidgets import DataUnion, data_union_serialization

from .color import ColorScale
from .scale import SequentialScale


def minlen_validator(minlen):
    def validator(trait, value):
        if value.shape[0] < minlen:
            raise TraitError('%s needs have a minimum length of %d, got %d' % (
                trait.name, minlen, len(value)
            ))
    return validator


def color_array_shape_validator(trait, value):
    if value is None or value is Undefined:
        return value
    if len(value.shape) != 2:
        raise TraitError('%s shape expected to have 2 components, but got shape %s' % (
            trait.name, value.shape))
    if not (3 <= value.shape[-1] <= 4):
        raise TraitError('Expected %s to have 3 or 4 elements for the last dimension of its shape, but got %d' % (
            trait.name, value.shape[-1]
        ))
    return value


def color_array_minlen_validator(minlen):
    len_val = minlen_validator(minlen)
    def validator(trait, value):
        value = color_array_shape_validator(trait, value)
        return len_val(trait, value)
    return validator


@register
class ArrayColorScale(SequentialScale, ColorScale):
    """A sequential color scale with array domain/range.
    """
    _model_name = Unicode('ArrayColorScaleModel').tag(sync=True)

    def __init__(self, colors=Undefined, space='rgb', gamma=1.0, **kwargs):
        if colors is not Undefined:
            kwargs['colors'] = colors
        super(ArrayColorScale, self).__init__(space=space, gamma=gamma, **kwargs)

    colors = DataUnion(
        [[0, 0, 0], [1, 1, 1]],  # [black, white]
        shape_constraint=color_array_minlen_validator(2),
        help='An array of RGB(A) or HSL(A) values, normalized between 0 and 1.'
    ).tag(sync=True, **data_union_serialization)

    space = Enum(
        ['rgb', 'hsl'],
        'rgb',
        help='The color space of the range.'
    ).tag(sync=True)

    gamma = CFloat(
        1.0,
        help='Gamma to use if interpolating in RGB space.'
    ).tag(sync=True)
