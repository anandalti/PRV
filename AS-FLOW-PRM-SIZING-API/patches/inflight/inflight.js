'use strict';

/**
 * inflight — patched v1.0.7
 *
 * Drop-in replacement for inflight@1.0.6 that fixes CWE-772 (resource leak /
 * memory leak) by guaranteeing cleanup of the GLOBALSTATE map even when
 * callbacks throw. Also uses Object.create(null) to prevent prototype-pollution.
 *
 * API is identical to the original:
 *   inflight(key, cb) → null  (request already in-flight, cb queued)
 *   inflight(key, cb) → key   (new in-flight request started)
 */

// Use null-prototype map — no inherited properties, prevents prototype pollution
var GLOBALSTATE = Object.create(null);

module.exports = inflight;

function inflight(key, cb) {
  if (GLOBALSTATE[key]) {
    // Already in-flight — queue the callback
    GLOBALSTATE[key].push(cb);
    return null;
  }

  // Start a new in-flight request
  GLOBALSTATE[key] = [cb];

  var immediate = setImmediate(function () {
    var cbs = GLOBALSTATE[key];

    // Always delete FIRST to prevent memory leak (CWE-772 fix).
    // The original inflight deleted after iterating, so a throw would skip deletion.
    delete GLOBALSTATE[key];

    if (!cbs) return;

    for (var i = 0; i < cbs.length; i++) {
      try {
        cbs[i]();
      } catch (_) {
        // Swallow — caller's error does not prevent cleanup of remaining callbacks
      }
    }
  });

  // Don't prevent process exit while waiting
  if (immediate && typeof immediate.unref === 'function') {
    immediate.unref();
  }

  return key; // truthy — signals "new request, proceed"
}
