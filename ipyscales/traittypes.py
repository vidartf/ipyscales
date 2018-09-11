#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Defines some trait types used by ipsycales
"""

import re

from ipywidgets import Color
from traitlets import TraitError

_color_hexa_re = re.compile(r'^#[a-fA-F0-9]{4}(?:[a-fA-F0-9]{4})?$')

_color_frac_percent = r'\s*(\d+(\.\d*)|\.\d+)?%?\s*'
_color_int_percent = r'\s*\d+%?\s*'

_color_rgb = r'rgb\({ip},{ip},{ip}\)'
_color_rgba = r'rgba\({ip},{ip},{ip},{fp}\)'
_color_hsl = r'hsl\({fp},{fp},{fp}\)'
_color_hsla = r'hsla\({fp},{fp},{fp},{fp}\)'

_color_rgbhsl_re = re.compile('({0})|({1})|({2})|({3})'.format(
    _color_rgb, _color_rgba, _color_hsl, _color_hsla
).format(ip=_color_int_percent, fp=_color_frac_percent))


class FullColor(Color):

    def validate(self, obj, value):
        try:
            return super(FullColor, self).validate(obj, value)
        except TraitError:
            if _color_hexa_re.match(value) or _color_rgbhsl_re.match(value):
                return value
            raise
        self.error(obj, value)
