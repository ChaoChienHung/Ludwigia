"""Rendering of reviewkit, qquiz and qprompt blocks.

Split out of tools/create_content.py; behaviour is unchanged."""

from __future__ import annotations

import re
from tools.content.common import _escape_attr, _escape_text, _slugify


def _render_note_quiz_html(title_text: str, questions: list[dict[str, str]], *, extra_classes: str = " mt-4") -> str:
    total = len(questions)
    if total <= 0:
        return ""

    items_html: list[str] = []
    for idx, q in enumerate(questions, start=1):
        q_text = (q.get("question") or "").strip()
        exp = (q.get("explanation") or "").strip()
        exp_one_line = re.sub(r"\s+", " ", exp).strip()
        correct = (q.get("answer") or "").strip().upper()

        options_html: list[str] = []
        for letter in ("A", "B", "C", "D"):
            opt = (q.get(letter.lower()) or "").strip()
            if not opt:
                continue
            response = (q.get(f"response{letter.lower()}") or "").strip() or "Incorrect."
            correct_attr = ""
            if letter == correct:
                response = response if response != "Incorrect." else (f"Correct. {exp_one_line}" if exp_one_line else "Correct.")
                correct_attr = ' data-correct="1"'
            response_attr = _escape_attr(response)
            label_html = _escape_text(f"{letter}. {opt}")
            options_html.append(
                f'<button type="button" class="note-quiz-option"{correct_attr} data-response="{response_attr}">{label_html}</button>'
            )

        options_joined = "\n".join(options_html)
        q_title_html = _escape_text(q_text)
        active_class = " active" if idx == 1 else ""
        items_html.append(
            f'<div class="carousel-item{active_class}">\n'
            f'  <div class="note-quiz-question" data-question="{idx}">\n'
            f'    <div class="note-quiz-question-title">{q_title_html}</div>\n'
            f'    <div class="note-quiz-options">\n{options_joined}\n    </div>\n'
            f'    <div class="note-quiz-response" aria-live="polite"></div>\n'
            f"  </div>\n"
            f"</div>"
        )

    items_joined = "\n".join(items_html)
    return (
        f'<div class="note-quiz{extra_classes}">\n'
        '  <div class="note-quiz-header">\n'
        f'    <div class="note-quiz-title"><i class="fa-regular fa-circle-check me-2"></i>{_escape_text(title_text)}</div>\n'
        '    <div class="note-quiz-controls">\n'
        f'      <div class="note-quiz-progress" aria-live="polite">1 / {total}</div>\n'
        '      <button type="button" class="note-quiz-reset">Reset</button>\n'
        "    </div>\n"
        "  </div>\n"
        '  <div class="carousel slide note-quiz-carousel" data-bs-ride="false" data-bs-interval="false" data-bs-touch="true">\n'
        '    <div class="carousel-inner">\n'
        f"{items_joined}\n"
        "    </div>\n"
        "  </div>\n"
        "</div>"
    )


def _render_qaprompt_block_html(qaprompt: dict[str, str], *, block_id: str) -> str:
    prompt_text = (qaprompt.get("text") or "").strip()
    if not prompt_text:
        return ""
    prompt_title = (qaprompt.get("title") or "QA Generator Prompt").strip()
    prompt_text_escaped = _escape_text(prompt_text)
    full_id = f"{block_id}--full"
    append_core_attr = ' data-qa-append-core="1"' if qaprompt.get("append_core_markdown") == "1" else ""
    return (
        f'<div class="note-qa" data-qa-block="{_escape_attr(block_id)}">\n'
        '  <div class="note-qa-header">\n'
        f'    <h3 class="mb-0"><i class="fa-regular fa-circle-question me-2"></i>{_escape_text(prompt_title)}</h3>\n'
        f'    <button type="button" class="note-qa-copy" data-qa-source="#{_escape_attr(full_id)}"{append_core_attr}>\n'
        '      <i class="fa-regular fa-copy me-2"></i>Copy\n'
        '    </button>\n'
        '  </div>\n'
        '  <div class="note-markdown-block">\n'
        f'    <pre class="mb-0"><code class="note-qa-preview">{prompt_text_escaped}</code></pre>\n'
        '  </div>\n'
        f'  <pre class="d-none"><code id="{_escape_attr(full_id)}" class="note-qa-full">{prompt_text_escaped}</code></pre>\n'
        '</div>'
    )


def _render_qaprompt_section_html(qaprompt: dict[str, str], *, section_id: str) -> str:
    qa_html = _render_qaprompt_block_html(qaprompt, block_id=section_id)
    if not qa_html:
        return ""
    return (
        f'<section id="{_escape_attr(section_id)}" class="note-section note-qa-section" data-md-exclude="1" data-aos="fade-up" data-aos-delay="120">\n'
        '  <div class="note-callout">\n'
        f'{qa_html}\n'
        '  </div>\n'
        '</section>'
    )


def _render_reviewkit_html(
    summary_title: str,
    summary_id: str,
    takeaways_html: str,
    primary_html: str,
    prompt_html: str,
) -> str:
    takeaways_html = (takeaways_html or "").strip()
    primary_html = (primary_html or "").strip()
    prompt_html = (prompt_html or "").strip()
    panes: list[tuple[str, str, str, bool]] = []
    if takeaways_html:
        panes.append(("takeaways", "Key Takeaways", takeaways_html, False))
    if primary_html:
        panes.append(("quiz", "Quick Quiz", primary_html, False))
    if prompt_html:
        panes.append(("prompt", "Quiz Generator Prompt", prompt_html, True))

    if not panes:
        return ""

    body_html = ""
    if len(panes) == 1:
        _, _, pane_html, _ = panes[0]
        body_html = f'    <div class="note-reviewkit-body">\n{pane_html}\n    </div>\n'
    else:
        tab_base = _slugify(summary_id or summary_title or "reviewkit") or "reviewkit"
        tab_items: list[str] = []
        pane_items: list[str] = []
        for idx, (pane_key, pane_label, pane_html, exclude_from_md) in enumerate(panes):
            is_active = idx == 0
            tab_id = f"{tab_base}--{pane_key}-tab"
            pane_id = f"{tab_base}--{pane_key}-pane"
            tab_items.append(
                '      <li class="nav-item" role="presentation">\n'
                f'        <button class="nav-link{" active" if is_active else ""}" id="{_escape_attr(tab_id)}" data-bs-toggle="tab" data-bs-target="#{_escape_attr(pane_id)}" type="button" role="tab" aria-controls="{_escape_attr(pane_id)}" aria-selected="{"true" if is_active else "false"}">{_escape_text(pane_label)}</button>\n'
                '      </li>\n'
            )
            extra_attrs = ' data-md-exclude="1"' if exclude_from_md else ""
            pane_items.append(
                f'      <div class="tab-pane fade{" show active" if is_active else ""} note-reviewkit-pane note-reviewkit-pane-{_escape_attr(pane_key)}" id="{_escape_attr(pane_id)}" role="tabpanel" aria-labelledby="{_escape_attr(tab_id)}" tabindex="0"{extra_attrs}>\n'
                f'{pane_html}\n'
                '      </div>\n'
            )
        body_html = (
            '    <div class="note-reviewkit-body">\n'
            '      <ul class="nav nav-tabs mb-3 note-reviewkit-tabs" role="tablist">\n'
            f'{"".join(tab_items)}'
            '      </ul>\n'
            '      <div class="tab-content note-reviewkit-content">\n'
            f'{"".join(pane_items)}'
            '      </div>\n'
            '    </div>\n'
        )
    if not body_html.strip():
        return ""

    return (
        f'<section id="{_escape_attr(summary_id)}" class="note-section note-reviewkit note-summary-kit" data-md-exclude="1" data-aos="fade-up" data-aos-delay="120">\n'
        '  <div class="note-callout note-summary-kit-shell">\n'
        '    <div class="note-summary-kit-header">\n'
        f'      <h3 class="mb-0">{_escape_text(summary_title)}</h3>\n'
        '    </div>\n'
        f'{body_html}'
        '  </div>\n'
        '</section>'
    )
