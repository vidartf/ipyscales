#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from traitlets import TraitError, Undefined

from ..continuous import LinearScale
from ..value import ScaledValue


def test_scaled_creation_blank():
    with pytest.raises(TraitError):
        w = ScaledValue()


def test_scaled_creation():
    scale = LinearScale()
    w = ScaledValue(input=5, scale=scale)
    assert w.input is 5
    assert w.scale is scale
