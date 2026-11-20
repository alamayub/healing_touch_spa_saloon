import React, { useEffect } from 'react';
import { X, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { SalonService, SpaService } from '../../types/domain.ts';
import { formatDuration, formatNpr } from '../../utils/nepal.ts';
import { LuxuryVisual } from './LuxuryVisual.tsx';

interface TreatmentRitualModalProps {
  service: SpaService | SalonService | null;
  type: 'spa' | 'salon';
  lang: 'en' | 'ne';
  onClose: () => void;
  onBook: (serviceId: string, isCouple: boolean) => void;
}

function isSpaService(item: SpaService | SalonService): item is SpaService {
  return 'supportsCouple' in item;
}

export const TreatmentRitualModal: React.FC<TreatmentRitualModalProps> = ({
  service,
  type,
  lang,
  onClose,
  onBook,
}) => {
  useEffect(() => {
    if (!service) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [service, onClose]);

  if (!service) return null;

  const spa = isSpaService(service) ? service : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={service.name}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0C211C]/75 p-0 backdrop-blur-xs sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#183D35]/15 bg-[#FBF9F5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close treatment details"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center border border-[#FBF9F5]/30 bg-[#0E2620]/75 text-[#FBF9F5] backdrop-blur-sm transition-colors hover:bg-[#0E2620]"
        >
          <X className="h-4 w-4" />
        </button>

        <LuxuryVisual
          src={service.imageUrl}
          alt={service.name}
          visualKey={service.visualKey || (type === 'spa' ? 'spa_massage' : 'salon_lounge')}
          aspectClass="aspect-[16/9]"
          overlayScrim
        />

        <div className="space-y-6 p-6 sm:p-9">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#858078]">
              <span>{service.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5 text-[#C4A36A]" />
                {formatDuration(service.durationMinutes, lang)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">+{service.bufferMinutes}m suite prep</span>
            </div>

            <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-[#183D35] sm:text-4xl">
              {lang === 'ne' && service.nameNe ? service.nameNe : service.name}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-[#252525]/85 sm:text-base">
            {service.description}
          </p>

          {spa?.involves && (
            <div className="border-t border-[#183D35]/10 pt-5">
              <p className="text-xs font-semibold tracking-wider text-[#183D35]">
                What This Ritual Involves
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#252525]/80">{spa.involves}</p>
            </div>
          )}

          <div className="flex items-start gap-2.5 border border-[#183D35]/10 bg-[#F6F0E7]/70 p-4 text-xs leading-relaxed text-[#183D35]/85">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C4A36A]" />
            <span>
              Non-medical relaxation &amp; beauty service with fresh single-guest linens, temperature consultation, and dedicated room ventilation buffer.
            </span>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#183D35]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#858078]">Session Rate</p>
              <div className="mt-0.5 flex items-baseline gap-3">
                <span className="font-mono text-xl font-semibold tabular-nums text-[#183D35]">
                  {formatNpr(service.priceNpr, lang)}
                </span>
                {spa?.supportsCouple && spa.couplePriceNpr && (
                  <span className="font-mono text-xs tabular-nums text-[#858078]">
                    Couple Suite: {formatNpr(spa.couplePriceNpr, lang)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBook(service.id, false);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-[#183D35] px-5 py-3 text-xs font-semibold tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#112C26] sm:flex-initial whitespace-nowrap"
              >
                {spa ? 'Reserve Single' : 'Book This Service'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {spa?.supportsCouple && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBook(service.id, true);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-[#183D35] px-5 py-3 text-xs font-semibold tracking-wide text-[#183D35] transition-colors hover:bg-[#F6F0E7] sm:flex-initial whitespace-nowrap"
                >
                  Reserve Couple Suite
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
