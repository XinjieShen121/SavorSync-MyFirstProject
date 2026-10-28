import React from 'react';
import './TypeCover.css';

// Typeset cover shown in place of a missing recipe photo (design.md 1.1 proposal).
// It never pretends to be a photo: it only shows facts the recipe already has.
// Each region keeps the same tint everywhere, using design.md 2.1 tokens.
const REGION_TONES: Record<string, string> = {
  mediterranean: 'warm',
  european: 'sunken',
  asian: 'saffron',
  'middle eastern': 'herb',
  african: 'herb',
  latin: 'brand',
  american: 'brand',
};

const coverTone = (region?: string) => REGION_TONES[(region || '').trim().toLowerCase()] || 'warm';

interface TypeCoverProps {
  title: string;
  kicker?: string;
  region?: string;
  size?: 'card' | 'hero';
}

const TypeCover: React.FC<TypeCoverProps> = ({ title, kicker, region, size = 'card' }) => (
  <div className={`type-cover type-cover--${coverTone(region)} type-cover--${size}`} aria-hidden="true">
    {kicker && <span className="type-cover__kicker">{kicker}</span>}
    <span className="type-cover__title">{title}</span>
    <span className="type-cover__note"><i className="bi bi-camera"></i>Photo coming soon</span>
  </div>
);

export default TypeCover;
