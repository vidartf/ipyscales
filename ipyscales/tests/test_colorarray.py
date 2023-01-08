#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from traitlets import TraitError
import numpy as np

from ..colorarray import ArrayColorScale


def test_arraycolorscale_creation_blank():
    ArrayColorScale()


def test_arraycolorscale_accepts_2x3_list():
    ArrayColorScale(colors=[[0, 0, 0], [1, 1, 1]])


def test_arraycolorscale_accepts_2x4_list():
    ArrayColorScale(colors=[[0, 0, 0, 0.3], [1, 1, 1, 1.0]])


def test_arraycolorscale_fails_1x3_list():
    with pytest.raises(TraitError):
        ArrayColorScale(colors=[[0, 0, 0]])


def test_arraycolorscale_fails_1D_list():
    with pytest.raises(TraitError):
        ArrayColorScale(colors=[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1])


def test_arraycolorscale_fails_3D_list():
    with pytest.raises(TraitError):
        ArrayColorScale(colors=[[[0, 0, 0], [0, 0, 0]], [[1, 1, 1], [1, 1, 1]]])


def test_arraycolorscale_fails_2x2_list():
    with pytest.raises(TraitError):
        ArrayColorScale(colors=[[0, 0], [1, 1]])


def test_arraycolorscale_fails_2x5_list():
    with pytest.raises(TraitError):
        ArrayColorScale(colors=[[0, 0, 0, 0, 0], [1, 1, 1, 1, 1]])


def test_arraycolorscale_accepts_2x3_array():
    ArrayColorScale(colors=np.array([[0, 0, 0], [1, 1, 1]], dtype=float))


def test_arraycolorscale_accepts_2x4_array():
    ArrayColorScale(colors=np.array([[0, 0, 0, 0.3], [1, 1, 1, 1.0]]))


def test_arraycolorscale_accepts_hsl():
    ArrayColorScale(space="hsl")
