// Text fitting. Translations run longer than English, so every text box shrinks its
// font until the copy fits, down to a floor. Anything still overflowing at the floor
// is flagged with data-overflow so the review page and QA can report it.
//
// Overflow is measured by counting rendered lines rather than comparing scrollHeight:
// Arabic and Devanagari fonts have tall ascenders and descenders that push scrollHeight
// past the line box even when every line fits.

function lineCount(el) {
  const range = el.ownerDocument.createRange();
  range.selectNodeContents(el);
  const tops = [];
  Array.from(range.getClientRects()).forEach((r) => {
    if (!r.width || !r.height) return;
    if (!tops.some((t) => Math.abs(t - r.top) < r.height * 0.5)) tops.push(r.top);
  });
  return tops.length;
}

function overflows(el) {
  if (el.scrollWidth > el.clientWidth + 1) return true;
  const cs = getComputedStyle(el);
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
  const fits = Math.max(1, Math.floor((el.clientHeight + 1) / lineHeight));
  return lineCount(el) > fits;
}

export function fitElement(el, minPx) {
  el.style.fontSize = '';
  if (!el.textContent || el.offsetParent === null) {
    el.removeAttribute('data-overflow');
    return true;
  }
  let size = parseFloat(getComputedStyle(el).fontSize) || 16;
  let guard = 0;
  while (overflows(el) && size > minPx && guard < 40) {
    size = Math.max(minPx, Math.floor(size * 0.93 * 10) / 10);
    el.style.fontSize = size + 'px';
    guard += 1;
  }
  const over = overflows(el);
  if (over) el.setAttribute('data-overflow', '');
  else el.removeAttribute('data-overflow');
  return !over;
}

// Fits every [data-fit] element inside the active screen, then shrinks the whole
// layout scale if the screen itself still overflows the viewport.
export function fitScreen(screen, root, minPx) {
  const fitAll = () => {
    screen.querySelectorAll('[data-fit]').forEach((el) => fitElement(el, minPx));
  };
  const screenOver = () => {
    const box = screen.getBoundingClientRect();
    const cs = getComputedStyle(screen);
    const top = box.top + parseFloat(cs.paddingTop) - 1;
    const bottom = box.bottom - parseFloat(cs.paddingBottom) + 1;
    const spills = Array.from(screen.children).some((el) => {
      if (el.offsetParent === null) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && (r.top < top || r.bottom > bottom);
    });
    return spills || screen.scrollHeight > screen.clientHeight + 2;
  };
  let scale = 1;
  root.style.setProperty('--vq-scale', '1');
  fitAll();
  let guard = 0;
  while (screenOver() && scale > 0.6 && guard < 10) {
    scale = Math.round((scale - 0.05) * 100) / 100;
    root.style.setProperty('--vq-scale', String(scale));
    fitAll();
    guard += 1;
  }
  const over = screenOver();
  if (over) screen.setAttribute('data-overflow', '');
  else screen.removeAttribute('data-overflow');
  const flagged = Array.from(screen.querySelectorAll('[data-overflow]')).filter((el) => el.offsetParent !== null);
  const keys = flagged.map((el) => el.getAttribute('data-key') || el.className);
  if (over) keys.push('screen');
  return { scale, overflow: keys };
}
