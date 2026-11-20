import React from 'react';
import { Footer } from './Footer.tsx';
import { Navbar } from './Navbar.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';
import { useGetBusinessSettingsQuery } from '../../store/api/endpoints.ts';
import { useAppSelector } from '../../store/index.ts';
import { useTranslationText } from '../../i18n/translations.ts';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { data: settings } = useGetBusinessSettingsQuery();
  const lang = useAppSelector((s) => s.ui.language);
  const t = useTranslationText(lang);

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#252525]">
      <Navbar />
      {settings?.showDemoContentBanner && (
        <div className="border-b border-[#183D35]/10 bg-[#F6F0E7]/85 px-4 py-1.5 text-center text-[11px] tracking-wide text-[#183D35]/80">
          {t.demoNotice}
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
