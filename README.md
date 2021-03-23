# Python Web C9onsole

Based on https://github.com/kikocorreoso/pybonacci-runpy

It works thanks to:

* [Pyodide](https://github.com/iodide-project/pyodide)
* [Codemirror](https://codemirror.net/)
* All the python community (CPython, numpy, scipy, matplotlib, pandas,...).

## Modifications included

* `print` from Pyodide prints directly in the JS console of your browser. The `print` used in this editor is modified so you can print in the
output textarea in the webpage instead of the JS console. If you want to use the original `print` from Pyodide it is renamed to `_print`.
* There is a context manager, `Plot`, to manage matplotlib figures in the webpage. You can use it to print in the webpage (right area). It could be used like this:

```python
with Plot() as (fig, ax):
    ax.plot((1,2,3))
```
And the figure will appear in a HTML `img` tag in the webpage.

If you want to use several axes you can use:

```python
with Plot(1, 2) as (fig, axs):
    axs[0].plot((1,2,3))
    axs[1].plot((3,2,1))
```

## Test it

```sh
python -m http.server
````
Browse to http://localhost:8000


[githack](https://raw.githack.com/joaompinto/pywebconsole/main/src/index.html)

## Screenshots

![](./media/pybonacci-runpy.png)
