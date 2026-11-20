import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useGetBusinessSettingsQuery } from '../../store/api/endpoints.ts';
import { buildWhatsAppUrl } from '../../utils/nepal.ts';

export const WhatsAppButton: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();
  const url = buildWhatsAppUrl(
    settings?.whatsappNumber || '+9779823945000',
    'Namaste Healing Touch Spa & Saloon! I would like to inquire about booking an appointment.'
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Healing Touch on WhatsApp"
      className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 border border-[#C4A36A]/55 bg-[#183D35]/95 px-4 py-2.5 text-xs font-medium tracking-wide text-[#FBF9F5] shadow-lg backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#112C26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D35]"
    >
      <MessageCircle className="h-4 w-4 text-[#C4A36A]" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
    </a>
  );
};
