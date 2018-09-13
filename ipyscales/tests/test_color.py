#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from traitlets import TraitError

from ..color import LinearColorScale, LogColorScale


def test_lincolorscale_creation_blank():
    LinearColorScale()


def test_lincolorscale_accepts_hex():
    # Should accept rgb, rrggbb, rgba, rrggbbaa
    LinearColorScale(range=['#aaa', '#ffffff', '#aaaa', '#ffffffff'])

def test_lincolorscale_accepts_rgba():
    LinearColorScale(range=[
        'rgb(0, 0, 0)', #rgb
        'rgb( 20,70,50 )', #rgb with spaces
        'rgba(10,10,10, 0.5)', #rgba with float
        'rgba(255, 255, 255, 255)']) # alpha will be clamped to 1

def test_lincolorscale_rejects_floats():
    with pytest.raises(TraitError):
        LinearColorScale(range=[1.2, 2.78])

def test_lincolorscale_rejects_ints():
    with pytest.raises(TraitError):
        LinearColorScale(range=[1, 2])


def test_logcolorscale_creation_blank():
    LogColorScale()
