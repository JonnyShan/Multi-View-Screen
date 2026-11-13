/** Inline SVG icons and the title logo. Original artwork, no third-party marks. */

export const ICON_SMG = `<svg viewBox="0 0 64 24" aria-hidden="true"><path d="M2 8h34l2-3h8v3h14v4H46l-2 2h-6l-2 8h-7l1-8H18l-3 4H9l2-4H2z"/><rect x="40" y="13" width="4" height="9"/></svg>`;

export const ICON_KATANA = `<svg viewBox="0 0 64 24" aria-hidden="true"><path d="M4 17 C 20 13, 40 8, 60 3 L 61 5 C 42 10, 22 15, 6 19 Z"/><rect x="3" y="16" width="10" height="4" rx="1" transform="rotate(-14 8 18)"/><ellipse cx="14" cy="16.5" rx="1.6" ry="4" transform="rotate(-14 14 16.5)"/></svg>`;

export const ICON_STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z"/></svg>`;

export const ICON_PHONE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>`;

/**
 * Title logo: white brush lettering over a red brush stroke. The stroke edges
 * are roughened with an SVG turbulence filter so it reads as painted.
 */
export const LOGO_SVG = `
<svg class="logo" viewBox="0 0 900 250" role="img" aria-label="Night Contracts">
  <defs>
    <filter id="rough" x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.4" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="roughText" x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="stroke" x1="0" x2="1">
      <stop offset="0" stop-color="#e0262b" stop-opacity="0"/>
      <stop offset="0.08" stop-color="#e0262b"/>
      <stop offset="0.85" stop-color="#c41c21"/>
      <stop offset="1" stop-color="#e0262b" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  <g filter="url(#rough)">
    <path d="M40 150 C 180 118, 420 108, 860 96 L 870 178 C 520 176, 260 190, 30 212 Z" fill="url(#stroke)"/>
    <path d="M90 196 C 300 186, 560 186, 820 176 L 824 190 C 560 198, 320 202, 96 208 Z" fill="#8f1418" opacity="0.8"/>
  </g>
  <g filter="url(#roughText)" transform="skewX(-10)">
    <text x="470" y="118" text-anchor="middle" font-family="Teko, Impact, sans-serif" font-weight="600" font-size="128" letter-spacing="10" fill="#ece6da">NIGHT</text>
    <text x="478" y="205" text-anchor="middle" font-family="Teko, Impact, sans-serif" font-weight="600" font-size="104" letter-spacing="8" fill="#ffffff">CONTRACTS</text>
  </g>
</svg>`;
