"""
app/utils/plot_utils.py — Matplotlib figure serialisation utility.

Provides fig_to_base64(), a helper used by eda_engine.py to convert matplotlib
Figure objects into base64-encoded PNG data URIs that can be embedded directly
in JSON responses and rendered by the frontend as <img src="..."> elements.

How it works:
  1. Saves the figure to an in-memory BytesIO buffer (PNG, 100 dpi, tight bbox).
  2. Base64-encodes the buffer contents.
  3. Closes the figure to free memory.
  4. Returns the encoded string prefixed with "data:image/png;base64," so it
     is a valid HTML data URI.

matplotlib is set to the "Agg" backend (non-interactive, no display required)
so this works in a headless server environment.
"""
import base64
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def fig_to_base64(fig: plt.Figure) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=100)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return f"data:image/png;base64,{encoded}"
