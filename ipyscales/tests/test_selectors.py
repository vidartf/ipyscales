#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Vidar Tonaas Fauske.
# Distributed under the terms of the Modified BSD License.

import pytest

from ipywidgets import Widget
from traitlets import TraitError

from ..selectors import StringDropdown, WidgetDropdown


def test_stringsel_creation_blank():
    with pytest.raises(TypeError):
        StringDropdown()

def test_stringsel_creation():
    w = StringDropdown(('A', 'B', 'C'))
    assert w.value == 'A'

def test_stringsel_valid_change():
    w = StringDropdown(('A', 'B', 'C'))
    w.value = 'B'
    assert w.value == 'B'

def test_stringsel_invalid_change():
    w = StringDropdown(('A', 'B', 'C'))
    with pytest.raises(TraitError):
        w.value = 'D'



def test_widgetsel_creation_blank():
    with pytest.raises(TypeError):
        WidgetDropdown()

A = Widget()
B = Widget()
C = Widget()

def test_widgetsel_creation():
    w = WidgetDropdown(dict(A=A, B=B, C=C))
    assert w.value == A

def test_widgetsel_valid_change():
    w = WidgetDropdown(dict(A=A, B=B, C=C))
    w.value = B
    assert w.value == B

def test_widgetsel_invalid_change():
    w = WidgetDropdown(dict(A=A, B=B, C=C))
    with pytest.raises(TraitError):
        w.value = Widget()
