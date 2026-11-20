import React, { useState } from 'react';
import { VisualKey } from '../../types/domain.ts';

interface LuxuryVisualProps {
  src?: string;
  alt: string;
  visualKey?: VisualKey;
  aspectClass?: string;
  className?: string;
  overlayScrim?: boolean;
  caption?: string;
  priority?: boolean;
  objectPosition?: 'center' | 'top';
}

const REAL_VISUAL_IMAGES: Record<VisualKey, string> = {
  hero_sanctuary: '/images/hero_sanctuary.jpg',
  spa_massage: '/images/spa_massage.jpg',
  spa_aroma: '/images/spa_aroma.jpg',
  spa_hot_stone: '/images/spa_hot_stone.jpg',
  spa_couple: '/images/spa_couple.jpg',
  spa_hydro: '/images/spa_hydro.jpg',
  spa_reflexology: '/images/spa_reflexology.jpg',
  salon_lounge: '/images/salon_lounge.jpg',
  salon_haircut: '/images/salon_haircut.jpg',
  salon_bridal: '/images/team_bridal.jpg',
  salon_keratin: '/images/team_stylist.jpg',
  salon_facial: '/images/salon_facial.jpg',
  salon_nails: '/images/salon_nails.jpg',
  package_ritual: '/images/package_ritual.jpg',
  team_portrait: '/images/team_therapist.jpg',
};

const PORTRAIT_KEYS: Set<VisualKey> = new Set([
  'team_portrait',
  'salon_bridal',
  'salon_keratin',
  'salon_haircut',
]);

export const LuxuryVisual: React.FC<LuxuryVisualProps> = ({
  src,
  alt,
  visualKey = 'spa_massage',
  aspectClass = 'aspect-[4/3]',
  className = '',
  overlayScrim = false,
  caption,
  priority = false,
  objectPosition,
}) => {
  const defaultLocalSrc = REAL_VISUAL_IMAGES[visualKey] || REAL_VISUAL_IMAGES.spa_massage;
  const [customFailed, setCustomFailed] = useState(false);

  const activeSrc = src && !customFailed ? src : defaultLocalSrc;
  const shouldAlignTop =
    objectPosition === 'top' ||
    (!objectPosition &&
      (PORTRAIT_KEYS.has(visualKey) ||
        activeSrc.includes('team_') ||
        activeSrc.includes('salon_bridal')));

  return (
    <div className={`relative overflow-hidden bg-[#183D35]/8 ${aspectClass} ${className}`}>
      <img
        src={activeSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        onError={() => {
          if (src && !customFailed) {
            setCustomFailed(true);
          }
        }}
        className={`h-full w-full object-cover ${
          shouldAlignTop ? 'object-top' : 'object-center'
        } transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
      />

      {overlayScrim && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1814]/80 via-[#1C1814]/25 to-transparent" />
      )}

      {caption && (
        <div className="pointer-events-none absolute bottom-3 left-4 right-4 text-[11px] tracking-wide text-[#F6F0E7]/90 drop-shadow-xs">
          {caption}
        </div>
      )}
    </div>
  );
};
