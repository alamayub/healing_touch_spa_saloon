import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { useGetPackagesQuery } from '../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setBookingDraft } from '../store/slices/uiSlice.ts';
import { formatDuration, formatNpr } from '../utils/nepal.ts';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const { data: packages = [], isLoading } = useGetPackagesQuery(false);

  const handleBookPackage = (pkgId: string, supportsCouple: boolean) => {
    dispatch(
      setBookingDraft({
        category: 'package',
        serviceIds: [pkgId],
        isCouple: supportsCouple,
      })
    );
    navigate('/booking');
  };

  const packagesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Signature Spa & Salon Packages — Healing Touch Birgunj',
    itemListElement: packages.map((pkg) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: pkg.name,
        description: pkg.description,
      },
      price: String(pkg.packagePriceNpr),
      priceCurrency: 'NPR',
    })),
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Spa & Salon Packages"
        description="Curated full-body spa packages, couples hydrotherapy retreats, and spa + unisex salon combinations in Birgunj."
        image="/images/package_ritual.jpg"
        keywords="Birgunj spa packages, couples spa retreat Nepal, bridal beauty package Birgunj"
        jsonLd={packagesJsonLd}
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#FAF6EF] py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
            Value Combos &amp; Couples Suites
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium text-[#183D35] sm:text-5xl">
            Signature Spa &amp; Salon Packages
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Curated multi-service sessions combining massage therapy, steam &amp; jacuzzi, haircuts, beard grooming, facials, and hair spas—with verified package savings in NPR.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 animate-pulse border border-[#183D35]/10 bg-[#F6F0E7]/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {packages.map((pkg, idx) => {
              const savings =
                pkg.savingsVerified && pkg.regularPriceNpr && pkg.regularPriceNpr > pkg.packagePriceNpr
                  ? pkg.regularPriceNpr - pkg.packagePriceNpr
                  : 0;
              return (
                <CalmReveal key={pkg.id} delay={(idx % 2) * 0.06}>
                  <article className="group flex h-full flex-col border border-[#183D35]/14 bg-[#FBF9F5] transition-colors hover:border-[#183D35]/35">
                    <div className="overflow-hidden">
                      <LuxuryVisual
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        visualKey={pkg.visualKey || 'package_ritual'}
                        aspectClass="aspect-[16/9]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex items-center gap-2 text-xs text-[#858078]">
                        <span>{pkg.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {formatDuration(pkg.totalDurationMinutes, lang)}
                        </span>
                        {pkg.supportsCouple && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>For Two Guests</span>
                          </>
                        )}
                      </div>
                      <h2 className="mt-2 font-display text-3xl font-medium text-[#183D35]">
                        {lang === 'ne' && pkg.nameNe ? pkg.nameNe : pkg.name}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-[#252525]/82">
                        {pkg.description}
                      </p>

                      <div className="mt-5 border-t border-[#183D35]/10 pt-4">
                        <p className="text-xs font-semibold tracking-wider text-[#183D35]">
                          Included Services
                        </p>
                        <ul className="mt-2.5 space-y-1.5 text-sm text-[#252525]/85">
                          {pkg.includedServiceNames.map((item, stepIdx) => (
                            <li key={item} className="flex items-baseline gap-2.5">
                              <span className="font-mono text-xs text-[#C4A36A] tabular-nums">
                                0{stepIdx + 1}.
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[#183D35]/10 pt-6">
                        <div>
                          <span className="font-mono text-xl font-semibold tabular-nums text-[#183D35]">
                            {formatNpr(pkg.packagePriceNpr, lang)}
                          </span>
                          {savings > 0 && (
                            <p className="mt-0.5 text-xs text-[#183D35]/80 tabular-nums">
                              Save {formatNpr(savings, lang)} vs. individual services
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBookPackage(pkg.id, pkg.supportsCouple)}
                          className="inline-flex items-center gap-2 bg-[#183D35] px-6 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
                        >
                          Book Package <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                </CalmReveal>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};
