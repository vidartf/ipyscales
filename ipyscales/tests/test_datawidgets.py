#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import TraitError, Undefined

from ..continuous import LinearScale
from ..datawidgets import ScaledArray


def test_scaled_creation_blank():
    with pytest.raises(TraitError):
        w = ScaledArray()


def test_scaled_creation():
    data = np.zeros((2, 4))
    scale = LinearScale()
    w = ScaledArray(data, scale)
    assert w.array is data
