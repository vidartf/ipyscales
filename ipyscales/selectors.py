

from ipywidgets import Widget, DOMWidget, widget_serialization
from traitlets import Dict, Instance, Unicode, Undefined

from ._frontend import module_name, module_version
from .traittypes import VarlenTuple


class _SelectorBase(DOMWidget):
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)


class StringDropdown(_SelectorBase):
    """Select a string from a list of options.

    Here, the value and options have no serializers.
    """

    _model_name = Unicode('StringDropdownModel').tag(sync=True)
    _view_name = Unicode('DropdownView').tag(sync=True)

    value = Unicode(None, help="Selected value", allow_none=True).tag(sync=True)

    options = VarlenTuple(Unicode()).tag(sync=True)

    def __init__(self, options, value=Undefined, **kwargs):
        # Select the first item by default, if we can
        if value == Undefined:
            nonempty = (len(options) > 0)
            value = options[0] if nonempty else None
        super(StringDropdown, self).__init__(options=options, value=value, **kwargs)


class WidgetDropdown(_SelectorBase):
    """Select a widget reference from a list of options.

    Here, the value and options have widget serializers.
    """

    _model_name = Unicode('WidgetDropdownModel').tag(sync=True)
    _view_name = Unicode('DropdownView').tag(sync=True)

    value = Instance(
        Widget, help="Selected value", allow_none=True
    ).tag(sync=True, **widget_serialization)

    options = Dict(
        Instance(Widget)
    ).tag(sync=True, **widget_serialization)


    def __init__(self, options, value=Undefined, **kwargs):
        # Select the first item by default, if we can
        if value == Undefined:
            nonempty = (len(options) > 0)
            value = tuple(options.values())[0] if nonempty else None
        super(WidgetDropdown, self).__init__(options=options, value=value, **kwargs)