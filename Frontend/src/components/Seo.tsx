import React, { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../constants/site';

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: JsonLd | JsonLd[];
}

const toAbsoluteUrl = (value?: string) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const upsertMeta = (selector: string, create: () => HTMLMetaElement, content?: string) => {
  const head = document.head;
  let element = head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = create();
    head.appendChild(element);
  }
  if (typeof content === 'string') {
    element.setAttribute('content', content);
  }
};

const upsertLink = (selector: string, create: () => HTMLLinkElement, href: string) => {
  const head = document.head;
  let element = head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = create();
    head.appendChild(element);
  }
  element.href = href;
};

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  canonicalUrl,
  image,
  type = 'website',
  noIndex = false,
  keywords,
  publishedTime,
  modifiedTime,
  jsonLd,
}) => {
  const resolvedCanonical = canonicalUrl ?? toAbsoluteUrl(path) ?? SITE_URL;
  const resolvedImage = toAbsoluteUrl(image) ?? DEFAULT_OG_IMAGE;
  const resolvedJsonLd = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'description';
      return meta;
    }, description);

    upsertMeta('meta[name="keywords"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      return meta;
    }, keywords?.join(', '));

    upsertMeta('meta[name="robots"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      return meta;
    }, noIndex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('meta[property="og:site_name"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:site_name');
      return meta;
    }, SITE_NAME);

    upsertMeta('meta[property="og:type"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      return meta;
    }, type);

    upsertMeta('meta[property="og:title"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      return meta;
    }, title);

    upsertMeta('meta[property="og:description"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      return meta;
    }, description);

    upsertMeta('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    }, resolvedCanonical);

    upsertMeta('meta[property="og:image"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      return meta;
    }, resolvedImage);

    upsertMeta('meta[name="twitter:card"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:card';
      return meta;
    }, 'summary_large_image');

    upsertMeta('meta[name="twitter:title"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:title';
      return meta;
    }, title);

    upsertMeta('meta[name="twitter:description"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:description';
      return meta;
    }, description);

    upsertMeta('meta[name="twitter:image"]', () => {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      return meta;
    }, resolvedImage);

    upsertMeta('meta[property="article:published_time"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:published_time');
      return meta;
    }, publishedTime ?? '');

    upsertMeta('meta[property="article:modified_time"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:modified_time');
      return meta;
    }, modifiedTime ?? '');

    upsertLink('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    }, resolvedCanonical);
  }, [description, keywords, modifiedTime, noIndex, publishedTime, resolvedCanonical, resolvedImage, title, type]);

  return (
    <>
      {resolvedJsonLd.map((item, index) => (
        <script
          key={`${title}-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
};
