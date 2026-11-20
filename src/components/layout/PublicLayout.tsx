import React from 'react';
import { Footer } from './Footer.tsx';
import { Navbar } from './Navbar.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#252525]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
