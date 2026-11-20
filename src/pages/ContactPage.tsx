import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useGetBusinessSettingsQuery, useSendContactMessageMutation } from '../store/api/endpoints.ts';
import { buildWhatsAppUrl, isValidNepalPhone } from '../utils/nepal.ts';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(120),
  phone: z.string().refine(isValidNepalPhone, 'Enter a valid Nepal phone number (+977...)'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  subject: z.string().max(160).optional(),
  message: z.string().min(5, 'Please enter your message').max(1500),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();
  const [sendContact, { isLoading }] = useSendContactMessageMutation();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const whatsappUrl = buildWhatsAppUrl(
    settings?.whatsappNumber || '+9779823945000',
    'Namaste Healing Touch Spa & Saloon! I have a question.'
  );

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError('');
    try {
      await sendContact({
        id: `msg-${Date.now()}`,
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || undefined,
        subject: values.subject?.trim() || 'Website Inquiry',
        message: values.message.trim(),
      }).unwrap();
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to send your message right now. Please call +977 982-3945000 or message us on WhatsApp.'
      );
    }
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Contact & Directions"
        description="Contact Healing Touch Spa & Saloon in Aadarsh Nagar, Birgunj, Nepal. Call +977 982-3945000, message on WhatsApp, or get Google Maps directions."
        image="/images/hero_sanctuary.jpg"
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Get in Touch</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl lg:text-6xl">
            Visit or Message Healing Touch
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Reach our Aadarsh Nagar concierge desk directly by phone, WhatsApp, or inquiry form for bridal consultations, group visits, or custom spa itineraries.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#183D35]/14 bg-[#FBF9F5] p-7 space-y-5 text-sm">
              <h2 className="font-display text-3xl font-medium text-[#183D35]">
                Birgunj Reception Desk
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#183D35]" />
                <span>{settings?.address || 'Aadarsh Nagar, Birgunj, Parsa, Madhesh Province, Nepal'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#183D35]" />
                <a
                  href={`tel:${(settings?.phone || '+9779823945000').replace(/\s+/g, '')}`}
                  className="tabular-nums hover:underline"
                >
                  {settings?.phone || '+977 982-3945000'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#183D35]" />
                <span>{settings?.email || 'concierge@healingtouchbirgunj.com'}</span>
              </div>
              <p className="border-t border-[#183D35]/10 pt-4 text-xs text-[#858078]">
                {settings?.openingHoursText || 'Daily: 9:30 AM – 8:30 PM'}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#183D35] px-4 py-2.5 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#0E2620]"
                >
                  <MessageCircle className="h-4 w-4 text-[#C4A36A]" /> WhatsApp
                </a>
                <a
                  href={
                    settings?.googleMapsUrl ||
                    'https://www.google.com/maps/place/Healing+Touch+Spa+%26+Saloon/'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#183D35]/20 px-4 py-2.5 text-xs font-medium text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
                >
                  Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={settings?.facebookUrl || 'https://www.facebook.com/healingtouchbrj'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#183D35]/20 px-4 py-2.5 text-xs font-medium text-[#183D35] transition-colors hover:bg-[#F6F0E7]"
                >
                  Facebook <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-[#183D35]/14 bg-[#FBF9F5] p-7 sm:p-10">
            <h2 className="font-display text-3xl font-medium text-[#183D35]">Send an Inquiry</h2>
            {submitted ? (
              <div className="mt-6 border border-[#183D35]/20 bg-[#F6F0E7] p-6">
                <p className="font-semibold text-[#183D35]">Message received</p>
                <p className="mt-1 text-sm text-[#252525]/80">
                  Thank you for contacting Healing Touch Spa &amp; Saloon. Our Birgunj reception team will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-semibold text-[#183D35] underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">Name *</label>
                    <input
                      {...register('name')}
                      className="mt-1.5 w-full border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#183D35] focus:outline-none"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">Phone (+977) *</label>
                    <input
                      {...register('phone')}
                      className="mt-1.5 w-full border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#183D35] focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">
                      Email (Optional)
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="mt-1.5 w-full border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#183D35] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#183D35]">Subject</label>
                    <input
                      {...register('subject')}
                      placeholder="Bridal / Group Inquiry"
                      className="mt-1.5 w-full border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#183D35] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#183D35]">Message *</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="mt-1.5 w-full border border-[#183D35]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#183D35] focus:outline-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-700">{errors.message.message}</p>
                  )}
                </div>
                {submitError && (
                  <p className="border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                    {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#183D35] px-7 py-3 text-xs font-semibold tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#0E2620]"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
