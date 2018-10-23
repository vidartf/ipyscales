#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Vidar Tonaas Fauske.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import DOMWidget, widget_serialization, register
from traitlets import Unicode, Instance, Enum, Float, Int
from .color import ColorScale
from ._frontend import module_name, module_version


class Base(DOMWidget):
    """A color bar widget, representing a color map"""

    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    colormap = Instance(ColorScale, allow_none=False).tag(sync=True, **widget_serialization)

    breadth = Int(30, min=1).tag(sync=True)
    border_thickness = Float(1.0).tag(sync=True)


@register
class ColorBar(Base):
    """A color bar widget, representing a color map"""

    _model_name = Unicode('ColorBarModel').tag(sync=True)
    _view_name = Unicode('ColorBarView').tag(sync=True)

    orientation = Enum(('vertical', 'horizontal'), 'vertical').tag(sync=True)
    side = Enum(('bottomright', 'topleft'), 'bottomright').tag(sync=True)

    length = Int(100, min=2).tag(sync=True)
    title = Unicode(None, allow_none=True).tag(sync=True)
    title_padding = Int(30).tag(sync=True)
    axis_padding = Int(None, allow_none=True).tag(sync=True)


@register
class ColorMapEditor(Base):
    """A color map editor widget"""

    _model_name = Unicode('ColorMapEditorModel').tag(sync=True)
    _view_name = Unicode('ColorMapEditorView').tag(sync=True)

    orientation = Enum(('vertical', 'horizontal'), 'horizontal').tag(sync=True)
    length = Int(300, min=2).tag(sync=True)
