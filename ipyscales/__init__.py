#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


from ._version import __version__, version_info

from .scale import (
    Scale, SequentialScale, DivergingScale, QuantizeScale,
    QuantileScale, TresholdScale, OrdinalScale,
)
from .continuous import (
    ContinuousScale, LinearScale, LogScale, PowScale,
)
from .color import (
    ColorScale, LinearColorScale, LogColorScale,
    NamedSequentialColorMap, NamedDivergingColorMap,
    NamedOrdinalColorMap
)
from .colorbar import ColorBar, ColorMapEditor
from .value import ScaledValue

# do not import data widgets, to ensure optional dep. on ipydatawidget

from .nbextension import _jupyter_nbextension_paths


# deprecated:
LinearScaleWidget = LinearScale
ScaleWidget = Scale
