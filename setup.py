#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function
from glob import glob
import os.path
from os.path import join as pjoin


from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    find_packages,
    combine_commands,
    ensure_python,
    get_version,
)

from setuptools import setup


HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name = "ipyscales"

# Ensure a valid python version
ensure_python(">=3.5")

# Get our version
version = get_version(pjoin(HERE, name, "_version.py"))

nb_path = pjoin(HERE, name, "nbextension", "static")
js_path = pjoin(HERE, "js")
lab_path = pjoin(HERE, "js", "lab-dist")

# Representative files that should exist after a successful build
jstargets = [pjoin(nb_path, "index.js"), pjoin(js_path, "lib", "plugin.js")]

package_data_spec = {name: ["nbextension/static/*.*js*"]}

data_files_spec = [
    ("share/jupyter/nbextensions/jupyter-scales", nb_path, "*.js*"),
    ("share/jupyter/lab/extensions", lab_path, "*.tgz"),
    ("etc/jupyter", pjoin(HERE, "jupyter-config"), "**/*.json"),
]


if os.environ.get("READTHEDOCS", None) == "True":
    # On RTD, skip JS build to save resources
    import jupyter_packaging
    jupyter_packaging.skip_npm = True

cmdclass = create_cmdclass(
    "jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec
)
cmdclass["jsdeps"] = combine_commands(
    install_npm(js_path, build_cmd="build:all"), ensure_targets(jstargets)
)


setup_args = dict(
    name=name,
    description="A widget library for scales",
    version=version,
    scripts=glob(pjoin("scripts", "*")),
    cmdclass=cmdclass,
    packages=find_packages(HERE),
    author="Jupyter Development Team",
    author_email="jupyter@googlegroups.com",
    url="https://github.com/vidartf/ipyscales",
    license="BSD",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "Widgets", "IPython"],
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Framework :: Jupyter",
    ],
    include_package_data=True,
    install_requires=["ipywidgets>=7.0.0"],
    extras_require={
        "test": [
            "ipydatawidgets>=4.0",
            "ipywidgets>=7.5",
            "nbval",
            "pytest>=4.6",
            "pytest-cov",
            "pytest_check_links",
        ],
        "examples": ["ipydatawidgets>=4.0"],
        "docs": [
            "sphinx>=1.5",
            "recommonmark",
            "sphinx_rtd_theme",
            "nbsphinx>=0.2.13",
            "nbsphinx-link",
            "pypandoc",
        ],
    },
    entry_points={},
)

if __name__ == "__main__":
    setup(**setup_args)
