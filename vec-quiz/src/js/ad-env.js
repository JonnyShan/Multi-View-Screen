// Ad environment layer. Uses MRAID when the host injects it (in app), and falls back
// to plain web behaviour (CM360 or DV360 HTML5 in a browser, review page, local preview).
//
// The quiz renders immediately either way; only the "view" report and the attract
// animation wait until the ad is actually viewable.

function attempt(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
}

export function createAdEnv(win) {
  const w = win || window;
  const listeners = [];
  let viewable = false;

  const getMraid = () => (w.mraid && typeof w.mraid.getState === 'function' ? w.mraid : null);
  const mraid = getMraid();
  const kind = mraid ? 'mraid' : 'web';

  function setViewable(next) {
    const value = Boolean(next);
    if (value === viewable) return;
    viewable = value;
    listeners.slice().forEach((fn) => attempt(() => fn(value)));
  }

  function initMraid() {
    const onReady = () => {
      attempt(() => mraid.addEventListener('viewableChange', (v) => setViewable(v)));
      // MRAID 3.0 hosts report exposure instead of (or as well as) viewability.
      attempt(() => mraid.addEventListener('exposureChange', (pct) => setViewable(Number(pct) > 0)));
      attempt(() => mraid.addEventListener('stateChange', (state) => {
        if (state === 'hidden') setViewable(false);
      }));
      setViewable(attempt(() => mraid.isViewable(), false));
    };
    if (attempt(() => mraid.getState(), 'loading') === 'loading') {
      attempt(() => mraid.addEventListener('ready', onReady));
    } else {
      onReady();
    }
  }

  function initWeb() {
    let onScreen = true;
    const update = () => setViewable(!w.document.hidden && onScreen);
    if (typeof w.IntersectionObserver === 'function') {
      // Inside an ad iframe the implicit root is the top level viewport, so this
      // tracks whether the creative is really on screen.
      const io = new w.IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        onScreen = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        update();
      }, { threshold: [0, 0.5, 1] });
      io.observe(w.document.documentElement);
    }
    w.document.addEventListener('visibilitychange', update);
    update();
  }

  if (mraid) initMraid();
  else initWeb();

  return {
    kind,
    isViewable: () => viewable,
    onViewableChange(fn) {
      listeners.push(fn);
    },
    whenViewable(fn) {
      if (viewable) {
        fn();
        return;
      }
      const once = (v) => {
        if (!v) return;
        listeners.splice(listeners.indexOf(once), 1);
        fn();
      };
      listeners.push(once);
    },
    // The click URL: the ad server's clickTag when it set one, otherwise the fallback
    // from config/client.json.
    clickUrl(fallback) {
      const tag = w.clickTag || w.clickTAG;
      return typeof tag === 'string' && tag ? tag : fallback || '';
    },
    open(url) {
      if (!url) return false;
      const m = getMraid();
      if (m && typeof m.open === 'function') {
        if (attempt(() => (m.open(url), true), false)) return true;
      }
      return attempt(() => (w.open(url, '_blank'), true), false);
    }
  };
}
