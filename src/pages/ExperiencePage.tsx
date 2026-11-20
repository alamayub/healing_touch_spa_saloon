import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { useGetBusinessSettingsQuery, useGetRoomsQuery } from '../store/api/endpoints.ts';

export const ExperiencePage: React.FC = () => {
  const { data: rooms = [] } = useGetRoomsQuery(false);
  const { data: settings } = useGetBusinessSettingsQuery();
  const [openFaq, setOpenFaq] = useState<number>(0);

  const facilities = [
    {
      num: '01.',
      title: 'Private Massage Treatment Suites',
      visual: 'spa_massage' as const,
      desc: 'Enclosed single suites furnished with heated linen beds, fresh cotton towels, warm massage oils, and 15–20 minute sanitization intervals between guests.',
    },
    {
      num: '02.',
      title: 'Steam Bath & Warm Jacuzzi Room',
      visual: 'spa_hydro' as const,
      desc: 'Enclosed hydrotherapy space for aromatic eucalyptus steam sessions and freshly sanitized rose-petal warm water soaking.',
    },
    {
      num: '03.',
      title: 'Couples Spa & Hydrotherapy Suite',
      visual: 'spa_couple' as const,
      desc: 'Dual massage tables and private soaking access arranged for partners, spouses, or family celebrations.',
    },
    {
      num: '04.',
      title: 'Unisex Hair, Skincare & Bridal Salon Floor',
      visual: 'salon_lounge' as const,
      desc: 'Illuminated styling mirrors, wash lounge, sanitized shears and combs, and a private bridal dressing & makeup room.',
    },
  ];

  const etiquetteFaqs = [
    {
      q: 'What should I bring for a spa massage or jacuzzi session?',
      a: 'Fresh cotton robes, slippers, towels, and single-use spa garments are provided inside your private suite before your therapist enters.',
    },
    {
      q: 'How are spa rooms and salon tools sanitized between guests?',
      a: 'Our booking engine automatically enforces a 15 to 20 minute buffer between spa appointments for fresh linens and room ventilation, while salon combs, shears, and manicure tools are sanitized after every client.',
    },
    {
      q: 'What is the minimum age policy?',
      a:
        settings?.agePolicyText ||
        'Guests must be 18 years or older for private spa and hydrotherapy suites. Guests aged 14–17 may access salon hair and nail services accompanied by a guardian.',
    },
  ];

  return (
    <PublicLayout>
      <SeoHead
        title="Rooms, Spa Suites & Salon Facilities"
        description="Explore our private massage suites, couples room, steam bath, jacuzzi, and unisex hair & bridal salon studio in Birgunj."
        image="/images/spa_hydro.jpg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: etiquetteFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#FAF6EF] py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
            Rooms &amp; Facilities
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight text-[#183D35] sm:text-5xl">
            Private Spa Suites &amp; Unisex Salon Studio
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Take a tour inside our Aadarsh Nagar rooms—from warm hydrotherapy and couples massage suites to our modern hair styling and bridal artistry floor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {facilities.map((item, idx) => (
            <CalmReveal key={item.title} delay={(idx % 2) * 0.06}>
              <div className="group h-full border border-[#183D35]/12 bg-[#FBF9F5]">
                <div className="overflow-hidden">
                  <LuxuryVisual
                    alt={item.title}
                    visualKey={item.visual}
                    aspectClass="aspect-[16/10]"
                  />
                </div>
                <div className="p-7">
                  <span className="font-mono text-xs text-[#A6864E]">{item.num}</span>
                  <h2 className="mt-1 font-display text-2xl font-medium text-[#183D35]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#252525]/82">{item.desc}</p>
                </div>
              </div>
            </CalmReveal>
          ))}
        </div>

        <div className="border border-[#183D35]/15 bg-[#F6F0E7] p-8 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">
                Room &amp; Studio Directory
              </p>
              <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
                Verified Rooms &amp; Studios
              </h2>
            </div>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 bg-[#183D35] px-6 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#112C26]"
            >
              Book a Room or Studio <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => (
              <div key={r.id} className="border border-[#183D35]/10 bg-[#FBF9F5] p-5">
                <div className="flex items-center justify-between text-xs text-[#858078]">
                  <span className="tabular-nums">Capacity: {r.capacity}</span>
                  <span className="capitalize">{r.status}</span>
                </div>
                <h3 className="mt-1.5 font-display text-xl font-medium text-[#183D35]">{r.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#858078]">
                  {r.facilities.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#A6864E]">Guest Etiquette</p>
          <h2 className="mt-1 font-display text-3xl font-medium text-[#183D35]">
            Common Questions Before Your Visit
          </h2>
          <div className="mt-6 divide-y divide-[#183D35]/15 border-y border-[#183D35]/15">
            {etiquetteFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display text-2xl font-medium text-[#183D35]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#183D35] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-[#252525]/82">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
