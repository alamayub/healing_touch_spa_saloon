import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslationText } from '../../i18n/translations.ts';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setLanguage } from '../../store/slices/uiSlice.ts';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const t = useTranslationText(lang);

  const primaryLinks = [
    { to: '/spa', label: t.navSpa },
    { to: '/salon', label: t.navSalon },
    { to: '/packages', label: t.navPackages },
    { to: '/experience', label: t.navExperience },
    { to: '/contact', label: t.navContact },
  ];

  const secondaryDrawerLinks = [
    { to: '/about', label: 'About Healing Touch' },
    { to: '/team', label: 'Therapists & Stylists' },
    { to: '/gallery', label: 'Visual Gallery' },
    { to: '/offers', label: 'Seasonal Offers' },
    { to: '/social', label: 'Facebook & Instagram' },
    { to: '/blog', label: 'Spa & Beauty Journal' },
    { to: '/reviews', label: 'Guest Reviews' },
    { to: '/faq', label: 'Etiquette & FAQ' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/admin', label: 'Admin Portal' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#183D35]/10 bg-[#FBF9F5]/92 backdrop-blur-md">
      {/* Strict 3-Zone Top Bar Contract: [Brand wordmark] — [5 single-line links] — [1 primary CTA] */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-2xl font-medium tracking-tight text-[#183D35] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D35]"
        >
          {t.brandName}
        </Link>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-8 text-[13px] font-medium tracking-wide text-[#252525]"
        >
          {primaryLinks.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-200 hover:text-[#183D35] ${
                  active ? 'text-[#183D35] font-semibold' : 'text-[#252525]/75'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-[1px] bg-[#C4A36A] transition-transform duration-200 origin-left ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA on desktop + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/booking"
            className="hidden sm:inline-flex items-center justify-center bg-[#183D35] px-5 py-2.5 text-xs font-medium tracking-wider text-[#FBF9F5] transition-colors duration-200 hover:bg-[#112C26] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D35]"
          >
            {t.bookAppointment}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center border border-[#183D35]/15 text-[#183D35] transition-colors hover:bg-[#F6F0E7] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Extended Navigation Drawer */}
      {mobileOpen && (
        <div className="max-h-[82vh] overflow-y-auto border-t border-[#183D35]/10 bg-[#FBF9F5] px-4 py-6 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid grid-cols-2 gap-2.5">
              {primaryLinks.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`border px-3.5 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[#183D35] bg-[#183D35] text-[#FBF9F5]'
                        : 'border-[#183D35]/12 bg-[#F6F0E7]/65 text-[#183D35]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/booking"
                onClick={() => setMobileOpen(false)}
                className="border border-[#C4A36A] bg-[#C4A36A] px-3.5 py-3 text-center text-sm font-semibold text-[#183D35]"
              >
                {t.bookAppointment}
              </Link>
            </div>

            <div className="border-t border-[#183D35]/10 pt-5">
              <p className="mb-3 text-xs font-medium tracking-wider text-[#858078]">
                Explore Healing Touch
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {secondaryDrawerLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm text-[#252525]/85 transition-colors hover:text-[#183D35]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#183D35]/10 pt-5">
              <span className="text-xs text-[#858078]">Language / भाषा</span>
              <div className="flex items-center border border-[#183D35]/15 p-0.5">
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('en'))}
                  className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    lang === 'en' ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#252525]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('ne'))}
                  className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    lang === 'ne' ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#252525]'
                  }`}
                >
                  नेपाली
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
