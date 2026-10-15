// Mock MRAID 3.0 host. The harness build inlines this in place of mraid.js, so the
// playable sees a window.mraid object exactly as it would in an app. Every call is
// posted to the harness page, and the harness drives ready, viewability, exposure
// and state changes.
(function () {
  var NS = 'vq-mraid';
  var NS_HOST = 'vq-mraid-host';
  var listeners = {};
  var state = 'loading';
  var viewable = false;
  var placementType = 'interstitial';
  var orientation = { allowOrientationChange: true, forceOrientation: 'none' };
  var expandProps = { width: innerWidth, height: innerHeight, useCustomClose: false, isModal: true };
  var resizeProps = null;

  function post(message) {
    message.ns = NS;
    try {
      parent.postMessage(message, '*');
    } catch (e) {
      // not framed
    }
  }

  function log(call, args) {
    post({ type: 'call', call: call, args: args || [], state: state });
  }

  function fire(evt) {
    var args = Array.prototype.slice.call(arguments, 1);
    (listeners[evt] || []).slice().forEach(function (fn) {
      try {
        fn.apply(null, args);
      } catch (e) {
        post({ type: 'error', message: evt + ' listener threw: ' + e });
      }
    });
  }

  function rect() {
    return { x: 0, y: 0, width: innerWidth, height: innerHeight };
  }

  window.mraid = {
    getVersion: function () { log('getVersion'); return '3.0'; },
    getState: function () { return state; },
    addEventListener: function (evt, fn) {
      log('addEventListener', [evt]);
      (listeners[evt] = listeners[evt] || []).push(fn);
    },
    removeEventListener: function (evt, fn) {
      log('removeEventListener', [evt]);
      if (!listeners[evt]) return;
      listeners[evt] = fn ? listeners[evt].filter(function (f) { return f !== fn; }) : [];
    },
    isViewable: function () { return viewable; },
    open: function (url) { log('open', [url]); },
    close: function () { log('close'); },
    unload: function () { log('unload'); },
    expand: function (url) { log('expand', [url]); },
    resize: function () { log('resize'); },
    useCustomClose: function (value) { log('useCustomClose', [value]); },
    getPlacementType: function () { return placementType; },
    getMaxSize: function () { return { width: innerWidth, height: innerHeight }; },
    getScreenSize: function () { return { width: innerWidth, height: innerHeight }; },
    getCurrentPosition: rect,
    getDefaultPosition: rect,
    getCurrentAppOrientation: function () {
      return { orientation: innerWidth > innerHeight ? 'landscape' : 'portrait', locked: false };
    },
    getOrientationProperties: function () { return orientation; },
    setOrientationProperties: function (props) { log('setOrientationProperties', [props]); orientation = props; },
    getExpandProperties: function () { return expandProps; },
    setExpandProperties: function (props) { log('setExpandProperties', [props]); expandProps = props; },
    getResizeProperties: function () { return resizeProps; },
    setResizeProperties: function (props) { log('setResizeProperties', [props]); resizeProps = props; },
    getLocation: function () { return null; },
    supports: function (feature) { log('supports', [feature]); return false; },
    playVideo: function (url) { log('playVideo', [url]); }
  };

  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.ns !== NS_HOST) return;
    if (d.cmd === 'ready' && state === 'loading') {
      state = 'default';
      fire('stateChange', state);
      fire('ready');
    } else if (d.cmd === 'viewable') {
      viewable = Boolean(d.value);
      fire('viewableChange', viewable);
      fire('exposureChange', viewable ? 100 : 0, viewable ? rect() : null, null);
    } else if (d.cmd === 'exposure') {
      var pct = Number(d.value) || 0;
      viewable = pct > 0;
      fire('exposureChange', pct, pct > 0 ? rect() : null, null);
      fire('viewableChange', viewable);
    } else if (d.cmd === 'state') {
      state = d.value;
      if (state === 'hidden') viewable = false;
      fire('stateChange', state);
    } else if (d.cmd === 'placement') {
      placementType = d.value;
    } else if (d.cmd === 'size') {
      fire('sizeChange', innerWidth, innerHeight);
    }
  });

  post({ type: 'loaded' });
})();
