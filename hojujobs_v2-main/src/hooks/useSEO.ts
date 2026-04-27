import { useEffect } from "react";

function useDocumentLangOverride(lang: string | undefined) {
  useEffect(() => {
    if (lang == null) return;
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  /** Document language (BCP 47) for the active route, e.g. "ko" or "en". Resets on navigation. */
  htmlLang?: string;
  /** Open Graph locale, e.g. "ko_KR" or "en_AU" */
  ogLocale?: string;
  jsonLd?: Record<string, unknown>;
  /** Prevent search engines from indexing this page */
  noindex?: boolean;
}

export function useSEO({ title, description, canonical, keywords, htmlLang, ogLocale, jsonLd, noindex }: SEOProps) {
  useDocumentLangOverride(htmlLang);

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    }
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", "Hoju Jobs");
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:site", "@hojujobs");
    if (ogLocale) {
      setMeta("property", "og:locale", ogLocale);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // JSON-LD
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [title, description, canonical, keywords, htmlLang, ogLocale, jsonLd]);
}
