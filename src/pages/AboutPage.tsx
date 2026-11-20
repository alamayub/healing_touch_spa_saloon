import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { useGetBusinessSettingsQuery } from '../store/api/endpoints.ts';

export const AboutPage: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();

  return (
    <PublicLayout>
      <SeoHead
        title="About Healing Touch"
        description="Learn about Healing Touch Spa & Saloon in Aadarsh Nagar, Birgunj — our spa & unisex salon standards, hygiene, and guest commitment."
        image="/images/hero_sanctuary.jpg"
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#FAF6EF] py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">Our Story</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-[#183D35] sm:text-5xl">
            Spa &amp; Unisex Salon Hospitality in Birgunj
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Healing Touch Spa &amp; Saloon in Aadarsh Nagar brings together relaxing massage &amp; hydrotherapy suites with a modern unisex hair, facial, nail, and bridal makeup salon under one welcoming roof.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          <CalmReveal className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                01. Our Approach
              </p>
              <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                Both Spa Care &amp; Salon Artistry
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#252525]/85 sm:text-base">
                Whether you visit for a restorative full-body massage and warm jacuzzi soak or a precision haircut, keratin smoothing, or bridal makeover, our scheduling system builds dedicated room ventilation and tool sanitization time into every appointment.
              </p>
            </div>

            <div className="border-t border-[#183D35]/10 pt-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                02. Hygiene &amp; Tools
              </p>
              <h3 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                Sanitization &amp; Linen Standards
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#252525]/82">
                {settings?.hygieneStandardsText ||
                  'Fresh laundered linens for every guest, sanitized salon & spa tools between appointments, and 15–20 minute suite preparation buffers.'}
              </p>
            </div>

            <div className="border-t border-[#183D35]/10 pt-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                03. Guest Policy
              </p>
              <h3 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                Age &amp; Privacy Guidelines
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#252525]/82">
                {settings?.agePolicyText ||
                  'Guests must be 18+ for private spa suites. Guests aged 14–17 may access salon services with a parent or guardian.'}
              </p>
            </div>
          </CalmReveal>

          <CalmReveal delay={0.08} className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="group overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Massage suite and warm oils"
                visualKey="spa_massage"
                aspectClass="aspect-[3/4] h-full"
                caption="Private Massage Suites"
              />
            </div>
            <div className="group overflow-hidden border border-[#183D35]/12">
              <LuxuryVisual
                alt="Unisex hair and beauty salon"
                visualKey="salon_lounge"
                aspectClass="aspect-[3/4] h-full"
                caption="Unisex Salon Studio"
              />
            </div>
          </CalmReveal>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 border border-[#183D35]/15 bg-[#183D35] p-8 text-[#FBF9F5] sm:p-10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[#C4A36A]">
              Plan Your Visit
            </p>
            <h2 className="mt-1 font-display text-3xl font-medium">
              Book a Spa Treatment or Salon Session
            </h2>
            <p className="mt-1.5 text-sm text-[#F6F0E7]/80">
              Browse our menus or meet our certified massage therapists and hair stylists.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/team"
              className="border border-[#F6F0E7]/30 px-5 py-3 text-xs font-medium tracking-wider text-[#FBF9F5] transition-colors hover:border-[#C4A36A]"
            >
              Meet Our Team
            </Link>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 bg-[#C4A36A] px-6 py-3 text-xs font-semibold tracking-wider text-[#183D35] transition-colors hover:bg-[#D5B57D]"
            >
              Book Appointment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
