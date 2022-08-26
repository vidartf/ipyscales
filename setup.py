#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from glob import glob
from pathlib import Path
import os.path
from os.path import join as pjoin


from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
)

from setuptools import setup, find_packages


HERE = Path(__file__).absolute().parent

# The name of the project
name = "ipyscales"
# Get our version
version = get_version(HERE.joinpath(name, "_version.py"))

nb_path = HERE.joinpath(name, "nbextension", "static")
js_path = HERE.joinpath("js")
lab_path = HERE.joinpath("js", "lab-dist")

# Representative files that should exist after a successful build
jstargets = [
    nb_path / "index.js",
    js_path / "lib" / "plugin.js"
]

package_data_spec = {name: ["nbextension/static/*.*js*"]}

data_files_spec = [
    ("share/jupyter/nbextensions/jupyter-scales", nb_path, "*.js*"),
    ("share/jupyter/lab/extensions", lab_path, "*.tgz"),
    ('share/jupyter/labextensions/jupyter-scales', lab_path / 'jupyter-scales', '**/*.*'),
    ("etc/jupyter", HERE / "jupyter-config", "**/*.json"),
]

cmdclass = create_cmdclass(
    "jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec
)
cmdclass["jsdeps"] = combine_commands(
    install_npm(js_path, build_cmd="build:all"), ensure_targets(jstargets)
)


setup_args = dict(
    name=name,
    description="A widget library for scales",
    long_description=(HERE / "README.md").read_text(encoding="utf-8"),
    long_description_content_type='text/markdown',
    version=version,
    scripts=glob(pjoin("scripts", "*")),
    cmdclass=cmdclass,
    packages=find_packages(str(HERE)),
    author="Vidar T Fauske",
    author_email="vidartf@gmail.com",
    url="https://github.com/vidartf/ipyscales",
    license="BSD-3-Clause",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "Widgets", "IPython"],
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        "Framework :: Jupyter",
    ],
    include_package_data=True,
    python_requires=">=3.7",
    install_requires=["ipywidgets>=7.0.0"],
    extras_require={
        "test": [
            "ipydatawidgets>=4.2",
            "ipywidgets>=7.6",
            "nbval",
            "pytest>=4.6",
            "pytest-cov",
            "pytest_check_links",
        ],
        "examples": ["ipydatawidgets>=4.2"],
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
