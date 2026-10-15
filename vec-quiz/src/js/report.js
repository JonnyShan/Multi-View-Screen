// Reporting hooks. Every quiz event goes through track(). Delivery to the Worker only
// happens when config/client.json has reporting.enabled true and an https endpoint;
// otherwise nothing leaves the creative. No personal data, cookies or ids are sent:
// each event is a count of what happened (language, question, answer, score).

export function createReporter({ config, version, env, hook }) {
  const cfg = config || {};
  const endpoint = typeof cfg.endpoint === 'string' ? cfg.endpoint : '';
  const enabled = cfg.enabled === true && /^https:\/\/[^\s]+$/.test(endpoint);
  const base = { v: version || '', cid: cfg.campaignId || '', env: env || '' };
  const sentOnce = new Set();

  function send(body) {
    // sendBeacon with a string posts text/plain, which needs no CORS preflight.
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return;
    } catch (e) {
      // fall through
    }
    try {
      fetch(endpoint, { method: 'POST', body, keepalive: true, mode: 'no-cors', credentials: 'omit' });
      return;
    } catch (e) {
      // fall through
    }
    try {
      new Image().src = endpoint + (endpoint.includes('?') ? '&' : '?') + 'd=' + encodeURIComponent(body);
    } catch (e) {
      // give up quietly: reporting must never break the ad
    }
  }

  function track(e, data, options) {
    if (options && options.once) {
      if (sentOnce.has(e)) return null;
      sentOnce.add(e);
    }
    const evt = Object.assign({ e }, base, data || {});
    if (hook) {
      try {
        hook(evt, enabled);
      } catch (err) {
        // a broken hook must not stop the quiz
      }
    }
    if (enabled) send(JSON.stringify(evt));
    return evt;
  }

  return { track, enabled };
}
