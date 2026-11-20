import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { useGetBusinessSettingsQuery } from '../../store/api/endpoints.ts';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setLanguage } from '../../store/slices/uiSlice.ts';
import { buildWhatsAppUrl } from '../../utils/nepal.ts';

export const Footer: React.FC = () => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.language);
  const { data: settings } = useGetBusinessSettingsQuery();

  const whatsappUrl = buildWhatsAppUrl(
    settings?.whatsappNumber || '+9779823945000',
    'Namaste Healing Touch Spa & Saloon, I would like to inquire about an appointment.'
  );

  return (
    <footer className="border-t border-[#183D35]/15 bg-[#183D35] text-[#F6F0E7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-display text-3xl font-medium tracking-tight text-[#FBF9F5]">
              {settings?.businessName || 'Healing Touch Spa & Saloon'}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-[#F6F0E7]/80">
              Luxury massage suites, steam &amp; jacuzzi hydrotherapy, and a full-service unisex hair &amp; bridal beauty salon in Aadarsh Nagar, Birgunj, Nepal.
            </p>
            <div className="space-y-2 pt-2 text-sm text-[#F6F0E7]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C4A36A]" />
                <span>{settings?.address || 'Aadarsh Nagar, Birgunj, Parsa, Nepal'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#C4A36A]" />
                <a
                  href={`tel:${(settings?.phone || '+9779823945000').replace(/\s+/g, '')}`}
                  className="tabular-nums hover:text-[#C4A36A] transition-colors"
                >
                  {settings?.phone || '+977 982-3945000'}
                </a>
              </div>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center border border-[#F6F0E7]/20 p-1">
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('en'))}
                  className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    lang === 'en' ? 'bg-[#C4A36A] text-[#183D35]' : 'text-[#F6F0E7]/80 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setLanguage('ne'))}
                  className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    lang === 'ne' ? 'bg-[#C4A36A] text-[#183D35]' : 'text-[#F6F0E7]/80 hover:text-white'
                  }`}
                >
                  नेपाली
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#C4A36A]">Spa &amp; Salon</p>
              <ul className="space-y-2.5 text-sm text-[#F6F0E7]/80">
                <li><Link to="/spa" className="hover:text-white">Spa &amp; Massage Menu</Link></li>
                <li><Link to="/salon" className="hover:text-white">Unisex Salon Menu</Link></li>
                <li><Link to="/packages" className="hover:text-white">Spa &amp; Salon Packages</Link></li>
                <li><Link to="/experience" className="hover:text-white">Rooms &amp; Facilities</Link></li>
                <li><Link to="/booking" className="hover:text-white">Book Appointment</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#C4A36A]">Our Studio</p>
              <ul className="space-y-2.5 text-sm text-[#F6F0E7]/80">
                <li><Link to="/about" className="hover:text-white">About Healing Touch</Link></li>
                <li><Link to="/team" className="hover:text-white">Therapists &amp; Stylists</Link></li>
                <li><Link to="/gallery" className="hover:text-white">Photo Gallery</Link></li>
                <li><Link to="/offers" className="hover:text-white">Festival Offers</Link></li>
                <li><Link to="/blog" className="hover:text-white">Beauty &amp; Care Blog</Link></li>
                <li><Link to="/reviews" className="hover:text-white">Guest Reviews</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#C4A36A]">Guest Desk</p>
              <ul className="space-y-2.5 text-sm text-[#F6F0E7]/80">
                <li><Link to="/my-bookings" className="hover:text-white">My Bookings</Link></li>
                <li><Link to="/contact" className="hover:text-white">Directions &amp; Contact</Link></li>
                <li><Link to="/social" className="hover:text-white">Facebook &amp; Instagram</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ &amp; Policies</Link></li>
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#C4A36A] hover:underline"
                  >
                    WhatsApp Desk <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href={settings?.facebookUrl || 'https://www.facebook.com/healingtouchbrj'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Facebook Page <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li><Link to="/admin" className="text-[#F6F0E7]/65 hover:text-white">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[#F6F0E7]/15 pt-8 text-xs text-[#F6F0E7]/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings?.businessName || 'Healing Touch Spa & Saloon'} · Aadarsh Nagar, Birgunj, Nepal.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms &amp; Guest Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
