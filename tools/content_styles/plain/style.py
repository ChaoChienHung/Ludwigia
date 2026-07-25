class PlainStyle:
    def before_heading(self, level: int) -> list[str]:
        return []

    def after_document(self) -> list[str]:
        return []

    def heading(self, level: int, inner_html: str) -> str:
        return f'<h{level} class="mt-4">{inner_html}</h{level}>'

    def paragraph(self, inner_html: str) -> str:
        return f'<p class="page-text">{inner_html}</p>'

    def ul(self, items: list[str]) -> str:
        items_html = "\n".join([f"<li>{item}</li>" for item in items])
        return f"<ul class=\"page-text\">\n{items_html}\n</ul>"

    def ol(self, items: list[str]) -> str:
        items_html = "\n".join([f"<li>{item}</li>" for item in items])
        return f"<ol class=\"page-text\">\n{items_html}\n</ol>"

    def blockquote(self, inner_html: str) -> str:
        return f'<blockquote class="blockquote page-text">{inner_html}</blockquote>'

    def table(self, headers: list[str], rows: list[list[str]]) -> str:
        thead = "\n".join([f"<th>{cell}</th>" for cell in headers])
        body_rows = []
        for row in rows:
            cells = "\n".join([f"<td>{cell}</td>" for cell in row])
            body_rows.append(f"<tr>\n{cells}\n</tr>")
        tbody = "\n".join(body_rows)
        return (
            '<div class="note-table-wrap mb-3">\n'
            '  <table class="note-table">\n'
            f'    <thead><tr>\n{thead}\n    </tr></thead>\n'
            f'    <tbody>\n{tbody}\n    </tbody>\n'
            '  </table>\n'
            '</div>'
        )

    def hr(self) -> str:
        return "<hr>"

    def codeblock(self, code_text: str, lang: str) -> str:
        import html

        code_html = html.escape(code_text or "", quote=False)
        if lang:
            lang_attr = html.escape(lang, quote=True)
            return f'<div class="note-markdown-block"><pre><code class="language-{lang_attr}">{code_html}</code></pre></div>'
        return f'<div class="note-markdown-block"><pre><code>{code_html}</code></pre></div>'


def create() -> PlainStyle:
    return PlainStyle()
