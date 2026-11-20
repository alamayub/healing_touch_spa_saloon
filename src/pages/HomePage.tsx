import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Sparkles,
  Star,
} from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal, StaggerItem, StaggerSequence } from '../components/ui/MotionPrimitives.tsx';
import { TreatmentRitualModal } from '../components/ui/TreatmentRitualModal.tsx';
import { useTranslationText } from '../i18n/translations.ts';
import {
  useGetBusinessSettingsQuery,
  useGetGalleryQuery,
  useGetOffersQuery,
  useGetPackagesQuery,
  useGetReviewsQuery,
  useGetRoomsQuery,
  useGetSalonServicesQuery,
  useGetSocialPostsQuery,
  useGetSpaServicesQuery,
  useGetStaffQuery,
} from '../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setBookingDraft, setLanguage } from '../store/slices/uiSlice.ts';
import { SalonService, SpaService } from '../types/domain.ts';
import { toBikramSambat } from '../utils/bikramSambat.ts';
import {
  buildWhatsAppUrl,
  formatDuration,
  formatNpr,
  getKathmanduTodayIso,
} from '../utils/nepal.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const t = useTranslationText(lang);

  const { data: settings } = useGetBusinessSettingsQuery();
  const { data: spaServices = [] } = useGetSpaServicesQuery(false);
  const { data: salonServices = [] } = useGetSalonServicesQuery(false);
  const { data: packages = [] } = useGetPackagesQuery(false);
  const { data: rooms = [] } = useGetRoomsQuery(false);
  const { data: gallery = [] } = useGetGalleryQuery(false);
  const { data: staff = [] } = useGetStaffQuery(false);
  const { data: reviews = [] } = useGetReviewsQuery(false);
  const { data: socialPosts = [] } = useGetSocialPostsQuery(false);
  const { data: offers = [] } = useGetOffersQuery(false);

  const [menuTab, setMenuTab] = useState<'spa' | 'salon'>('spa');
  const [inspectedService, setInspectedService] = useState<{
    item: SpaService | SalonService;
    type: 'spa' | 'salon';
  } | null>(null);

  const todayIso = getKathmanduTodayIso();
  const bsToday = toBikramSambat(todayIso);

  const featuredSpa = spaServices.filter((s) => s.featured).slice(0, 4);
  const featuredSalon = salonServices.filter((s) => s.featured).slice(0, 4);
  const featuredPackages = packages.slice(0, 3);

  const whatsappUrl = buildWhatsAppUrl(
    settings?.whatsappNumber || '+9779823945000',
    'Namaste Healing Touch Spa & Saloon! I would like to book an appointment in Birgunj.'
  );

  const handleQuickBook = (
    category: 'spa' | 'salon' | 'package',
    serviceId: string,
    isCouple = false,
    staffId?: string
  ) => {
    dispatch(
      setBookingDraft({
        category,
        serviceIds: serviceId ? [serviceId] : [],
        isCouple,
        staffId,
      })
    );
    navigate('/booking');
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Luxury Spa & Unisex Salon in Birgunj"
        description="Relax. Rejuvenate. Rediscover Yourself. Healing Touch Spa & Saloon in Aadarsh Nagar, Birgunj, Nepal offers massage therapy, steam & jacuzzi suites, haircuts, keratin, facials, and bridal artistry."
        image="/images/hero_sanctuary.jpg"
        keywords="Healing Touch Spa Birgunj, luxury spa Birgunj, unisex salon Aadarsh Nagar, couples jacuzzi Nepal"
      />

      {/* 1. DUAL-WING SPA & UNISEX SALON HERO */}
      <section className="resort-grain border-b border-[#183D35]/12 bg-[#FAF6EF]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            {/* Hero Left: Clear Spa & Salon Positioning */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
                Aadarsh Nagar, Birgunj · Luxury Spa &amp; Unisex Salon
              </p>

              <h1
                className="font-display font-medium leading-[1.06] tracking-tight text-[#183D35]"
                style={{ fontSize: 'clamp(2.5rem, 4.6vw, 4.25rem)' }}
              >
                {lang === 'en' ? (
                  <>
                    Relax. Rejuvenate.{' '}
                    <span className="italic text-[#8C6A3A]">Rediscover Yourself.</span>
                  </>
                ) : (
                  t.heroHeadline
                )}
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#252525]/82">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 bg-[#183D35] px-6 py-3.5 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors duration-200 hover:bg-[#112C26] whitespace-nowrap"
                >
                  {t.bookAppointment}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/spa"
                  className="inline-flex items-center gap-2 border border-[#183D35]/25 bg-[#FBF9F5] px-5 py-3.5 text-xs font-semibold tracking-wide text-[#183D35] transition-colors hover:border-[#183D35] whitespace-nowrap"
                >
                  Spa Menu
                </Link>
                <Link
                  to="/salon"
                  className="inline-flex items-center gap-2 border border-[#183D35]/25 bg-[#FBF9F5] px-5 py-3.5 text-xs font-semibold tracking-wide text-[#183D35] transition-colors hover:border-[#183D35] whitespace-nowrap"
                >
                  Unisex Salon Menu
                </Link>
              </div>

              {/* Quick Division Overview Links */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#183D35]/12 pt-6 sm:grid-cols-4">
                {[
                  { label: 'Body Massage', sub: '60–90 min', to: '/spa' },
                  { label: 'Steam & Jacuzzi', sub: 'Private Suites', to: '/experience' },
                  { label: 'Hair & Keratin', sub: 'Men & Women', to: '/salon' },
                  { label: 'Bridal & Facials', sub: 'Makeup & Nails', to: '/salon' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group border border-[#183D35]/10 bg-[#FBF9F5] p-3 transition-colors hover:border-[#183D35]/35"
                  >
                    <p className="text-xs font-semibold text-[#183D35] group-hover:underline">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#858078] tabular-nums">{item.sub}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Hero Right: Unmistakable Dual Spa & Salon Visual Showcase */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-4">
              <Link
                to="/salon"
                className="group relative col-span-7 overflow-hidden border border-[#183D35]/12 bg-[#FBF9F5]"
              >
                <LuxuryVisual
                  alt="Healing Touch Unisex Hair & Beauty Salon Lounge"
                  visualKey="salon_lounge"
                  aspectClass="h-full min-h-[300px] sm:min-h-[420px]"
                  overlayScrim
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[#FBF9F5]">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-[#E7D4AF]">
                    Unisex Salon Studio
                  </p>
                  <p className="mt-1 font-display text-2xl font-medium">
                    Haircuts, Keratin &amp; Bridal Styling
                  </p>
                </div>
              </Link>

              <div className="col-span-5 grid grid-rows-2 gap-4">
                <Link
                  to="/spa"
                  className="group relative overflow-hidden border border-[#183D35]/12 bg-[#183D35]"
                >
                  <LuxuryVisual
                    alt="Private Massage Treatment Bed & Warm Oils"
                    visualKey="spa_massage"
                    aspectClass="h-full min-h-[180px]"
                    overlayScrim
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-[#FBF9F5]">
                    <p className="text-[10px] tracking-[0.14em] text-[#E7D4AF]">Spa Wing</p>
                    <p className="mt-0.5 font-display text-lg font-medium">
                      Massage &amp; Couples Suites
                    </p>
                  </div>
                </Link>

                <Link
                  to="/experience"
                  className="group relative overflow-hidden border border-[#183D35]/12 bg-[#1B3532]"
                >
                  <LuxuryVisual
                    alt="Private Jacuzzi & Eucalyptus Steam Suite"
                    visualKey="spa_hydro"
                    aspectClass="h-full min-h-[180px]"
                    overlayScrim
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-[#FBF9F5]">
                    <p className="text-[10px] tracking-[0.14em] text-[#E7D4AF]">Hydrotherapy</p>
                    <p className="mt-0.5 font-display text-lg font-medium">
                      Steam Bath &amp; Jacuzzi
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Reception & Live Nepal Context Strip */}
        <div className="border-t border-[#183D35]/12 bg-[#183D35] text-[#F6F0E7]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#F6F0E7]/12 px-4 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:pr-6">
              <p className="text-[11px] tracking-[0.12em] text-[#C4A36A]">{t.locationLabel}</p>
              <p className="mt-1 text-sm">Aadarsh Nagar, Birgunj, Parsa</p>
            </div>
            <div className="py-4 sm:px-6">
              <p className="text-[11px] tracking-[0.12em] text-[#C4A36A]">{t.openingHours}</p>
              <p className="mt-1 text-sm tabular-nums">
                {settings?.openingHoursText || 'Daily: 9:30 AM – 8:30 PM'}
              </p>
            </div>
            <div className="py-4 sm:px-6">
              <p className="text-[11px] tracking-[0.12em] text-[#C4A36A]">{t.phoneLabel}</p>
              <a
                href={`tel:${(settings?.phone || '+9779823945000').replace(/\s+/g, '')}`}
                className="mt-1 inline-block text-sm tabular-nums hover:text-[#C4A36A]"
              >
                {settings?.phone || '+977 982-3945000'}
              </a>
            </div>
            <div className="flex items-center justify-between py-4 sm:pl-6">
              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#C4A36A]">
                  Nepal Date (Kathmandu)
                </p>
                <p className="mt-1 text-sm tabular-nums">
                  {bsToday ? (lang === 'ne' ? bsToday.formattedNe : bsToday.formattedEn) : todayIso}
                </p>
              </div>
              <div className="flex items-center border border-[#F6F0E7]/25 p-0.5">
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('en'))}
                  className={`px-2.5 py-1 text-xs transition-colors ${
                    lang === 'en' ? 'bg-[#C4A36A] font-semibold text-[#183D35]' : 'text-[#F6F0E7]/85'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('ne'))}
                  className={`px-2.5 py-1 text-xs transition-colors ${
                    lang === 'ne' ? 'bg-[#C4A36A] font-semibold text-[#183D35]' : 'text-[#F6F0E7]/85'
                  }`}
                >
                  ने
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SPA & SALON RATE MENU */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-[#183D35]/12 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
              Transparent NPR Service Menu
            </p>
            <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
              Explore Our Spa &amp; Salon Treatments
            </h2>
          </div>

          <div className="inline-flex border border-[#183D35]/18 bg-[#F6F0E7]/70 p-1">
            <button
              type="button"
              onClick={() => setMenuTab('spa')}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                menuTab === 'spa' ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#183D35]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Spa &amp; Hydrotherapy
            </button>
            <button
              type="button"
              onClick={() => setMenuTab('salon')}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                menuTab === 'salon' ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#183D35]'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              Unisex Hair &amp; Beauty Salon
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
          {(menuTab === 'spa' ? spaServices : salonServices).slice(0, 8).map((item) => {
            const isSpa = menuTab === 'spa';
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-[#183D35]/10 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[#858078]">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {formatDuration(item.durationMinutes, lang)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedService({ item, type: menuTab })}
                    className="mt-0.5 text-left font-display text-xl font-medium text-[#183D35] hover:underline"
                  >
                    {lang === 'ne' && item.nameNe ? item.nameNe : item.name}
                  </button>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                    {formatNpr(item.priceNpr, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickBook(
                        menuTab,
                        item.id,
                        isSpa && (item as SpaService).category === 'Couple Massage'
                      )
                    }
                    className="border border-[#183D35] px-3.5 py-1.5 text-xs font-medium text-[#183D35] transition-colors hover:bg-[#183D35] hover:text-[#FBF9F5] whitespace-nowrap"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            to={menuTab === 'spa' ? '/spa' : '/salon'}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8"
          >
            {menuTab === 'spa' ? t.viewAllSpa : t.viewAllSalon}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. FEATURED SPA TREATMENTS */}
      <section className="border-y border-[#183D35]/10 bg-[#F6F0E7] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 pb-12 sm:flex-row sm:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                {t.featuredSpaLabel}
              </p>
              <h2 className="font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
                {t.featuredSpaTitle}
              </h2>
            </div>
            <Link
              to="/spa"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8 whitespace-nowrap"
            >
              {t.viewAllSpa} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <StaggerSequence className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {featuredSpa.map((service) => (
              <StaggerItem key={service.id}>
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
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-[#183D35]">
                      {lang === 'ne' && service.nameNe ? service.nameNe : service.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#252525]/80">
                      {service.description}
                    </p>

                    <div className="mt-5 space-y-4 border-t border-[#183D35]/10 pt-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                            {formatNpr(service.priceNpr, lang)}
                          </span>
                          {service.supportsCouple && (
                            <p className="text-[11px] text-[#858078]">{t.coupleAvailable}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectedService({ item: service, type: 'spa' })}
                          className="text-xs font-medium text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
                        >
                          Details
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickBook('spa', service.id, service.category === 'Couple Massage')
                        }
                        className="w-full bg-[#183D35] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#112C26] whitespace-nowrap"
                      >
                        {t.bookThisService}
                      </button>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerSequence>
        </div>
      </section>

      {/* 4. FEATURED UNISEX SALON SERVICES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 pb-12 sm:flex-row sm:items-end">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                {t.featuredSalonLabel}
              </p>
              <h2 className="font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
                {t.featuredSalonTitle}
              </h2>
            </div>
            <Link
              to="/salon"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8 whitespace-nowrap"
            >
              {t.viewAllSalon} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <StaggerSequence className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
            {featuredSalon.map((service) => (
              <StaggerItem key={service.id}>
                <article className="group flex h-full flex-col border border-[#183D35]/12 bg-[#FAF6EF] transition-colors duration-200 hover:border-[#183D35]/35">
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
                    <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-[#183D35]">
                      {lang === 'ne' && service.nameNe ? service.nameNe : service.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#252525]/80">
                      {service.description}
                    </p>

                    <div className="mt-5 space-y-4 border-t border-[#183D35]/10 pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-sm font-semibold tabular-nums text-[#183D35]">
                          {formatNpr(service.priceNpr, lang)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectedService({ item: service, type: 'salon' })}
                          className="text-xs font-medium text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
                        >
                          Details
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickBook('salon', service.id)}
                        className="w-full border border-[#183D35] bg-[#FBF9F5] px-4 py-2.5 text-xs font-semibold tracking-wide text-[#183D35] transition-colors hover:bg-[#183D35] hover:text-[#FBF9F5] whitespace-nowrap"
                      >
                        {t.bookThisService}
                      </button>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerSequence>
        </div>
      </section>

      {/* 5. SIGNATURE SPA & SALON PACKAGES */}
      <section className="border-y border-[#183D35]/10 bg-[#F6F0E7]/75 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 pb-12 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                Curated Combos
              </p>
              <h2 className="font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
                {t.packagesTitle}
              </h2>
            </div>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8 whitespace-nowrap"
            >
              {t.viewAllPackages} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {featuredPackages.map((pkg, idx) => (
              <CalmReveal key={pkg.id} delay={idx * 0.05}>
                <article className="group flex h-full flex-col justify-between border border-[#183D35]/14 bg-[#FBF9F5]">
                  <div>
                    <div className="overflow-hidden">
                      <LuxuryVisual
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        visualKey={pkg.visualKey || 'package_ritual'}
                        aspectClass="aspect-[16/10]"
                      />
                    </div>
                    <div className="p-7 pb-0">
                      <div className="flex items-center justify-between text-xs text-[#858078]">
                        <span>{pkg.category}</span>
                        <span className="tabular-nums">
                          {formatDuration(pkg.totalDurationMinutes, lang)}
                        </span>
                      </div>
                      <h3 className="mt-2.5 font-display text-2xl font-medium text-[#183D35]">
                        {lang === 'ne' && pkg.nameNe ? pkg.nameNe : pkg.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#252525]/80">
                        {pkg.description}
                      </p>
                      <ul className="mt-4 space-y-1.5 border-t border-[#183D35]/10 pt-4 text-sm text-[#252525]">
                        {pkg.includedServiceNames.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#C4A36A]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="m-7 mt-7 flex items-center justify-between border-t border-[#183D35]/10 pt-5">
                    <div>
                      <span className="font-mono text-lg font-semibold tabular-nums text-[#183D35]">
                        {formatNpr(pkg.packagePriceNpr, lang)}
                      </span>
                      {pkg.savingsVerified &&
                        pkg.regularPriceNpr &&
                        pkg.regularPriceNpr > pkg.packagePriceNpr && (
                          <p className="text-xs text-[#858078] line-through tabular-nums">
                            {formatNpr(pkg.regularPriceNpr, lang)}
                          </p>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickBook('package', pkg.id, pkg.supportsCouple)}
                      className="bg-[#183D35] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#112C26] whitespace-nowrap"
                    >
                      Book Package
                    </button>
                  </div>
                </article>
              </CalmReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HYGIENE STANDARDS, SUITES & GALLERY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
              Hygiene &amp; Facilities
            </p>
            <h2 className="font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
              {t.facilitiesTitle}
            </h2>
            <p className="text-sm leading-relaxed text-[#252525]/80">
              Cleanliness and privacy sit at the core of our Birgunj studio: fresh single-guest spa linens, sanitized salon shears and combs, and 15–20 minute suite preparation buffers.
            </p>
            <div className="divide-y divide-[#183D35]/12 border-y border-[#183D35]/12">
              {rooms.slice(0, 4).map((room) => (
                <div key={room.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#183D35]">{room.name}</h3>
                    <span className="text-xs text-[#858078] tabular-nums">
                      Capacity: {room.capacity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#858078]">{room.facilities.join(' · ')}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8"
              >
                Explore Photo Gallery <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#252525]/80 hover:text-[#183D35]"
              >
                Read Hygiene Standards
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {gallery.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group overflow-hidden border border-[#183D35]/12 bg-[#FBF9F5]"
              >
                <div className="overflow-hidden">
                  <LuxuryVisual
                    src={item.imageUrl}
                    alt={item.title}
                    visualKey={item.visualKey || 'salon_lounge'}
                    aspectClass="aspect-[4/3]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-[#858078]">{item.category}</p>
                  <p className="mt-0.5 font-display text-lg font-medium text-[#183D35] line-clamp-1">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. THERAPISTS, HAIR STYLISTS & GUEST REVIEWS */}
      <section className="border-t border-[#183D35]/10 bg-[#FAF6EF] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 pb-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                Spa &amp; Salon Team
              </p>
              <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
                {t.teamTitle}
              </h2>
            </div>
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8 whitespace-nowrap"
            >
              View All Team Profiles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {staff.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="group flex flex-col justify-between border border-[#183D35]/12 bg-[#FBF9F5] p-6"
              >
                <div>
                  <div className="mb-4 overflow-hidden">
                    <LuxuryVisual
                      src={
                        member.avatarUrl ||
                        (member.division === 'salon'
                          ? member.designation.toLowerCase().includes('bridal')
                            ? '/images/team_mua.jpg'
                            : '/images/team_stylist.jpg'
                          : member.name.toLowerCase().includes('anita')
                          ? '/images/spa_reflexology.jpg'
                          : '/images/team_therapist.jpg')
                      }
                      alt={member.name}
                      visualKey="team_portrait"
                      aspectClass="aspect-[4/3]"
                      objectPosition="top"
                    />
                  </div>
                  <p className="text-xs text-[#858078] capitalize">
                    {member.division} · {member.experienceYears} yrs experience
                  </p>
                  <h3 className="mt-1 font-display text-xl font-medium text-[#183D35]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#252525]/78">
                    {member.designation}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#858078]">
                    {member.specializations.slice(0, 3).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickBook(
                      member.division === 'salon' ? 'salon' : 'spa',
                      '',
                      false,
                      member.id
                    )
                  }
                  className="mt-5 w-full border border-[#183D35]/25 py-2 text-xs font-medium text-[#183D35] transition-colors hover:border-[#183D35] hover:bg-[#183D35] hover:text-[#FBF9F5]"
                >
                  Book with {member.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-[#183D35]/12 pt-14">
            <div className="flex flex-col justify-between gap-4 pb-8 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                  Testimonials
                </p>
                <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                  {t.testimonialsTitle}
                </h2>
              </div>
              <Link
                to="/reviews"
                className="text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8"
              >
                Read &amp; Leave a Review
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {reviews.slice(0, 3).map((rev) => (
                <blockquote
                  key={rev.id}
                  className="flex flex-col justify-between border border-[#183D35]/12 bg-[#FBF9F5] p-6"
                >
                  <div>
                    <div
                      className="flex items-center gap-1 text-[#C4A36A]"
                      aria-label={`${rev.rating} out of 5 stars`}
                    >
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[#252525]/90">
                      “{rev.comment}”
                    </p>
                  </div>
                  <footer className="mt-5 border-t border-[#183D35]/10 pt-3 text-xs text-[#858078]">
                    <span className="font-semibold text-[#183D35]">{rev.authorName}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{rev.serviceUsed}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. SEASONAL NEPAL OFFERS & SOCIAL HIGHLIGHTS */}
      <section className="border-t border-[#183D35]/10 bg-[#F6F0E7] py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                    Nepal Seasonal Offers
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                    {t.offersTitle}
                  </h2>
                </div>
                <Link
                  to="/offers"
                  className="text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8"
                >
                  All Offers
                </Link>
              </div>
              <div className="space-y-4">
                {offers.slice(0, 3).map((offer) => (
                  <div key={offer.id} className="border border-[#183D35]/10 bg-[#FBF9F5] p-5">
                    <div className="flex items-center justify-between text-xs text-[#858078]">
                      <span>{offer.festivalTag || 'Seasonal'}</span>
                      <span className="font-mono font-semibold text-[#183D35]">
                        {offer.discountLabel}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-xl font-medium text-[#183D35]">
                      {offer.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#252525]/80">{offer.description}</p>
                    {offer.promoCode && (
                      <p className="mt-2 font-mono text-xs text-[#858078]">
                        Code: <span className="font-semibold text-[#183D35]">{offer.promoCode}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                    Social Feed
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                    {t.socialTitle}
                  </h2>
                </div>
                <Link
                  to="/social"
                  className="text-xs font-semibold tracking-wider text-[#183D35] underline decoration-[#C4A36A] underline-offset-8"
                >
                  View Feed
                </Link>
              </div>
              <div className="space-y-4">
                {socialPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="border border-[#183D35]/10 bg-[#FBF9F5] p-5">
                    <div className="flex items-center justify-between text-xs text-[#858078]">
                      <span className="capitalize">
                        {post.platform} · {post.postType}
                      </span>
                      <span className="tabular-nums">{post.publishedAt}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-xl font-medium text-[#183D35]">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#252525]/80">{post.caption}</p>
                    {post.externalUrl && (
                      <a
                        href={post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#183D35] hover:text-[#A6864E]"
                      >
                        View on {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BIRGUNJ RECEPTION, HOURS & GOOGLE MAPS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 border border-[#183D35]/15 bg-[#FBF9F5] p-8 sm:p-12 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
              Birgunj Studio &amp; Spa
            </p>
            <h2 className="font-display text-3xl font-medium text-[#183D35] sm:text-4xl">
              {t.locationTitle}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[#252525]/80">
              Located in Aadarsh Nagar, Birgunj, Parsa, Madhesh Province. Advance appointments are recommended for couples suites, weekend spa slots, keratin treatments, and bridal makeup bookings.
            </p>
            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#183D35]" />
                <div>
                  <p className="font-semibold text-[#183D35]">Address</p>
                  <p className="text-[#252525]/80">
                    {settings?.address || 'Aadarsh Nagar, Birgunj, Parsa, Madhesh Province, Nepal'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#183D35]" />
                <div>
                  <p className="font-semibold text-[#183D35]">Hours</p>
                  <p className="text-[#252525]/80 tabular-nums">
                    {settings?.openingHoursText || 'Daily: 9:30 AM – 8:30 PM'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#183D35]" />
                <div>
                  <p className="font-semibold text-[#183D35]">Reception Phone</p>
                  <p className="tabular-nums text-[#252525]/80">
                    {settings?.phone || '+977 982-3945000'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 bg-[#183D35] px-6 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
              >
                {t.bookAppointment}
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#183D35]/25 px-5 py-3 text-xs font-semibold text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
              >
                <MessageCircle className="h-4 w-4" />
                {t.whatsappCta}
              </a>
              <a
                href={
                  settings?.googleMapsUrl ||
                  'https://www.google.com/maps/place/Healing+Touch+Spa+%26+Saloon/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
              >
                Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between border border-[#183D35]/12 bg-[#F6F0E7] p-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#A6864E]">
                Directions &amp; Map
              </p>
              <h3 className="mt-2 font-display text-2xl font-medium text-[#183D35]">
                Aadarsh Nagar, Birgunj
              </h3>
              <p className="mt-1.5 text-sm text-[#252525]/80">
                Parsa District · Madhesh Province · Nepal
              </p>
            </div>
            <div className="my-6 border border-[#183D35]/10 bg-[#FBF9F5] p-5 text-xs leading-relaxed text-[#858078]">
              <p className="font-semibold text-[#183D35]">Visitor Note</p>
              <p className="mt-1">
                Verified public listing on Google Maps. Open turn-by-turn navigation directly to Healing Touch Spa &amp; Saloon in Aadarsh Nagar.
              </p>
            </div>
            <a
              href={
                settings?.googleMapsUrl ||
                'https://www.google.com/maps/place/Healing+Touch+Spa+%26+Saloon/'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#183D35] px-4 py-3 text-xs font-medium tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
            >
              Get Directions on Google Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <TreatmentRitualModal
        service={inspectedService?.item || null}
        type={inspectedService?.type || 'spa'}
        lang={lang}
        onClose={() => setInspectedService(null)}
        onBook={(id, isCouple) =>
          handleQuickBook(inspectedService?.type || 'spa', id, isCouple)
        }
      />
    </PublicLayout>
  );
};
