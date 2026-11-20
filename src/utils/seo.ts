export const SITE_NAME = 'Healing Touch Spa & Saloon';
export const DEFAULT_OG_IMAGE = '/images/hero_sanctuary.jpg';
export const BUSINESS_LOCATION = 'Aadarsh Nagar, Birgunj, Madhesh Province, Nepal';

export type SeoContentType = 'website' | 'article' | 'product';

export interface ArticleSeoMeta {
  publishedTime?: string;
  author?: string;
  section?: string;
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  type?: SeoContentType;
  image?: string;
  canonicalPath?: string;
  keywords?: string;
  noIndex?: boolean;
  articleMeta?: ArticleSeoMeta;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function resolveCanonicalUrl(canonicalPath?: string): string {
  if (typeof window === 'undefined') return '';
  const path = canonicalPath
    ? canonicalPath.startsWith('/')
      ? canonicalPath
      : `/${canonicalPath}`
    : window.location.pathname;
  return `${window.location.origin}${path}`;
}

export function resolveAbsoluteMediaUrl(imagePath?: string): string {
  const target = imagePath && imagePath.trim() ? imagePath.trim() : DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(target)) return target;
  if (typeof window === 'undefined') return target;
  const normalized = target.startsWith('/') ? target : `/${target}`;
  return `${window.location.origin}${normalized}`;
}

function formatBrandedTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return SITE_NAME;
  if (trimmed.toLowerCase().includes('healing touch')) return trimmed;
  return `${trimmed} | ${SITE_NAME}`;
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaTag(attr: 'name' | 'property', key: string): void {
  if (typeof document === 'undefined') return;
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.remove();
}

function upsertLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function buildLocalBusinessJsonLd(canonicalUrl: string, imageUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'DaySpa',
    name: SITE_NAME,
    description:
      'Luxury spa treatments, couples hydrotherapy suites, and bespoke unisex hair & beauty salon services in Aadarsh Nagar, Birgunj, Nepal.',
    url: canonicalUrl,
    image: imageUrl,
    telephone: '+977 982-3945000',
    priceRange: 'NPR 400 - NPR 18000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Aadarsh Nagar',
      addressLocality: 'Birgunj',
      addressRegion: 'Madhesh Province',
      addressCountry: 'NP',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '20:30',
      },
    ],
    sameAs: ['https://www.facebook.com/healingtouchbrj'],
  };
}

export function updatePageMetadata(options: PageMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const fullTitle = formatBrandedTitle(options.title);
  const cleanDescription = options.description.trim();
  const canonicalUrl = resolveCanonicalUrl(options.canonicalPath);
  const absoluteImageUrl = resolveAbsoluteMediaUrl(options.image);
  const ogType = options.type || 'website';

  // Document Title & Standard Meta
  document.title = fullTitle;
  upsertMetaTag('name', 'description', cleanDescription);
  if (options.keywords) {
    upsertMetaTag('name', 'keywords', options.keywords);
  } else {
    removeMetaTag('name', 'keywords');
  }
  upsertMetaTag('name', 'robots', options.noIndex ? 'noindex, nofollow' : 'index, follow');

  if (canonicalUrl) {
    upsertLinkTag('canonical', canonicalUrl);
    upsertMetaTag('property', 'og:url', canonicalUrl);
  }

  // OpenGraph Metadata
  upsertMetaTag('property', 'og:type', ogType);
  upsertMetaTag('property', 'og:site_name', SITE_NAME);
  upsertMetaTag('property', 'og:locale', 'en_NP');
  upsertMetaTag('property', 'og:title', fullTitle);
  upsertMetaTag('property', 'og:description', cleanDescription);
  upsertMetaTag('property', 'og:image', absoluteImageUrl);

  // Article-specific OpenGraph tags
  if (ogType === 'article' && options.articleMeta) {
    if (options.articleMeta.publishedTime) {
      upsertMetaTag('property', 'article:published_time', options.articleMeta.publishedTime);
    } else {
      removeMetaTag('property', 'article:published_time');
    }
    if (options.articleMeta.author) {
      upsertMetaTag('property', 'article:author', options.articleMeta.author);
    } else {
      removeMetaTag('property', 'article:author');
    }
    if (options.articleMeta.section) {
      upsertMetaTag('property', 'article:section', options.articleMeta.section);
    } else {
      removeMetaTag('property', 'article:section');
    }
  } else {
    removeMetaTag('property', 'article:published_time');
    removeMetaTag('property', 'article:author');
    removeMetaTag('property', 'article:section');
  }

  // Twitter / X Card Metadata
  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', fullTitle);
  upsertMetaTag('name', 'twitter:description', cleanDescription);
  upsertMetaTag('name', 'twitter:image', absoluteImageUrl);

  // Schema.org JSON-LD
  const scriptId = 'healing-touch-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const baseSchema = buildLocalBusinessJsonLd(canonicalUrl, absoluteImageUrl);
  const payload = options.jsonLd
    ? Array.isArray(options.jsonLd)
      ? [baseSchema, ...options.jsonLd]
      : [baseSchema, options.jsonLd]
    : baseSchema;

  script.textContent = JSON.stringify(payload);
}
