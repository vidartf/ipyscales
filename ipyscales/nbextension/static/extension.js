define(function() {
    "use strict";

    window['requirejs'].config({
        map: {
            '*': {
                'jupyter-scales': 'nbextensions/jupyter-scales/index',
            },
        }
    });
    // Export the required load_ipython_extention
    return {
        load_ipython_extension : function() {}
    };
});
