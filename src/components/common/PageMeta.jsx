/**
 * PageMeta
 * Per-page title/description/canonical/hreflang.
 *
 * Deliberately NOT using React 19's native <title>/<meta>/<link> JSX hoisting:
 * verified it only de-duplicates tags that React itself rendered — it has no
 * knowledge of the static tags already baked into index.html (needed there
 * for the very first paint / non-JS crawlers), so JSX-rendering these again
 * produced two conflicting <meta name="description"> and two <link
 * rel="canonical"> tags in the DOM per page. Two canonical URLs on one page
 * is a worse signal than having none. Instead, find-and-update the existing
 * head elements in place via a plain effect — exactly one of each tag, ever.
 */

import { useEffect } from 'react';

const SITE_URL = 'https://www.human-firstai.com';

function upsertMeta(attrName, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, hreflang, href) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function PageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertLink('canonical', null, url);

    // hreflang: the `sv` URL is real and crawlable — src/utils/i18n.js reads
    // ?lng= on load, and the language switchers write it back to the URL on
    // change — so this isn't pointing at a URL that doesn't actually render
    // in that language.
    upsertLink('alternate', 'en', url);
    upsertLink('alternate', 'sv', `${url}?lng=sv`);
    upsertLink('alternate', 'x-default', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    upsertMeta('name', 'robots', noindex ? 'noindex' : 'index, follow');
  }, [title, description, path, noindex]);

  return null;
}
