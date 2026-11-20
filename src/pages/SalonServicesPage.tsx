import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { TreatmentRitualModal } from '../components/ui/TreatmentRitualModal.tsx';
import { useTranslationText } from '../i18n/translations.ts';
import { useGetCategoriesQuery, useGetSalonServicesQuery } from '../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setBookingDraft } from '../store/slices/uiSlice.ts';
import { SalonService } from '../types/domain.ts';
import { formatDuration, formatNpr } from '../utils/nepal.ts';

export const SalonServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const t = useTranslationText(lang);

  const { data: services = [], isLoading } = useGetSalonServicesQuery(false);
  const { data: categories = [] } = useGetCategoriesQuery(false);

  const [audienceFilter, setAudienceFilter] = useState<'all' | 'women' | 'men' | 'unisex'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [inspected, setInspected] = useState<SalonService | null>(null);

  const salonCategories = useMemo(
    () => categories.filter((c) => c.division === 'salon'),
    [categories]
  );

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const audMatch =
        audienceFilter === 'all' || s.audience === audienceFilter || s.audience === 'unisex';
      const catMatch = selectedCategory === 'All' || s.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const textMatch =
        !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return audMatch && catMatch && textMatch;
    });
  }, [services, audienceFilter, selectedCategory, search]);

  const handleBook = (serviceId: string) => {
    dispatch(setBookingDraft({ category: 'salon', serviceIds: [serviceId], isCouple: false }));
    navigate('/booking');
  };

  const salonJsonLd = useMemo(() => {
    if (inspected) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: inspected.name,
        description: inspected.description,
        serviceType: inspected.category,
        provider: {
          '@type': 'BeautySalon',
          name: 'Healing Touch Spa & Saloon',
        },
        offers: {
          '@type': 'Offer',
          price: String(inspected.priceNpr),
          priceCurrency: 'NPR',
        },
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: 'Healing Touch Unisex Hair & Beauty Salon',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Unisex Hair, Skincare & Bridal Salon Services',
        itemListElement: filtered.slice(0, 10).map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description,
          },
          price: String(s.priceNpr),
          priceCurrency: 'NPR',
        })),
      },
    };
  }, [filtered, inspected]);

  return (
    <PublicLayout>
      <SeoHead
        title={inspected ? `${inspected.name} — Salon Studio` : 'Unisex Hair & Beauty Salon'}
        description={
          inspected
            ? `${inspected.description} (${formatDuration(inspected.durationMinutes, lang)}, ${formatNpr(inspected.priceNpr, lang)}).`
            : "Men's and women's precision haircuts, beard grooming, hair coloring, keratin smoothing, botanical facials, bridal makeup, and manicure/pedicure in Birgunj."
        }
        image={inspected?.imageUrl || '/images/salon_lounge.jpg'}
        keywords="unisex salon Birgunj, hair stylist Birgunj, keratin treatment Nepal, bridal makeup Birgunj, facial manicure pedicure"
        jsonLd={salonJsonLd}
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#FAF6EF] py-14 lg:py-18">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
              Unisex Hair, Skincare &amp; Bridal Studio
            </p>
            <h1 className="font-display text-4xl font-medium leading-tight text-[#183D35] sm:text-5xl">
              {t.featuredSalonTitle}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
              Welcoming men and women for tailored haircuts, hot-towel beard grooming, frizz-control keratin smoothing, botanical facials, manicure/pedicure, and bridal makeup artistry.
            </p>
          </div>
          <div className="hidden lg:col-span-5 lg:grid lg:grid-cols-2 lg:gap-3">
            <div className="overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Unisex hair styling studio mirrors"
                visualKey="salon_lounge"
                aspectClass="aspect-[4/3]"
              />
            </div>
            <div className="overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Bridal makeup vanity and artistry"
                visualKey="salon_bridal"
                aspectClass="aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-5 border-b border-[#183D35]/10 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex border border-[#183D35]/15 bg-[#F6F0E7]/60 p-1">
              {(['all', 'women', 'men', 'unisex'] as const).map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setAudienceFilter(aud)}
                  className={`px-4 py-2 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    audienceFilter === aud
                      ? 'bg-[#183D35] text-[#FBF9F5]'
                      : 'text-[#252525] hover:text-[#183D35]'
                  }`}
                >
                  {aud === 'all' ? 'All Guests' : aud}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858078]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search salon services..."
                className="w-full border border-[#183D35]/20 bg-white py-2.5 pl-10 pr-3 text-sm text-[#252525] focus:border-[#183D35] focus:outline-none"
              />
            </div>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#183D35] text-[#FBF9F5]'
                  : 'border border-[#183D35]/15 bg-[#FBF9F5] text-[#252525] hover:border-[#183D35]'
              }`}
            >
              All Categories
            </button>
            {salonCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-[#183D35] text-[#FBF9F5]'
                    : 'border border-[#183D35]/15 bg-[#FBF9F5] text-[#252525] hover:border-[#183D35]'
                }`}
              >
                {lang === 'ne' && cat.nameNe ? cat.nameNe : cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse border border-[#183D35]/10 bg-[#F6F0E7]/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service, idx) => (
              <CalmReveal key={service.id} delay={(idx % 3) * 0.04}>
                <article className="group flex h-full flex-col border border-[#183D35]/12 bg-[#FBF9F5] transition-colors duration-200 hover:border-[#183D35]/35">
                  <div className="overflow-hidden">
                    <LuxuryVisual
                      src={service.imageUrl}
                      alt={service.name}
                      visualKey={service.visualKey || 'salon_lounge'}
                      aspectClass="aspect-[4/3]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-[#858078]">
                      <span className="capitalize">{service.audience}</span>
                      <span aria-hidden="true">·</span>
                      <span>{service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatDuration(service.durationMinutes, lang)}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-2xl font-medium text-[#183D35]">
                      {lang === 'ne' && service.nameNe ? service.nameNe : service.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#252525]/80">
                      {service.description}
                    </p>
                    <div className="mt-5 space-y-4 border-t border-[#183D35]/10 pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-base font-semibold tabular-nums text-[#183D35]">
                          {formatNpr(service.priceNpr, lang)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspected(service)}
                          className="text-xs font-medium text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
                        >
                          Details
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBook(service.id)}
                        className="w-full bg-[#183D35] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
                      >
                        {t.bookThisService}
                      </button>
                    </div>
                  </div>
                </article>
              </CalmReveal>
            ))}
          </div>
        )}
      </section>

      <TreatmentRitualModal
        service={inspected}
        type="salon"
        lang={lang}
        onClose={() => setInspected(null)}
        onBook={(id) => handleBook(id)}
      />
    </PublicLayout>
  );
};
