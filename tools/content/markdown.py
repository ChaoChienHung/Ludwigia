"""Block-level markdown to HTML conversion for content pages.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import re

from tools import question_bank
from tools.content import render_state
from tools.content.common import _escape_attr, _escape_text, _parse_bool, _slugify
from tools.content.inline import _render_inline
from tools.content.paths import _safe_link_href
from tools.content.review_widgets import _render_note_quiz_html, _render_qaprompt_block_html, _render_qaprompt_section_html, _render_reviewkit_html
from tools.content.source_blocks import _parse_opening_tag_attrs


def _markdown_to_html(
    markdown: str,
    style,
    doc_title: str = "",
    wrap_sections: bool = True,
    anchors: dict[str, str] | None = None,
    toc_overrides: list[tuple[int, str, str]] | None = None,
    qaprompt: dict[str, str] | None = None,
    allow_raw_html: bool = False,
    source_path: str = "",
    source_meta: dict[str, str] | None = None,
) -> tuple[str, str]:
    lines = (markdown or "").splitlines()
    blocks: list[str] = []
    paragraph_lines: list[str] = []

    in_code = False
    code_lang = ""
    code_lines: list[str] = []

    list_kind: str | None = None
    list_items: list[str] = []

    toc_entries: list[tuple[int, str, str]] = []
    used_heading_ids: dict[str, int] = {}
    current_section_lines: list[str] = []
    current_section_id = ""
    current_section_delay = 120

    anchors = anchors or {}
    toc_overrides = toc_overrides or []
    qaprompt = qaprompt or {}
    source_meta = source_meta or {}
    render_state.INFORMATION_LANG = str(source_meta.get("lang") or "").strip() or "en"
    render_state.CONTENT_LINK_LANG = render_state.INFORMATION_LANG

    def _anchor_lookup(prefix: str, title: str) -> str:
        return anchors.get(f"{prefix}:{title}", "").strip()

    def _unique_heading_id(raw: str) -> str:
        base = _slugify(raw) or "section"
        n = used_heading_ids.get(base, 0)
        used_heading_ids[base] = n + 1
        return base if n == 0 else f"{base}-{n+1}"

    def flush_section() -> None:
        nonlocal current_section_lines, current_section_id, current_section_delay
        if not current_section_lines:
            return
        inner = "\n\n".join([b for b in current_section_lines if b])
        if wrap_sections:
            attrs = ""
            if current_section_id:
                attrs = f' id="{_escape_attr(current_section_id)}"'
            blocks.append(
                f'<section{attrs} class="note-section" data-aos="fade-up" data-aos-delay="{current_section_delay}">\n{inner}\n</section>'
            )
        else:
            blocks.append(inner)
        current_section_lines = []
        current_section_id = ""
        current_section_delay = 120

    def _normalize_block_content_html(raw_html: str) -> str:
        s = (raw_html or "").strip()
        if not s:
            return ""
        s = re.sub(r'^<p class="mb-3">', '<p class="mb-2">', s)
        s = re.sub(r'<p class="mb-3">([^<]*)</p>\s*$', r'<p class="mb-0">\1</p>', s)
        return s

    def render_block(
        title: str,
        content_html: str,
        block_id: str,
        collapsible: bool = False,
        collapsed: bool = True,
    ) -> str:
        title_text = title.strip()
        title_html = _render_inline(title_text) if title_text else "Details"
        attrs = f' id="{_escape_attr(block_id)}"' if block_id else ""
        content_norm = _normalize_block_content_html(content_html)
        if collapsible:
            open_attr = "" if collapsed else " open"
            return (
                f'<details{attrs} class="note-callout note-block-collapsible mb-3"{open_attr}>\n'
                f'  <summary class="note-block-summary">\n'
                f'    <span class="note-block-summary-title">{title_html}</span>\n'
                f'    <span class="note-block-summary-meta">\n'
                f'      <span class="note-block-pill">Click to toggle</span>\n'
                f'      <i class="fa-solid fa-chevron-down note-block-chevron"></i>\n'
                f'    </span>\n'
                f'  </summary>\n'
                f'  <div class="note-block-collapsible-body">\n'
                f'    {content_norm}\n'
                f'  </div>\n'
                f'</details>'
            )
        header_html = f'<p class="mb-2"><strong>{title_html}</strong></p>' if title_html else ""
        return f'<div{attrs} class="note-callout mb-3">{header_html}{content_norm}</div>'

    def render_takeaways(content_html: str) -> str:
        content_norm = _normalize_block_content_html(content_html)
        title_html = (
            '<div class="note-takeaways-header">'
            '  <div class="note-takeaways-icon" aria-hidden="true"><i class="fa-regular fa-lightbulb"></i></div>'
            '  <div class="note-takeaways-heading-group">'
            '    <h3 class="note-takeaways-title">Key Takeaways</h3>'
            '  </div>'
            '</div>'
        )
        return f'<div class="note-callout note-takeaways mb-3">{title_html}{content_norm}</div>'

    def render_callout(
        icon: str,
        icon_style: str,
        title: str,
        content_html: str,
        callout_id: str,
        variant: str,
        size: str,
        first_in_section: bool,
    ) -> str:
        icon_name = (icon or "").strip()
        icon_style_norm = (icon_style or "").strip().lower() or "solid"
        fa_prefix = "fa-solid"
        if icon_style_norm in ("regular", "far"):
            fa_prefix = "fa-regular"
        icon_class = f"{fa_prefix} fa-{_slugify(icon_name)}"

        title_html = _render_inline(title.strip())
        header_html = f'<h4 class="mb-2"><i class="{_escape_attr(icon_class)} me-2"></i>{title_html}</h4>' if title_html else ""
        attrs: list[str] = []
        if callout_id:
            attrs.append(f'id="{_escape_attr(callout_id)}"')
        attrs_text = (" " + " ".join(attrs)) if attrs else ""
        extra_attrs = ""
        if first_in_section:
            extra_attrs = ' data-aos="fade-up" data-aos-delay="80"'
        mb_class = "" if first_in_section else " mb-3"
        return f'<div{attrs_text} class="note-callout{mb_class}"{extra_attrs}>{header_html}{content_html}</div>'

    def build_toc_links() -> str:
        out: list[str] = []
        if toc_overrides:
            for lvl, hid, text in toc_overrides:
                css_level = "level-1" if lvl == 1 else "level-2"
                out.append(
                    f'<a class="note-toc-link {css_level}" href="#{_escape_attr(hid)}">{_escape_text(text)}</a>'
                )
            return "\n".join(out)

        for level, hid, text in toc_entries:
            css_level = "level-1" if level == 2 else "level-2"
            out.append(
                f'<a class="note-toc-link {css_level}" href="#{_escape_attr(hid)}">{_escape_text(text)}</a>'
            )
        return "\n".join(out)

    def flush_paragraph() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        text = " ".join([ln.strip() for ln in paragraph_lines if ln.strip()])
        if text:
            current_section_lines.append(style.paragraph(_render_inline(text)))
        paragraph_lines = []

    def flush_list() -> None:
        nonlocal list_kind, list_items
        if not list_kind or not list_items:
            list_kind = None
            list_items = []
            return
        rendered_items = [_render_inline(item) for item in list_items]
        if list_kind == "ul":
            current_section_lines.append(style.ul(rendered_items))
        else:
            current_section_lines.append(style.ol(rendered_items))
        list_kind = None
        list_items = []

    def _maybe_bold_term(text: str) -> str:
        s = (text or "").strip()
        m_term = re.match(r"^([A-Z][A-Za-z0-9_-]*)\s+(values|data)\b(.*)$", s)
        if not m_term:
            return s
        return f"**{m_term.group(1)}** {m_term.group(2)}{m_term.group(3)}"

    def _render_ul(items_md: list[str], class_attr: str) -> str:
        items_html = "\n".join([f"<li>{_render_inline(_maybe_bold_term(item))}</li>" for item in items_md])
        return f'<ul class="{_escape_attr(class_attr)}">\n{items_html}\n</ul>'

    def _count_indent(raw_line: str) -> int:
        expanded = raw_line.expandtabs(4)
        return len(expanded) - len(expanded.lstrip(" "))

    def _render_nested_ul_tree(nodes: list[dict[str, object]]) -> str:
        items_html: list[str] = []
        for node in nodes:
            text = _render_inline(_maybe_bold_term(str(node.get("text") or "")))
            blocks = node.get("blocks") or []
            if not blocks:
                paras = node.get("paras") or []
                children = node.get("children") or []
                if paras:
                    for p in paras:
                        if isinstance(p, str) and p.strip():
                            p_str = p.strip()
                            if p_str.startswith("> "):
                                blocks.append({"type": "quote", "text": p_str[2:].strip()})
                            elif p_str.startswith(">"):
                                blocks.append({"type": "quote", "text": p_str[1:].strip()})
                            else:
                                blocks.append({"type": "para", "text": p_str})
                if children:
                    blocks.append({"type": "children", "nodes": children})

            inner_parts: list[str] = []
            for b in blocks:
                if not isinstance(b, dict):
                    continue
                btype = b.get("type")
                if btype == "para":
                    inner_parts.append(f'<p class="mb-2">{_render_inline(str(b.get("text") or ""))}</p>')
                elif btype == "quote":
                    inner_parts.append(style.blockquote(_render_inline(str(b.get("text") or ""))))
                elif btype == "children":
                    child_nodes = b.get("nodes") or []
                    if isinstance(child_nodes, list) and child_nodes:
                        inner_parts.append(_render_nested_ul_tree(child_nodes))

            inner_html = ("\n" + "\n".join(inner_parts)) if inner_parts else ""
            items_html.append(f"<li>{text}{inner_html}</li>")
        return f'<ul class="note-list">\n' + "\n".join(items_html) + "\n</ul>"

    def _parse_nested_ul(start_idx: int) -> tuple[str, int]:
        root: list[dict[str, object]] = []
        stack: list[tuple[int, list[dict[str, object]], dict[str, object] | None]] = [(-1, root, None)]
        i_local = start_idx
        while i_local < len(lines):
            raw_line = lines[i_local].rstrip("\n")
            stripped_local = raw_line.strip()

            if not stripped_local:
                next_i = i_local + 1
                while next_i < len(lines) and not lines[next_i].strip():
                    next_i += 1
                if next_i >= len(lines):
                    i_local = next_i
                    break
                next_raw = lines[next_i].rstrip("\n")
                next_st = next_raw.strip()
                next_indent = _count_indent(next_raw)

                m_next_bullet = re.match(r"^(\s*)([*+-])\s+(.*)$", next_raw)
                if m_next_bullet or next_indent >= 4:
                    if re.match(r"^(#{1,6})\s+", next_st) or (next_st.startswith("<") and next_st.endswith(">") and next_st not in ("<br>", "<br/>")):
                        i_local = next_i
                        break
                    if not m_next_bullet and next_indent < 4:
                        i_local = next_i
                        break
                    i_local = next_i
                    continue
                else:
                    i_local = next_i
                    break

            m_item = re.match(r"^(\s*)([*+-])\s+(.*)$", raw_line)
            if m_item:
                indent = _count_indent(raw_line)
                text = m_item.group(3).strip()
                while len(stack) > 1 and indent <= stack[-1][0]:
                    stack.pop()
                node: dict[str, object] = {"text": text, "blocks": []}

                parent_node = stack[-1][2]
                if parent_node is None:
                    root.append(node)
                else:
                    parent_blocks: list[dict[str, object]] = parent_node.setdefault("blocks", [])  # type: ignore[assignment]
                    if not parent_blocks or parent_blocks[-1].get("type") != "children":
                        parent_blocks.append({"type": "children", "nodes": [node]})
                    else:
                        nodes_list: list[dict[str, object]] = parent_blocks[-1].setdefault("nodes", [])  # type: ignore[assignment]
                        nodes_list.append(node)

                stack.append((indent, [], node))
                i_local += 1
            else:
                indent = _count_indent(raw_line)
                while len(stack) > 1 and indent <= stack[-1][0]:
                    stack.pop()
                if indent >= 4 and len(stack) > 1:
                    if re.match(r"^(#{1,6})\s+", stripped_local) or (stripped_local.startswith("<") and stripped_local.endswith(">") and stripped_local not in ("<br>", "<br/>")):
                        break
                    curr_node = stack[-1][2]
                    if curr_node is not None:
                        curr_blocks: list[dict[str, object]] = curr_node.setdefault("blocks", [])  # type: ignore[assignment]
                        if stripped_local.startswith("> "):
                            curr_blocks.append({"type": "quote", "text": stripped_local[2:].strip()})
                        elif stripped_local.startswith(">"):
                            curr_blocks.append({"type": "quote", "text": stripped_local[1:].strip()})
                        else:
                            curr_blocks.append({"type": "para", "text": stripped_local})
                    i_local += 1
                else:
                    break
        return _render_nested_ul_tree(root), i_local

    def _render_complex_ol(items: list[tuple[str, list[str], list[str]]]) -> str:
        li_html: list[str] = []
        for idx, (title, paras, subitems) in enumerate(items):
            title_html = f"<strong>{_render_inline(title)}</strong><br>"
            para_html = ""
            if paras:
                rendered_paras: list[str] = []
                for p in paras:
                    if isinstance(p, str) and p.strip():
                        p_str = p.strip()
                        if p_str.startswith("> "):
                            rendered_paras.append(style.blockquote(_render_inline(p_str[2:].strip())))
                        elif p_str.startswith(">"):
                            rendered_paras.append(style.blockquote(_render_inline(p_str[1:].strip())))
                        else:
                            rendered_paras.append(f'<p class="mb-2">{_render_inline(p_str)}</p>')
                para_html = "\n" + "\n".join(rendered_paras)
            nested_html = ""
            if subitems:
                nested_html = _render_ul(subitems, "mb-0 mt-2")
            cls = ' class="mb-2"' if idx == 0 else ""
            li_html.append(f"<li{cls}>\n  {title_html}\n  {para_html}\n  {nested_html}\n</li>")
        return "<ol class=\"mb-3\">\n" + "\n".join(li_html) + "\n</ol>"

    def _should_render_complex_ol(items: list[tuple[str, list[str], list[str]]]) -> bool:
        return any(paras or subitems for _, paras, subitems in items)

    def _split_table_row(row_text: str) -> list[str]:
        row = row_text.strip()
        if row.startswith("|"):
            row = row[1:]
        if row.endswith("|"):
            row = row[:-1]
        return [cell.strip() for cell in row.split("|")]

    def _is_table_divider(row_text: str) -> bool:
        cells = _split_table_row(row_text)
        if not cells:
            return False
        for cell in cells:
            normalized = cell.replace(":", "").replace("-", "").replace(" ", "")
            if normalized:
                return False
            if "-" not in cell:
                return False
        return True

    def _looks_like_table_header(idx: int) -> bool:
        if idx + 1 >= len(lines):
            return False
        header = lines[idx].strip()
        divider = lines[idx + 1].strip()
        if "|" not in header or "|" not in divider:
            return False
        if not _is_table_divider(divider):
            return False
        header_cells = _split_table_row(header)
        divider_cells = _split_table_row(divider)
        return len(header_cells) >= 2 and len(header_cells) == len(divider_cells)

    def _parse_table(start_idx: int) -> tuple[str, int]:
        headers = [_render_inline(cell) for cell in _split_table_row(lines[start_idx].strip())]
        rows: list[list[str]] = []
        i_local = start_idx + 2
        while i_local < len(lines):
            row_text = lines[i_local].rstrip("\n")
            stripped_row = row_text.strip()
            if not stripped_row:
                break
            if "|" not in stripped_row:
                break
            cells = _split_table_row(stripped_row)
            if len(cells) != len(headers):
                break
            rows.append([_render_inline(cell) for cell in cells])
            i_local += 1
        return style.table(headers, rows), i_local

    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.rstrip("\n")
        stripped = line.strip()

        if in_code:
            if stripped.startswith("```"):
                current_section_lines.append(style.codeblock("\n".join(code_lines), code_lang))
                in_code = False
                code_lang = ""
                code_lines = []
            else:
                code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("```"):
            flush_paragraph()
            flush_list()
            in_code = True
            code_lang = stripped[3:].strip()
            code_lines = []
            i += 1
            continue

        if stripped == "<callout>":
            flush_paragraph()
            flush_list()
            i += 1
            callout_id = ""
            icon = ""
            icon_style = ""
            title = ""
            variant = ""
            size = ""
            toc_label = ""
            content_lines: list[str] = []
            in_content = False
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</callout>":
                    break
                if not in_content:
                    m_kv = re.match(
                        r"^(id|icon|style|title|variant|size|toc|content)\s*:\s*(.*)$",
                        inner_stripped,
                        flags=re.IGNORECASE,
                    )
                    if m_kv:
                        key = m_kv.group(1).strip().lower()
                        value = m_kv.group(2).strip()
                        if key == "id":
                            callout_id = value
                        elif key == "icon":
                            icon = value
                        elif key == "style":
                            icon_style = value
                        elif key == "title":
                            title = value
                        elif key == "variant":
                            variant = value
                        elif key == "size":
                            size = value
                        elif key == "toc":
                            toc_label = value
                        else:
                            in_content = True
                            if value:
                                content_lines.append(value)
                    elif inner_stripped:
                        content_lines.append(inner_stripped)
                else:
                    content_lines.append(inner)
                i += 1
            content_md = "\n".join(content_lines).strip()
            inner_html, _ = _markdown_to_html(
                content_md,
                style=style,
                doc_title="",
                wrap_sections=False,
                anchors={},
                toc_overrides=[],
                qaprompt={},
                allow_raw_html=allow_raw_html,
                source_path=source_path,
                source_meta=source_meta,
            )
            if not callout_id:
                callout_id = _anchor_lookup("callout", title) or (_slugify(title) if title else "")
            first_in_section = len(current_section_lines) == 0
            callout_html = render_callout(
                icon=icon,
                icon_style=icon_style,
                title=title,
                content_html=inner_html,
                callout_id=callout_id,
                variant=variant,
                size=size,
                first_in_section=first_in_section,
            )
            current_section_lines.append(callout_html)
            if toc_label and callout_id:
                toc_entries.append((3, callout_id, toc_label))
            while i < len(lines) and lines[i].strip() != "</callout>":
                i += 1
            i += 1
            continue

        quiz_tag = re.match(r"^<(qquiz)(?:\s+[^>]*)?\s*(/?)>$", stripped, flags=re.IGNORECASE)
        if quiz_tag:
            flush_paragraph()
            flush_list()
            quiz_attrs = _parse_opening_tag_attrs(stripped, "qquiz")
            quiz_title = ""
            questions: list[dict[str, str]] = []
            external_quiz = bool(quiz_attrs.get("src") or quiz_attrs.get("bank"))
            if external_quiz:
                bank_ref = (quiz_attrs.get("src") or quiz_attrs.get("bank") or "").strip()
                raw_ids = (quiz_attrs.get("ids") or quiz_attrs.get("questions") or "").strip()
                requested_ids = [item.strip() for item in raw_ids.split(",") if item.strip()]
                loaded_questions = question_bank.load_questions_for_note(
                    source_path,
                    source_meta,
                    bank_ref,
                    question_ids=requested_ids,
                )
                questions = [question_bank.convert_question_to_quiz_entry(item) for item in loaded_questions]
                quiz_title = (quiz_attrs.get("title") or "").strip()
                if quiz_tag.group(2) == "/":
                    title_text = quiz_title.strip() or "Quick Quiz"
                    quiz_html = _render_note_quiz_html(title_text, questions, extra_classes=" mt-4")
                    if quiz_html:
                        current_section_lines.append(quiz_html)
                    i += 1
                    continue
            i += 1

            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</qquiz>":
                    break

                m_title = re.match(r"^title\s*:\s*(.*)$", inner_stripped, flags=re.IGNORECASE)
                if m_title and not questions:
                    quiz_title = m_title.group(1).strip()
                    i += 1
                    continue

                if inner_stripped == "<question>":
                    i += 1
                    q: dict[str, str] = {}
                    current_key = ""
                    while i < len(lines):
                        qline = lines[i].rstrip("\n")
                        qstripped = qline.strip()
                        if qstripped == "</question>":
                            break
                        m_kv = re.match(
                            r"^(question|a|b|c|d|answer|explanation|responsea|responseb|responsec|responsed)\s*:\s*(.*)$",
                            qstripped,
                            flags=re.IGNORECASE,
                        )
                        if m_kv:
                            current_key = m_kv.group(1).strip().lower()
                            q[current_key] = m_kv.group(2).strip()
                        elif current_key in ("explanation", "question") and qstripped:
                            q[current_key] = (q.get(current_key, "") + "\n" + qline).strip()
                        i += 1
                    if q:
                        questions.append(q)
                    while i < len(lines) and lines[i].strip() != "</question>":
                        i += 1
                    i += 1
                    continue

                i += 1

            title_text = quiz_title.strip() or "Quick Quiz"
            quiz_html = _render_note_quiz_html(title_text, questions, extra_classes=" mt-4")
            if quiz_html:
                current_section_lines.append(quiz_html)

            while i < len(lines) and lines[i].strip() != "</qquiz>":
                i += 1
            i += 1
            continue

        if stripped == "<reviewkit>":
            flush_paragraph()
            flush_list()
            flush_section()
            i += 1
            summary_title = "Review Kit"
            summary_id = ""
            summary_toc = ""
            quiz_lines: list[str] = []
            parsing_reviewkit_meta = True
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</reviewkit>":
                    break
                m_kv = re.match(r"^(title|id|toc)\s*:\s*(.*)$", inner_stripped, flags=re.IGNORECASE)
                if parsing_reviewkit_meta and m_kv:
                    key = m_kv.group(1).strip().lower()
                    value = m_kv.group(2).strip()
                    if key == "title":
                        summary_title = value or summary_title
                    elif key == "id":
                        summary_id = value
                    else:
                        summary_toc = value
                    i += 1
                    continue
                if inner_stripped:
                    parsing_reviewkit_meta = False
                quiz_lines.append(inner)
                i += 1

            if not summary_id:
                summary_id = _anchor_lookup("section", summary_title) or _slugify(summary_title)

            has_prompt_placeholder = False
            takeaways_lines: list[str] = []
            reviewkit_lines: list[str] = []
            rk_i = 0
            while rk_i < len(quiz_lines):
                line = quiz_lines[rk_i]
                line_stripped = line.strip()
                if line_stripped == "<qprompt/>":
                    has_prompt_placeholder = True
                    rk_i += 1
                    continue
                if line_stripped == "<takeaways>":
                    takeaways_lines.append(line)
                    rk_i += 1
                    while rk_i < len(quiz_lines):
                        takeaways_lines.append(quiz_lines[rk_i])
                        if quiz_lines[rk_i].strip() == "</takeaways>":
                            rk_i += 1
                            break
                        rk_i += 1
                    continue
                reviewkit_lines.append(line)
                rk_i += 1

            takeaways_md = "\n".join(takeaways_lines).strip()
            takeaways_html = ""
            if takeaways_md:
                takeaways_html, _ = _markdown_to_html(
                    takeaways_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    anchors=anchors,
                    toc_overrides=[],
                    qaprompt={},
                    allow_raw_html=allow_raw_html,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                takeaways_html = takeaways_html.strip().replace(
                    'class="note-callout note-takeaways mb-3"',
                    'class="note-callout note-takeaways note-takeaways-embedded mb-0"',
                )
            reviewkit_md = "\n".join(reviewkit_lines)
            reviewkit_primary_html, _ = _markdown_to_html(
                reviewkit_md,
                style=style,
                doc_title="",
                wrap_sections=False,
                anchors=anchors,
                toc_overrides=[],
                qaprompt={},
                allow_raw_html=allow_raw_html,
                source_path=source_path,
                source_meta=source_meta,
            )
            reviewkit_primary_html = (
                reviewkit_primary_html.strip().replace('class="note-quiz mt-4"', 'class="note-quiz"')
            )
            prompt_html = _render_qaprompt_block_html(qaprompt, block_id=f"{summary_id}--prompt") if has_prompt_placeholder else ""
            summary_html = _render_reviewkit_html(
                summary_title,
                summary_id,
                takeaways_html,
                reviewkit_primary_html,
                prompt_html,
            )

            if summary_html:
                blocks.append(summary_html)
            if _parse_bool(summary_toc, default=False) and summary_id:
                toc_entries.append((2, summary_id, summary_title))

            while i < len(lines) and lines[i].strip() != "</reviewkit>":
                i += 1
            i += 1
            continue

        if stripped == "<qprompt/>":
            flush_paragraph()
            flush_list()
            flush_section()
            prompt_section_id = _slugify((qaprompt.get("title") or "qa-prompt").strip()) or "qa-prompt"
            qa_html = _render_qaprompt_section_html(qaprompt, section_id=prompt_section_id)
            if qa_html:
                blocks.append(qa_html)
            i += 1
            continue

        if stripped == "<block>":
            flush_paragraph()
            flush_list()
            i += 1
            block_id = ""
            title = ""
            collapsible = False
            collapsed = True
            content_lines: list[str] = []
            in_content = False
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</block>":
                    break
                if not in_content:
                    m_kv = re.match(
                        r"^(id|title|collapsible|collapsed|default|open|content)\s*:\s*(.*)$",
                        inner_stripped,
                        flags=re.IGNORECASE,
                    )
                    if m_kv:
                        key = m_kv.group(1).strip().lower()
                        value = m_kv.group(2).strip()
                        if key == "id":
                            block_id = value
                        elif key == "title":
                            title = value
                        elif key == "collapsible":
                            collapsible = _parse_bool(value, default=True)
                        elif key in ("collapsed", "default", "open"):
                            if key == "open":
                                collapsed = not _parse_bool(value, default=True)
                            elif key == "default":
                                collapsed = (value.lower() != "open")
                            else:
                                collapsed = _parse_bool(value, default=True)
                        else:
                            in_content = True
                            if value:
                                content_lines.append(value)
                    elif inner_stripped:
                        content_lines.append(inner_stripped)
                else:
                    content_lines.append(inner)
                i += 1

            content_md = "\n".join(content_lines).strip()
            if title.strip() or content_md.strip():
                inner_html, _ = _markdown_to_html(
                    content_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                if not block_id:
                    block_id = _anchor_lookup("block", title) or ""
                current_section_lines.append(
                    render_block(
                        title=title,
                        content_html=inner_html,
                        block_id=block_id,
                        collapsible=collapsible,
                        collapsed=collapsed,
                    )
                )
            while i < len(lines) and lines[i].strip() != "</block>":
                i += 1
            i += 1
            continue

        if stripped == "<takeaways>":
            flush_paragraph()
            flush_list()
            i += 1
            takeaway_lines: list[str] = []
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</takeaways>":
                    break
                takeaway_lines.append(inner)
                i += 1

            takeaways_md = "\n".join(takeaway_lines).strip()
            if takeaways_md:
                inner_html, _ = _markdown_to_html(
                    takeaways_md,
                    style=style,
                    doc_title="",
                    wrap_sections=False,
                    anchors={},
                    toc_overrides=[],
                    qaprompt={},
                    allow_raw_html=allow_raw_html,
                    source_path=source_path,
                    source_meta=source_meta,
                )
                current_section_lines.append(render_takeaways(inner_html))
            while i < len(lines) and lines[i].strip() != "</takeaways>":
                i += 1
            i += 1
            continue

        if stripped == "<image>":
            flush_paragraph()
            flush_list()
            i += 1
            image_id = ""
            src = ""
            alt = ""
            caption = ""
            width = ""
            align = ""
            link = ""
            lazy = True
            while i < len(lines):
                inner = lines[i].rstrip("\n")
                inner_stripped = inner.strip()
                if inner_stripped == "</image>":
                    break
                m_kv = re.match(
                    r"^(id|src|alt|caption|width|align|link|lazy)\s*:\s*(.*)$",
                    inner_stripped,
                    flags=re.IGNORECASE,
                )
                if m_kv:
                    key = m_kv.group(1).strip().lower()
                    value = m_kv.group(2).strip()
                    if key == "id":
                        image_id = value
                    elif key == "src":
                        src = value
                    elif key == "alt":
                        alt = value
                    elif key == "caption":
                        caption = value
                    elif key == "width":
                        width = value
                    elif key == "align":
                        align = value
                    elif key == "link":
                        link = value
                    elif key == "lazy":
                        lazy = _parse_bool(value, default=True)
                i += 1

            safe_src = _safe_link_href(src)
            safe_link = _safe_link_href(link)
            safe_width = ""
            if width and re.fullmatch(r"[0-9.]+(%|px|rem|em|vw|vh)", width.strip()):
                safe_width = width.strip()
            align_norm = (align or "").strip().lower()
            if align_norm not in ("left", "center", "right"):
                align_norm = ""
            style_attr = f' style="max-width: {safe_width};"' if safe_width else ""
            id_attr = f' id="{_escape_attr(image_id)}"' if image_id else ""
            figure_class = "note-image" + (f" align-{align_norm}" if align_norm else "")
            caption_html = (
                f'<figcaption class="note-image-caption">{_render_inline(caption)}</figcaption>'
                if caption.strip()
                else ""
            )
            if safe_src:
                loading_attr = ' loading="lazy"' if lazy else ""
                img_html = f'<img src="{_escape_attr(safe_src)}" alt="{_escape_attr(alt)}"{loading_attr}>'
                if safe_link:
                    img_html = f'<a class="note-image-link" href="{_escape_attr(safe_link)}">{img_html}</a>'
                current_section_lines.append(
                    f'<figure{id_attr} class="{figure_class}"{style_attr}>{img_html}{caption_html}</figure>'
                )
            else:
                placeholder_text = _render_inline(caption.strip() or "Image")
                current_section_lines.append(
                    f'<div{id_attr} class="note-image-placeholder"{style_attr}>{placeholder_text}</div>'
                )

            while i < len(lines) and lines[i].strip() != "</image>":
                i += 1
            i += 1
            continue

        if stripped in ("<br>", "<br/>"):
            flush_paragraph()
            flush_list()
            current_section_lines.append("<br>")
            i += 1
            continue

        if stripped == "<rawhtml>":
            if not allow_raw_html:
                raise SystemExit("<rawhtml> is disabled. Set AllowRawHtml: true in <meta> to enable.")
            flush_paragraph()
            flush_list()
            i += 1
            raw_lines: list[str] = []
            while i < len(lines) and lines[i].strip() != "</rawhtml>":
                raw_lines.append(lines[i])
                i += 1
            current_section_lines.append("\n".join(raw_lines))
            while i < len(lines) and lines[i].strip() != "</rawhtml>":
                i += 1
            i += 1
            continue

        if not stripped:
            flush_paragraph()
            flush_list()
            i += 1
            continue

        if re.fullmatch(r"(-{3,}|\*{3,}|_{3,})", stripped):
            flush_paragraph()
            flush_list()
            current_section_lines.append(style.hr())
            i += 1
            continue

        if _looks_like_table_header(i):
            flush_paragraph()
            flush_list()
            table_html, next_i = _parse_table(i)
            current_section_lines.append(table_html)
            i = next_i
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            flush_paragraph()
            flush_list()
            level = len(m.group(1))
            title = m.group(2).strip()
            if level == 1 and not blocks and not current_section_lines:
                if doc_title and _slugify(title) == _slugify(doc_title):
                    i += 1
                    continue

            anchor_hid = _anchor_lookup(f"h{level}", title) if level in (2, 3) else ""
            hid = anchor_hid or _unique_heading_id(title)
            if level in (2, 3) and not toc_overrides:
                toc_entries.append((level, hid, title))

            if level == 2:
                flush_section()
                current_section_id = hid
                current_section_lines.append(f'<h3 class="mb-3">{_render_inline(title)}</h3>')
            elif level == 3:
                current_section_lines.append(f'<h4 id="{_escape_attr(hid)}" class="mb-2">{_render_inline(title)}</h4>')
            else:
                current_section_lines.append(style.heading(level, _render_inline(title)))
            i += 1
            continue

        if stripped.startswith("> "):
            flush_paragraph()
            flush_list()
            quote = stripped[2:].strip()
            current_section_lines.append(style.blockquote(_render_inline(quote)))
            i += 1
            continue

        m_ul = re.match(r"^(\*|-|\+)\s+(.*)$", stripped)
        m_ol = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m_ul:
            flush_paragraph()
            flush_list()
            nested_ul_html, next_i = _parse_nested_ul(i)
            current_section_lines.append(nested_ul_html)
            i = next_i
            continue
        if m_ol:
            flush_paragraph()
            flush_list()
            items: list[tuple[str, list[str], list[str]]] = []
            while i < len(lines):
                first = lines[i].strip()
                m_item = re.match(r"^(\d+)\.\s+(.*)$", first)
                if not m_item:
                    break
                title = m_item.group(2).strip()
                i += 1
                paras: list[str] = []
                subitems: list[str] = []
                while i < len(lines):
                    raw_inner = lines[i].rstrip("\n")
                    st = raw_inner.strip()
                    if not st:
                        next_i = i + 1
                        while next_i < len(lines) and not lines[next_i].strip():
                            next_i += 1
                        if next_i >= len(lines):
                            i = next_i
                            break
                        next_raw = lines[next_i].rstrip("\n")
                        next_st = next_raw.strip()
                        next_indent = _count_indent(next_raw)
                        if re.match(r"^(\d+)\.\s+", next_st):
                            i = next_i
                            break
                        if re.match(r"^(#{1,6})\s+", next_st):
                            i = next_i
                            break
                        if next_st.startswith("<") and next_st.endswith(">") and next_st not in ("<br>", "<br/>"):
                            i = next_i
                            break
                        if next_indent < 4:
                            i = next_i
                            break
                        i = next_i
                        continue
                    if re.match(r"^(\d+)\.\s+", st):
                        break
                    if re.match(r"^(#{1,6})\s+", st):
                        break
                    if st.startswith("<") and st.endswith(">") and st not in ("<br>", "<br/>"):
                        break
                    if _count_indent(raw_inner) < 4:
                        break
                    m_sub = re.match(r"^(\*|-|\+)\s+(.*)$", st)
                    if m_sub:
                        subitems.append(m_sub.group(2).strip())
                    else:
                        paras.append(st)
                    i += 1
                items.append((title, paras, subitems))
            if items:
                if _should_render_complex_ol(items):
                    current_section_lines.append(_render_complex_ol(items))
                else:
                    current_section_lines.append(style.ol([_render_inline(title) for title, _, _ in items]))
            continue

        if list_kind:
            flush_list()

        paragraph_lines.append(stripped)
        i += 1

    if in_code:
        current_section_lines.append(style.codeblock("\n".join(code_lines), code_lang))

    flush_paragraph()
    flush_list()
    flush_section()
    blocks.extend(style.after_document() or [])

    rendered = "\n\n".join([b for b in blocks if b is not None and b != ""]).strip()
    return rendered, build_toc_links()
