import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { TreatmentRitualModal } from '../components/ui/TreatmentRitualModal.tsx';
import { useTranslationText } from '../i18n/translations.ts';
import { useGetCategoriesQuery, useGetSpaServicesQuery } from '../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setBookingDraft } from '../store/slices/uiSlice.ts';
import { SpaService } from '../types/domain.ts';
import { formatDuration, formatNpr } from '../utils/nepal.ts';

export const SpaServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const t = useTranslationText(lang);

  const { data: services = [], isLoading } = useGetSpaServicesQuery(false);
  const { data: categories = [] } = useGetCategoriesQuery(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [inspected, setInspected] = useState<SpaService | null>(null);

  const spaCategories = useMemo(
    () => categories.filter((c) => c.division === 'spa'),
    [categories]
  );

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const catMatch = selectedCategory === 'All' || s.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const textMatch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [services, selectedCategory, search]);

  const handleBook = (serviceId: string, isCouple: boolean) => {
    dispatch(setBookingDraft({ category: 'spa', serviceIds: [serviceId], isCouple }));
    navigate('/booking');
  };

  const spaJsonLd = useMemo(() => {
    if (inspected) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: inspected.name,
        description: inspected.description,
        serviceType: inspected.category,
        provider: {
          '@type': 'DaySpa',
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
      '@type': 'OfferCatalog',
      name: 'Healing Touch Spa & Hydrotherapy Menu',
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
    };
  }, [filtered, inspected]);

  return (
    <PublicLayout>
      <SeoHead
        title={inspected ? `${inspected.name} — Spa Ritual` : 'Spa Services & Hydrotherapy'}
        description={
          inspected
            ? `${inspected.description} (${formatDuration(inspected.durationMinutes, lang)}, ${formatNpr(inspected.priceNpr, lang)}).`
            : 'Explore full body relaxation massages, aromatherapy, hot stone, foot reflexology, couples suites, steam bath, and jacuzzi experiences in Birgunj.'
        }
        image={inspected?.imageUrl || '/images/spa_massage.jpg'}
        keywords="Birgunj spa, full body massage Birgunj, aromatherapy Nepal, hot stone massage, couples jacuzzi suite, steam bath Birgunj"
        jsonLd={spaJsonLd}
      />

      {/* Luminous Warm Travertine Spa Header */}
      <section className="resort-grain border-b border-[#183D35]/12 bg-[#FAF6EF] py-14 lg:py-18">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
              Massage, Steam &amp; Jacuzzi Wing
            </p>
            <h1 className="font-display text-4xl font-medium leading-tight text-[#183D35] sm:text-5xl">
              {t.featuredSpaTitle}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
              Choose from single or couples massage suites, herbal steam baths, warm basalt stone bodywork, and private Jacuzzi soaking—all with transparent NPR rates and 15–20 minute sanitization buffers.
            </p>
          </div>
          <div className="hidden lg:col-span-5 lg:grid lg:grid-cols-2 lg:gap-3">
            <div className="overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Private massage bed with rolled towels"
                visualKey="spa_massage"
                aspectClass="aspect-[4/3]"
              />
            </div>
            <div className="overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Jacuzzi & steam hydrotherapy suite"
                visualKey="spa_hydro"
                aspectClass="aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-[#183D35]/10 pb-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#183D35] text-[#FBF9F5]'
                  : 'border border-[#183D35]/15 bg-[#F6F0E7]/60 text-[#252525] hover:border-[#183D35]'
              }`}
            >
              All Spa Treatments
            </button>
            {spaCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-[#183D35] text-[#FBF9F5]'
                    : 'border border-[#183D35]/15 bg-[#F6F0E7]/60 text-[#252525] hover:border-[#183D35]'
                }`}
              >
                {lang === 'ne' && cat.nameNe ? cat.nameNe : cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858078]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search spa treatments..."
              className="w-full border border-[#183D35]/20 bg-white py-2.5 pl-10 pr-3 text-sm text-[#252525] focus:border-[#183D35] focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse border border-[#183D35]/10 bg-[#F6F0E7]/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="my-12 border border-[#183D35]/15 bg-[#F6F0E7]/50 p-12 text-center">
            <p className="font-display text-2xl text-[#183D35]">No matching spa treatments found</p>
            <p className="mt-2 text-sm text-[#858078]">
              Try clearing your filter or{' '}
              <Link to="/packages" className="font-semibold text-[#183D35] underline">
                browse spa packages
              </Link>
              .
            </p>
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
                      visualKey={service.visualKey || 'spa_massage'}
                      aspectClass="aspect-[4/3]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs text-[#858078]">
                      <span>{service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatDuration(service.durationMinutes, lang)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>+{service.bufferMinutes}m prep</span>
                    </div>

                    <h2 className="mt-2 font-display text-2xl font-medium text-[#183D35]">
                      {lang === 'ne' && service.nameNe ? service.nameNe : service.name}
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[#252525]/82">
                      {service.description}
                    </p>

                    {service.involves && (
                      <p className="mt-3.5 border-t border-[#183D35]/10 pt-3 text-xs leading-relaxed text-[#858078]">
                        <strong className="font-semibold text-[#183D35]">Includes: </strong>
                        {service.involves}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      <div className="flex items-baseline justify-between border-t border-[#183D35]/10 pt-4">
                        <div>
                          <span className="font-mono text-base font-semibold tabular-nums text-[#183D35]">
                            {formatNpr(service.priceNpr, lang)}
                          </span>
                          {service.supportsCouple && service.couplePriceNpr && (
                            <p className="mt-0.5 text-xs text-[#858078] tabular-nums">
                              Couple Suite: {formatNpr(service.couplePriceNpr, lang)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspected(service)}
                          className="text-xs font-medium text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
                        >
                          Details
                        </button>
                      </div>

                      <div className="mt-4 flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleBook(service.id, false)}
                          className="flex-1 bg-[#183D35] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
                        >
                          Book Single
                        </button>
                        {service.supportsCouple && (
                          <button
                            type="button"
                            onClick={() => handleBook(service.id, true)}
                            className="flex-1 border border-[#183D35] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
                          >
                            Book Couple
                          </button>
                        )}
                      </div>
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
        type="spa"
        lang={lang}
        onClose={() => setInspected(null)}
        onBook={(id, isCouple) => handleBook(id, isCouple)}
      />
    </PublicLayout>
  );
};
