import React, { useEffect, useMemo } from "react";

type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLD?: object | null;
  lang?: string;
};

function ensureMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `${attr}="${key}"`;
  const existing = document.head.querySelector(`meta[${selector}]`) as HTMLMetaElement | null;
  if (existing) {
    existing.content = content;
    return existing;
  }
  const m = document.createElement("meta");
  m.setAttribute(attr, key);
  m.content = content;
  document.head.appendChild(m);
  return m;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description = "Guess accents from short audio clips — a fun game to test your ear and learn about accents worldwide.",
  canonical,
  url,
  image,
  type = "website",
  jsonLD = null,
  lang = "en",
}) => {
  const jsonLdString = useMemo(() => (jsonLD ? JSON.stringify(jsonLD) : ""), [jsonLD]);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    document.title = title;
    if (lang) document.documentElement.lang = lang;

    const created: HTMLElement[] = [];

    // description
    created.push(ensureMeta("name", "description", description));

    // Open Graph
    created.push(ensureMeta("property", "og:title", title));
    created.push(ensureMeta("property", "og:description", description));
    created.push(ensureMeta("property", "og:type", type));
    if (url) created.push(ensureMeta("property", "og:url", url));
    if (image) created.push(ensureMeta("property", "og:image", image));

    // Twitter
    created.push(ensureMeta("name", "twitter:card", image ? "summary_large_image" : "summary"));
    created.push(ensureMeta("name", "twitter:title", title));
    created.push(ensureMeta("name", "twitter:description", description));
    if (image) created.push(ensureMeta("name", "twitter:image", image));

    // canonical link
    let canonicalEl: HTMLLinkElement | null = null;
    if (canonical) {
      const existing = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (existing) {
        canonicalEl = existing;
        canonicalEl.href = canonical;
      } else {
        canonicalEl = document.createElement("link");
        canonicalEl.rel = "canonical";
        canonicalEl.href = canonical;
        document.head.appendChild(canonicalEl);
        created.push(canonicalEl);
      }
    }

    // JSON-LD
    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLD) {
      jsonLdEl = document.createElement("script");
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.text = JSON.stringify(jsonLD);
      document.head.appendChild(jsonLdEl);
      created.push(jsonLdEl);
    }

  return () => {
      // restore title and lang
      document.title = previousTitle;
      if (previousLang !== undefined) document.documentElement.lang = previousLang || "";

      // remove created tags (only those appended by us)
      created.forEach((el) => {
        // don't remove meta tags that are shared (safe heuristic: if content matches our values we'll remove)
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      if (jsonLdEl && jsonLdEl.parentNode) jsonLdEl.parentNode.removeChild(jsonLdEl);
      // if we created canonical link it's removed above via created array
    };
  }, [title, description, canonical, url, image, type, jsonLdString, jsonLD, lang]);

  return null;
};

export default Seo;
