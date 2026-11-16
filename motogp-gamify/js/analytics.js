// Anonymous play stats via Google Analytics 4: where people play from (GA's own IP-based country/city),
// how long they stay, and what happens in each ride. No names, initials or ad signals are sent.
// Off on localhost, in automated browsers, and with ?noga=1.
import { ANALYTICS_ID, PARAMS, QUALITY, KIOSK } from './config.js';

const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === 'file:';
const on = !!ANALYTICS_ID && !navigator.webdriver && !local && PARAMS.get('noga') !== '1';
window.__track = []; // last events, for debugging in the console

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

if (on) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', ANALYTICS_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    content_group: location.pathname.split('/').filter(Boolean)[0] || 'root', // which build: red-line or wild-turkey-redline
    quality: QUALITY.tier,
    kiosk: KIOSK ? 1 : 0,
  });
}

export function track(name, params = {}) {
  window.__track.push([name, params]);
  if (window.__track.length > 50) window.__track.shift();
  if (on) gtag('event', name, params);
}
