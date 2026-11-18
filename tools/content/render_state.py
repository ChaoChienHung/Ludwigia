"""Per-page render context shared by the inline renderer and the page builder.

These values used to be module globals in tools/create_content.py. main() and
_markdown_to_html() set them before rendering a page; the inline renderer reads
them while rendering <information> and <content-link>."""

from __future__ import annotations

INFORMATION_LANG = "en"
CONTENT_LINK_REGISTRY: dict[str, list[dict[str, str]]] = {}
CONTENT_LINK_OUTPUT_PATH = ""
CONTENT_LINK_LANG = "en"
