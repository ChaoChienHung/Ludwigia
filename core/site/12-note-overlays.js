const createNoteTocVisibilitySync = (tocLinks) => {
  const isVisibleTarget = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.hidden) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    return el.getClientRects().length > 0;
  };
  return () => {
    tocLinks.forEach((link) => {
      const href = String(link.getAttribute("href") || "");
      if (!href.startsWith("#")) {
        link.hidden = false;
        return;
      }
      const target = document.getElementById(href.slice(1));
      link.hidden = !isVisibleTarget(target);
    });
  };
};

const initNoteOverlays = () => {
  if (!isNotesPage) return;

  const overlaySelectors = [
    ".note-toc-hover-zone",
    ".note-toc-backdrop",
    ".note-toc-fab",
    ".note-toc-overlay",
    ".note-meta-hover-zone",
    ".note-meta-fab",
    ".note-meta-overlay",
  ];
  overlaySelectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (!el || el.parentElement === document.body) return;
    document.body.appendChild(el);
  });

  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches;
  const tocFab = document.querySelector(".note-toc-fab");
  const tocHoverZone = document.querySelector(".note-toc-hover-zone");
  const tocBackdrop = document.querySelector(".note-toc-backdrop");
  const tocOverlay = document.querySelector(".note-toc-overlay");
  const metaFab = document.querySelector(".note-meta-fab");
  const metaHoverZone = document.querySelector(".note-meta-hover-zone");
  const metaOverlay = document.querySelector(".note-meta-overlay");

  const closeNoteToc = () => document.body.classList.remove("note-toc-open");
  const toggleNoteToc = () => document.body.classList.toggle("note-toc-open");
  const closeNoteMeta = () => document.body.classList.remove("note-meta-open");
  const toggleNoteMeta = () => document.body.classList.toggle("note-meta-open");
  const openNoteToc = () => document.body.classList.add("note-toc-open");
  const openNoteMeta = () => document.body.classList.add("note-meta-open");
  const ensureLegacyNoteToc = () => {
    if (!tocOverlay) return [];
    const existingLinks = Array.from(tocOverlay.querySelectorAll("a.note-toc-link"));
    if (existingLinks.length > 0) return existingLinks;

    const tocNav = tocOverlay.querySelector(".note-toc");
    const noteContent = document.querySelector(".note-content");
    if (!tocNav || !noteContent) return existingLinks;

    const slugCounts = new Map();
    const slugify = (text) => {
      const base = String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return base || "section";
    };

    const makeUniqueId = (text) => {
      const slug = slugify(text);
      const count = slugCounts.get(slug) || 0;
      slugCounts.set(slug, count + 1);
      return count === 0 ? slug : `${slug}-${count + 1}`;
    };

    const headings = Array.from(noteContent.querySelectorAll("h3, h4, h5, h6")).filter((heading) => {
      return String(heading.textContent || "").trim().length > 0;
    });
    if (headings.length === 0) return existingLinks;

    tocNav.innerHTML = "";
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = makeUniqueId(heading.textContent || "");
      }
      const link = document.createElement("a");
      link.className = "note-toc-link";
      if (heading.tagName === "H5" || heading.tagName === "H6") {
        link.classList.add("level-2");
      } else {
        link.classList.add("level-1");
      }
      link.href = `#${heading.id}`;
      link.textContent = String(heading.textContent || "").trim();
      tocNav.appendChild(link);
    });

    return Array.from(tocNav.querySelectorAll("a.note-toc-link"));
  };

  const tocLinks = ensureLegacyNoteToc();
  let tocHoverCloseTimer = null;
  let metaHoverCloseTimer = null;

  const syncTocLinksForCurrentMode = createNoteTocVisibilitySync(tocLinks);

  const clearHoverTimer = (timerId) => {
    if (timerId) window.clearTimeout(timerId);
    return null;
  };

  const attachSwipeClose = (overlay, direction, onClose) => {
    if (!overlay) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    overlay.addEventListener("touchstart", (event) => {
      if (!isPhoneViewport() || event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    overlay.addEventListener("touchend", (event) => {
      if (!tracking || !isPhoneViewport()) return;
      tracking = false;
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) > 48) return;
      if (direction === "left" && deltaX <= -56) onClose();
      if (direction === "right" && deltaX >= 56) onClose();
    }, { passive: true });

    overlay.addEventListener("touchcancel", () => {
      tracking = false;
    }, { passive: true });
  };

  const scheduleHoverClose = (which) => {
    const close = which === "toc" ? closeNoteToc : closeNoteMeta;
    const timer = window.setTimeout(close, 140);
    if (which === "toc") {
      tocHoverCloseTimer = timer;
    } else {
      metaHoverCloseTimer = timer;
    }
  };

  if (tocFab && tocBackdrop && tocOverlay) {
    tocFab.addEventListener("click", () => {
      closeNoteMeta();
      toggleNoteToc();
    });
    tocOverlay.addEventListener("click", (e) => {
      const link = e.target.closest("a.note-toc-link");
      if (link) closeNoteToc();
    });
  }

  if (supportsHover && tocHoverZone && tocOverlay) {
    const openFromHover = () => {
      tocHoverCloseTimer = clearHoverTimer(tocHoverCloseTimer);
      closeNoteMeta();
      openNoteToc();
    };
    const closeFromHover = () => {
      tocHoverCloseTimer = clearHoverTimer(tocHoverCloseTimer);
      scheduleHoverClose("toc");
    };
    tocHoverZone.addEventListener("mouseenter", openFromHover);
    tocOverlay.addEventListener("mouseenter", openFromHover);
    tocHoverZone.addEventListener("mouseleave", closeFromHover);
    tocOverlay.addEventListener("mouseleave", closeFromHover);
  }

  if (metaFab && tocBackdrop && metaOverlay) {
    metaFab.addEventListener("click", () => {
      closeNoteToc();
      toggleNoteMeta();
    });
    metaOverlay.addEventListener("click", (e) => {
      const link = e.target.closest("#note-tags a");
      if (link) closeNoteMeta();
    });
  }

  if (supportsHover && metaHoverZone && metaOverlay) {
    const openFromHover = () => {
      metaHoverCloseTimer = clearHoverTimer(metaHoverCloseTimer);
      closeNoteToc();
      openNoteMeta();
    };
    const closeFromHover = () => {
      metaHoverCloseTimer = clearHoverTimer(metaHoverCloseTimer);
      scheduleHoverClose("meta");
    };
    metaHoverZone.addEventListener("mouseenter", openFromHover);
    metaOverlay.addEventListener("mouseenter", openFromHover);
    metaHoverZone.addEventListener("mouseleave", closeFromHover);
    metaOverlay.addEventListener("mouseleave", closeFromHover);
  }

  document.addEventListener("ludwig-open-note-toc", () => {
    closeNoteMeta();
    openNoteToc();
  });

  document.addEventListener("ludwig-open-note-meta", () => {
    closeNoteToc();
    openNoteMeta();
  });

  attachSwipeClose(tocOverlay, "left", closeNoteToc);
  attachSwipeClose(metaOverlay, "right", closeNoteMeta);

  if (tocBackdrop) {
    tocBackdrop.addEventListener("click", () => {
      closeNoteToc();
      closeNoteMeta();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNoteToc();
      closeNoteMeta();
    }
  });

  syncTocLinksForCurrentMode();
  window.addEventListener("ludwig-reading-mode-changed", () => {
    syncTocLinksForCurrentMode();
    if (document.body.classList.contains("note-toc-open")) {
      closeNoteMeta();
    }
  });
};

const initImageViewer = () => {
  const candidates = Array.from(
    document.querySelectorAll(
      ".note-content img, .garden-note-panel-content img, .section-entry-cover img, .garden-result-cover img"
    )
  );
  if (candidates.length === 0) return;

  let overlay = document.getElementById("site-image-viewer");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "site-image-viewer";
    overlay.className = "site-image-viewer";
    overlay.innerHTML = `
      <div class="site-image-viewer-backdrop" data-image-viewer-close></div>
      <figure class="site-image-viewer-figure" role="dialog" aria-modal="true" aria-label="Image viewer">
        <img class="site-image-viewer-image" alt="">
        <figcaption class="site-image-viewer-caption"></figcaption>
        <button type="button" class="site-image-viewer-close" data-image-viewer-close aria-label="Close image viewer">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </figure>
    `;
    document.body.appendChild(overlay);
  }

  const imageEl = overlay.querySelector(".site-image-viewer-image");
  const captionEl = overlay.querySelector(".site-image-viewer-caption");
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("site-image-viewer-open");
    if (imageEl) {
      imageEl.removeAttribute("src");
      imageEl.setAttribute("alt", "");
    }
    if (captionEl) captionEl.textContent = "";
  };
  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-image-viewer-close]")) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      close();
    }
  });

  const extractCaption = (img) => {
    const figure = img.closest("figure");
    const figCaption = figure ? figure.querySelector("figcaption") : null;
    if (figCaption) return String(figCaption.textContent || "").trim();
    return String(img.getAttribute("alt") || img.getAttribute("title") || "").trim();
  };

  candidates.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.imageViewerBound === "1") return;
    if (img.closest(".no-image-viewer,[data-image-viewer='off']")) return;
    img.dataset.imageViewerBound = "1";
    img.classList.add("image-viewer-target");
    img.setAttribute("tabindex", img.getAttribute("tabindex") || "0");
    img.setAttribute("role", "button");

    const openFromImage = () => {
      const src = img.currentSrc || img.getAttribute("src") || "";
      if (!src || !imageEl || !captionEl) return;
      imageEl.setAttribute("src", src);
      imageEl.setAttribute("alt", img.getAttribute("alt") || "");
      captionEl.textContent = extractCaption(img);
      overlay.classList.add("is-open");
      document.body.classList.add("site-image-viewer-open");
    };

    const shouldBypassViewer = (event, anchor) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
      if (anchor && String(anchor.getAttribute("data-image-viewer") || "").toLowerCase() === "link-only") {
        return true;
      }
      return false;
    };

    img.addEventListener("click", (event) => {
      const anchor = img.closest("a[href]");
      if (shouldBypassViewer(event, anchor)) return;
      event.preventDefault();
      openFromImage();
    });
    img.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const anchor = img.closest("a[href]");
      if (shouldBypassViewer(event, anchor)) return;
      event.preventDefault();
      openFromImage();
    });
  });
};

const initNoteQuizzes = () => {
  if (!isNotesPage) return;
  const quizEls = Array.from(document.querySelectorAll(".note-quiz"));
  if (quizEls.length === 0) return;

  quizEls.forEach((quizEl) => {
    const carouselEl = quizEl.querySelector(".note-quiz-carousel");
    const progressEl = quizEl.querySelector(".note-quiz-progress");
    const resetBtn = quizEl.querySelector(".note-quiz-reset");
    if (!carouselEl || !progressEl) return;

    const getItems = () => Array.from(carouselEl.querySelectorAll(".carousel-item"));
    const updateProgress = () => {
      const items = getItems();
      const idx = items.findIndex((x) => x.classList.contains("active"));
      const current = idx >= 0 ? idx + 1 : 1;
      progressEl.textContent = `${current} / ${items.length}`;
    };

    const ensureNavButtons = () => {
      const hasPrev = !!carouselEl.querySelector(".note-quiz-prev");
      const hasNext = !!carouselEl.querySelector(".note-quiz-next");
      if (hasPrev && hasNext) return;

      const makeBtn = (kind) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `carousel-control-${kind} note-quiz-nav note-quiz-${kind}`;
        btn.innerHTML = `<span class="carousel-control-${kind}-icon" aria-hidden="true"></span><span class="visually-hidden">${kind === "prev" ? "Previous" : "Next"}</span>`;
        return btn;
      };

      if (!hasPrev) carouselEl.appendChild(makeBtn("prev"));
      if (!hasNext) carouselEl.appendChild(makeBtn("next"));
    };

    ensureNavButtons();

    carouselEl.addEventListener("slid.bs.carousel", updateProgress);
    updateProgress();

    quizEl.addEventListener("click", (e) => {
      const navBtn = e.target.closest(".note-quiz-prev, .note-quiz-next");
      if (navBtn) {
        const bs = window.bootstrap?.Carousel?.getOrCreateInstance(carouselEl, { interval: false, ride: false, touch: true });
        if (!bs) return;
        if (navBtn.classList.contains("note-quiz-prev")) bs.prev();
        else bs.next();
        return;
      }

      const btn = e.target.closest(".note-quiz-option");
      if (!btn) return;
      const q = btn.closest(".note-quiz-question");
      if (!q) return;
      const responseEl = q.querySelector(".note-quiz-response");
      if (!responseEl) return;

      q.querySelectorAll(".note-quiz-option").forEach((b) => {
        b.classList.remove("is-selected", "is-correct", "is-wrong", "is-revealed-correct");
      });

      btn.classList.add("is-selected");
      const isCorrect = btn.getAttribute("data-correct") === "1";
      btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
      if (!isCorrect) {
        const correctBtn = q.querySelector('.note-quiz-option[data-correct="1"]');
        if (correctBtn && correctBtn !== btn) correctBtn.classList.add("is-revealed-correct");
      }
      responseEl.classList.toggle("is-correct", isCorrect);
      responseEl.classList.toggle("is-wrong", !isCorrect);
      responseEl.textContent = btn.getAttribute("data-response") || "";
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        quizEl.querySelectorAll(".note-quiz-option").forEach((b) => {
          b.classList.remove("is-selected", "is-correct", "is-wrong", "is-revealed-correct");
        });
        quizEl.querySelectorAll(".note-quiz-response").forEach((r) => {
          r.classList.remove("is-correct", "is-wrong");
          r.textContent = "";
        });
        const bs = window.bootstrap?.Carousel?.getOrCreateInstance(carouselEl, { interval: false, ride: false, touch: true });
        if (bs) bs.to(0);
        updateProgress();
      });
    }
  });
};

const initNoteQaPromptCopy = () => {
  if (!isNotesPage) return;
  const blocks = Array.from(document.querySelectorAll(".note-qa"));
  if (blocks.length === 0) return;

  blocks.forEach((block) => {
    const btn = block.querySelector(".note-qa-copy");
    if (!btn) return;

    const getFullText = async () => {
      const sourceSel = btn.getAttribute("data-qa-source");
      let text = "";
      if (sourceSel) {
        const srcEl = block.querySelector(sourceSel) || document.querySelector(sourceSel);
        text = srcEl ? (srcEl.innerText || srcEl.textContent || "") : "";
      } else {
        const fullEl = block.querySelector(".note-qa-full");
        text = fullEl ? (fullEl.innerText || fullEl.textContent || "") : "";
      }

      if (btn.getAttribute("data-qa-append-core") === "1") {
        const coreMd = await getNoteMarkdown();
        if (coreMd) {
          return `${String(text || "").trim()}\n\nInput:\n${coreMd}`;
        }
      }

      return text;
    };

    const previewEl = block.querySelector(".note-qa-preview");
    if (previewEl) {
      const sourceSel = btn.getAttribute("data-qa-source");
      const srcEl = sourceSel ? (block.querySelector(sourceSel) || document.querySelector(sourceSel)) : null;
      const full = srcEl ? (srcEl.innerText || srcEl.textContent || "") : "";
      const [head] = full.split(/\nInput:\n/);
      previewEl.textContent = String(head || "").trim();
    }

    btn.addEventListener("click", async () => {
      try {
        const txt = await getFullText();
        const success = await copyTextToClipboard(txt);
        if (success) {
          btn.classList.add("is-copied");
          setTimeout(() => btn.classList.remove("is-copied"), 1200);
        } else {
          btn.classList.add("is-failed");
          setTimeout(() => btn.classList.remove("is-failed"), 1200);
        }
      } catch (e) {
        btn.classList.add("is-failed");
        setTimeout(() => btn.classList.remove("is-failed"), 1200);
      }
    });
  });
};

deferNonCriticalInit(() => {
  ensureLanguageSwitcher();
  initNoteRelated();
  initNoteQuizzes();
  initNoteQaPromptCopy();
  initNoteOverlays();
  initImageViewer();
});

renderMathInElementSafely(document.querySelector(".note-content") || document.body);
