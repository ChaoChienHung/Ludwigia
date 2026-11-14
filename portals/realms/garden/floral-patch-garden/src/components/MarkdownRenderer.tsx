import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const stripInformationTags = (input: string) =>
  String(input || '')
    .replace(/<information\b[^>]*>([\s\S]*?)<\/information>/gi, '$1')
    .replace(/<information\b[^/]*\/>/gi, '');

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const normalizedContent = stripInformationTags(String(content || '')).trim();
  const rootRef = useRef<HTMLDivElement | null>(null);
  if (!normalizedContent) return null;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLElement>('.katex').forEach((el) => {
      el.style.wordBreak = 'normal';
      el.style.overflowWrap = 'normal';
      el.style.whiteSpace = 'nowrap';
      if (el.parentElement?.classList.contains('katex-display')) {
        el.style.display = 'inline-block';
        el.style.minWidth = 'max-content';
        el.style.textAlign = 'center';
      } else {
        el.style.display = 'inline-flex';
        el.style.alignItems = 'baseline';
        el.style.flexWrap = 'nowrap';
        el.style.maxWidth = '100%';
      }
    });

    root.querySelectorAll<HTMLElement>('.katex-html, .katex .base').forEach((el) => {
      el.style.display = 'inline-block';
      el.style.whiteSpace = 'nowrap';
    });

    root.querySelectorAll<HTMLElement>('.katex-display').forEach((el) => {
      el.style.display = 'block';
      el.style.maxWidth = '100%';
      el.style.margin = '1rem 0 1.15rem';
      el.style.overflowX = 'auto';
      el.style.overflowY = 'hidden';
      el.style.paddingBottom = '0.15rem';
    });
  }, [normalizedContent]);

  return (
    <div ref={rootRef} className="garden-markdown text-emerald-100/95">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h2 className="font-accent font-black text-[1.85rem] sm:text-[2.2rem] text-white leading-[1.08] tracking-tight mt-2 mb-4">{children}</h2>,
          h2: ({ children }) => <h3 className="font-accent font-black text-[1.34rem] sm:text-[1.5rem] text-white leading-[1.18] tracking-tight mt-5 mb-3 pb-2 border-b border-[#142d22]">{children}</h3>,
          h3: ({ children }) => <h4 className="font-accent font-black text-[1.18rem] sm:text-[1.26rem] text-[#10b981] leading-[1.24] mt-4 mb-2">{children}</h4>,
          h4: ({ children }) => <h5 className="font-accent font-bold text-[1rem] sm:text-[1.06rem] text-amber-400 leading-[1.25] mt-3 mb-2">{children}</h5>,
          p: ({ children }) => <p className="text-justify font-sans text-[14px] sm:text-[16px] leading-8 text-emerald-200/90 my-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc my-3.5 ml-6 pl-4 space-y-2.5 text-[13px] sm:text-[15px] leading-7 text-emerald-200/90 marker:text-[#10b981] marker:font-semibold">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal my-3.5 ml-6 pl-5 space-y-2.5 text-[13px] sm:text-[15px] leading-7 text-emerald-200/90 marker:text-[#10b981] marker:font-semibold">{children}</ol>,
          li: ({ children }) => <li className="pl-2 [&>p]:my-1.5 [&>ul]:mt-2 [&>ol]:mt-2">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#10b981] pl-4 italic text-emerald-400/90 bg-[#07130f]/65 py-3 pr-3 rounded-r-xl my-3.5 font-sans text-[13px] sm:text-[15px] leading-7">{children}</blockquote>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] underline underline-offset-2 hover:text-[#bae6fd]">{children}</a>,
          code: ({ className, children, ...props }: any) => {
            const text = String(children ?? '');
            const isInlineCode = !className && !text.includes('\n');
            return isInlineCode ? (
              <code className="px-1.5 py-0.5 rounded bg-[#030604] border border-[#122e22] font-mono text-3xs sm:text-2xs text-[#34d399] font-bold mx-0.5" {...props}>
                {children}
              </code>
            ) : (
              <code className={`block leading-relaxed whitespace-pre ${className || ''}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="p-4 rounded-xl bg-[#030604] border border-[#122e22] font-mono text-3xs sm:text-2xs overflow-x-auto text-[#10b981] my-4 shadow-inner">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[#142d22] bg-[#050a08]/50 shadow-inner">
              <table className="w-full text-left border-collapse text-[12px] sm:text-[13px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#0b1411]">{children}</thead>,
          tr: ({ children }) => <tr className="odd:bg-transparent even:bg-[#050e0b]/30">{children}</tr>,
          th: ({ children }) => <th className="p-3.5 border-b border-[#142d22] font-semibold text-[#10b981] uppercase tracking-wider text-[11px] font-accent">{children}</th>,
          td: ({ children }) => <td className="p-3.5 border-b border-[#12271d]/50 text-emerald-300 align-top leading-6">{children}</td>,
          hr: () => <hr className="my-6 border-0 border-t border-[#142d22]" />,
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
