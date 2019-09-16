#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from traitlets import TraitError

from ..color import (
    LinearColorScale,
    LogColorScale,
    NamedSequentialColorMap,
    NamedDivergingColorMap,
    NamedOrdinalColorMap,
)
from ..colorbar import ColorMapEditor


def test_lincolorscale_creation_blank():
    LinearColorScale()


def test_lincolorscale_accepts_hex():
    # Should accept rgb, rrggbb, rgba, rrggbbaa
    LinearColorScale(range=["#aaa", "#ffffff", "#aaaa", "#ffffffff"])


def test_lincolorscale_accepts_rgba():
    LinearColorScale(
        range=[
            "rgb(0, 0, 0)",  # rgb
            "rgb( 20,70,50 )",  # rgb with spaces
            "rgba(10,10,10, 0.5)",  # rgba with float
            "rgba(255, 255, 255, 255)",
        ]
    )  # alpha will be clamped to 1


def test_lincolorscale_rejects_invalid_strings():
    with pytest.raises(TraitError):
        LinearColorScale(range=["foo", "#a5312"])


def test_lincolorscale_rejects_floats():
    with pytest.raises(TraitError):
        LinearColorScale(range=[1.2, 2.78])


def test_lincolorscale_rejects_ints():
    with pytest.raises(TraitError):
        LinearColorScale(range=[1, 2])


def test_lincolorscale_edit():
    w = LinearColorScale()
    editor = w.edit()
    assert isinstance(editor, ColorMapEditor)
    assert editor.colormap == w


def test_logcolorscale_creation_blank():
    LogColorScale()


def test_logcolorscale_edit():
    w = LogColorScale()
    editor = w.edit()
    assert isinstance(editor, ColorMapEditor)
    assert editor.colormap == w


def test_named_sequential_colorscale_creation_blank():
    NamedSequentialColorMap()


def test_named_sequential_colorscale_creation_valid():
    w = NamedSequentialColorMap("Rainbow")
    assert w.name == "Rainbow"


def test_named_sequential_colorscale_creation_invalid():
    with pytest.raises(TraitError):
        NamedSequentialColorMap("Spectral")


def test_named_sequential_colorscale_edit():
    w = NamedSequentialColorMap()
    editor = w.edit()
    # just check that no exceptions are raised


def test_named_diverging_colorscale_creation_blank():
    NamedDivergingColorMap()


def test_named_diverging_colorscale_creation_valid():
    w = NamedDivergingColorMap("Spectral")
    assert w.name == "Spectral"


def test_named_diverging_colorscale_creation_invalid():
    with pytest.raises(TraitError):
        NamedDivergingColorMap("Rainbow")


def test_named_diverging_colorscale_edit():
    w = NamedDivergingColorMap()
    editor = w.edit()
    # just check that no exceptions are raised


def test_named_ordinal_colorscale_creation_blank():
    w = NamedOrdinalColorMap()
    assert w.name == "Category10"
    assert w.cardinality == 10


def test_named_ordinal_colorscale_creation_valid_fixed():
    w = NamedOrdinalColorMap("Accent")
    assert w.name == "Accent"
    assert w.cardinality == 8


def test_named_ordinal_colorscale_creation_valid_free():
    for i in range(3, 12):
        w = NamedOrdinalColorMap("RdBu", i)
        assert w.name == "RdBu"
        assert w.cardinality == i


def test_named_ordinal_colorscale_creation_invalid_free():
    with pytest.raises(TraitError):
        NamedOrdinalColorMap("RdBu", 2)
    with pytest.raises(TraitError):
        NamedOrdinalColorMap("RdBu", 20)


def test_named_ordinal_colorscale_creation_fixed_ignores():
    w = NamedOrdinalColorMap("Accent", 25)
    assert w.cardinality == 8


def test_named_ordinal_colorscale_cardinality_changes():
    w = NamedOrdinalColorMap("Accent", 25)
    assert w.cardinality == 8
    w.name = "Category10"
    assert w.cardinality == 10


def test_named_ordinal_colorscale_cardinality_untouched():
    w = NamedOrdinalColorMap("Accent", 25)
    assert w.cardinality == 8
    w.name = "RdBu"
    assert w.cardinality == 8


def test_named_ordinal_colorscale_creation_invalid_name():
    with pytest.raises(TraitError):
        NamedOrdinalColorMap("Foobar")
    with pytest.raises(TraitError):
        NamedOrdinalColorMap("Viridis")
