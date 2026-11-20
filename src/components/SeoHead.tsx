import React, { useEffect } from 'react';
import {
  ArticleSeoMeta,
  SeoContentType,
  updatePageMetadata,
} from '../utils/seo.ts';

export interface SeoHeadProps {
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

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  type = 'website',
  image,
  canonicalPath,
  keywords,
  noIndex = false,
  articleMeta,
  jsonLd,
}) => {
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : '';
  const serializedArticle = articleMeta ? JSON.stringify(articleMeta) : '';

  useEffect(() => {
    updatePageMetadata({
      title,
      description,
      type,
      image,
      canonicalPath,
      keywords,
      noIndex,
      articleMeta,
      jsonLd,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, type, image, canonicalPath, keywords, noIndex, serializedArticle, serializedJsonLd]);

  return null;
};
