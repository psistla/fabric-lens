import { useEffect } from 'react';

const SITE = 'https://www.fabric-lens.com';

interface PageMeta {
  /** Route path, e.g. '/about'. Becomes the canonical and og:url. */
  path: string;
  /** Full page title. Sets document.title as well as og:title and twitter:title. */
  title: string;
  description: string;
}

function setAttr(selector: string, attr: string, value: string): string | null {
  const el = document.head.querySelector(selector);
  if (!el) return null;
  const previous = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return previous;
}

/**
 * Overrides the head tags `index.html` hardcodes for the root URL, so a
 * secondary public route stops self-canonicalizing to `/`. Restores the
 * originals on unmount, which is what keeps every other route (and the
 * landing page, which does not call this) on the site-level defaults.
 *
 * Only useful on the public marketing routes — authenticated app pages are
 * `noindex` and want the title hook alone.
 */
export function usePageMeta({ path, title, description }: PageMeta) {
  useEffect(() => {
    const url = SITE + path;
    const restore = [
      ['link[rel="canonical"]', 'href', setAttr('link[rel="canonical"]', 'href', url)],
      ['meta[name="description"]', 'content', setAttr('meta[name="description"]', 'content', description)],
      ['meta[property="og:url"]', 'content', setAttr('meta[property="og:url"]', 'content', url)],
      ['meta[property="og:title"]', 'content', setAttr('meta[property="og:title"]', 'content', title)],
      ['meta[property="og:description"]', 'content', setAttr('meta[property="og:description"]', 'content', description)],
      ['meta[name="twitter:title"]', 'content', setAttr('meta[name="twitter:title"]', 'content', title)],
      ['meta[name="twitter:description"]', 'content', setAttr('meta[name="twitter:description"]', 'content', description)],
    ] as const;

    // Owns document.title too, so the crafted SEO title is what ships in <title>.
    // Pages using this must NOT also call useDocumentTitle, which would win the race.
    const previousTitle = document.title;
    document.title = title;

    return () => {
      for (const [selector, attr, previous] of restore) {
        if (previous !== null) setAttr(selector, attr, previous);
      }
      document.title = previousTitle;
    };
  }, [path, title, description]);
}
