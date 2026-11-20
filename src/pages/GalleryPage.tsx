import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { useGetGalleryQuery } from '../store/api/endpoints.ts';
import { GalleryItem } from '../types/domain.ts';

export const GalleryPage: React.FC = () => {
  const { data: items = [] } = useGetGalleryQuery(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxItem(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxItem]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const filtered = useMemo(
    () => items.filter((i) => selectedCategory === 'All' || i.category === selectedCategory),
    [items, selectedCategory]
  );

  return (
    <PublicLayout>
      <SeoHead
        title="Spa & Salon Gallery"
        description="Browse spa interiors, private treatment suites, hydrotherapy rooms, salon styling transformations, and bridal beauty looks."
        image="/images/salon_bridal.jpg"
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Visual Archive</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl lg:text-6xl">
            Spa Interiors &amp; Salon Transformations
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Curated visuals managed through our Admin Gallery. Replace sample architectural plates anytime with verified photography uploaded by the business.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="no-scrollbar mb-10 flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#183D35] text-[#FBF9F5]'
                  : 'border border-[#183D35]/15 bg-[#F6F0E7]/60 text-[#252525] hover:border-[#183D35]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 gap-7 space-y-7 sm:columns-2 lg:columns-3">
          {filtered.map((item, idx) => (
            <CalmReveal key={item.id} delay={(idx % 3) * 0.05} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setLightboxItem(item)}
                className="group block w-full border border-[#183D35]/12 bg-[#FBF9F5] text-left transition-colors hover:border-[#183D35]/35 focus-visible:outline-2 focus-visible:outline-[#183D35]"
              >
                <div className="overflow-hidden">
                  <LuxuryVisual
                    src={item.imageUrl}
                    alt={item.title}
                    visualKey={item.visualKey || 'spa_massage'}
                    aspectClass={item.mediaType === 'before_after' ? 'aspect-[3/4]' : 'aspect-[4/3]'}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-[#858078]">
                    <span>{item.category}</span>
                    {item.mediaType === 'before_after' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Before &amp; After</span>
                      </>
                    )}
                    {item.mediaType === 'video' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Reel / Video</span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-1.5 font-display text-2xl font-medium text-[#183D35]">
                    {item.title}
                  </h2>
                  {item.caption && <p className="mt-1 text-xs text-[#858078]">{item.caption}</p>}
                </div>
              </button>
            </CalmReveal>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C211C]/85 p-4 backdrop-blur-xs"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative w-full max-w-3xl border border-[#183D35]/20 bg-[#FBF9F5] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              aria-label="Close lightbox"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center border border-[#183D35]/15 text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-6">
              {lightboxItem.mediaType === 'before_after' && lightboxItem.beforeImageUrl ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#858078]">
                      Before
                    </p>
                    <LuxuryVisual
                      src={lightboxItem.beforeImageUrl}
                      alt={`${lightboxItem.title} — Before`}
                      visualKey={lightboxItem.visualKey || 'salon_haircut'}
                      aspectClass="aspect-[4/3]"
                    />
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#183D35]">
                      After
                    </p>
                    <LuxuryVisual
                      src={lightboxItem.imageUrl}
                      alt={`${lightboxItem.title} — After`}
                      visualKey={lightboxItem.visualKey || 'salon_keratin'}
                      aspectClass="aspect-[4/3]"
                    />
                  </div>
                </div>
              ) : (
                <LuxuryVisual
                  src={lightboxItem.imageUrl}
                  alt={lightboxItem.title}
                  visualKey={lightboxItem.visualKey || 'spa_massage'}
                  aspectClass="aspect-[16/10]"
                />
              )}
            </div>
            <div className="mt-5">
              <p className="text-xs text-[#858078]">{lightboxItem.category}</p>
              <h3 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                {lightboxItem.title}
              </h3>
              {lightboxItem.caption && (
                <p className="mt-1.5 text-sm text-[#252525]/82">{lightboxItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};
