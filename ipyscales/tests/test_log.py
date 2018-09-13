#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..log import LogScale


def test_logscale_creation_blank():
    w = LogScale()
