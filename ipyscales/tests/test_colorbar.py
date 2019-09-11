#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Vidar Tonaas Fauske.
# Distributed under the terms of the Modified BSD License.

import pytest

from traitlets import TraitError

from ..color import LinearColorScale
from ..colorbar import ColorBar


def test_colorbar_creation_blank():
    with pytest.raises(TraitError):
        ColorBar()


def test_colorbar_creation():
    colormap = LinearColorScale(range=("red", "blue"))
    w = ColorBar(colormap=colormap)
    assert w.colormap is colormap
