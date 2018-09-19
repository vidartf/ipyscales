
# ipyscales

[![Build Status](https://travis-ci.org/vidartf/ipyscales.svg?branch=master)](https://travis-ci.org/vidartf/ipyscales)
[![codecov](https://codecov.io/gh/vidartf/ipyscales/branch/master/graph/badge.svg)](https://codecov.io/gh/vidartf/ipyscales)
[![Documentation Status](https://readthedocs.org/projects/ipyscales/badge/?version=latest)](http://ipyscales.readthedocs.io/en/latest/?badge=latest)


A Jupyter widgets library for scales.

## Installation

A typical installation requires the following three commands to be run:

```bash
pip install ipyscales
jupyter nbextension install --py [--sys-prefix|--user|--system] ipyscales
jupyter nbextension enable --py [--sys-prefix|--user|--system] ipyscales
```

Or, if you use jupyterlab:

```bash
pip install ipyscales
jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
jupyter labextension install jupyterlab-scales
```
