#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..continuous import LinearScale, LogScale, PowScale


def test_linearscale_creation_blank():
    LinearScale()


def test_logscale_creation_blank():
    w = LogScale()


def test_powscale_creation_blank():
    w = PowScale()
