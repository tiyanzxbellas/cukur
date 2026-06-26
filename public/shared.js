// shared.js — SW registration + silent auto-update
// Included in all pages. No toast, no confirm, no reload loop.
// When a new SW is found → skipWaiting → clients.claim → page reloads ONCE silently.

(function () {
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;

  // Listen for SW controller change (new SW took over) → reload once
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    // Small delay to avoid reload race with navigation
    setTimeout(() => window.location.reload(), 100);
  });

  navigator.serviceWorker.register('/sw.js', {
    // updateViaCache: 'none' → browser always re-fetches sw.js from network
    // This is the KEY fix: without this, browser caches sw.js itself
    updateViaCache: 'none'
  }).then(reg => {

    // Force check for update every time page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        reg.update();
      }
    });

    // Also check on page load (catches updates since last visit)
    reg.update();

    function activateWaitingSW(worker) {
      worker.postMessage('SKIP_WAITING');
    }

    // If there's already a waiting SW → activate it now
    if (reg.waiting) {
      activateWaitingSW(reg.waiting);
      return;
    }

    // Watch for a new SW being installed
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        // 'installed' + controller exists = new SW waiting to take over
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          activateWaitingSW(newWorker);
        }
      });
    });

  }).catch(err => {
    console.warn('[SW] Registration failed:', err);
  });
})();

// ===== Saurus AI FLOATING BUTTON =====
// Auto-inject on all pages except ai.html itself
(function() {
  if (window.location.pathname === '/ai' || window.location.pathname === '/ai.html') return;

  const style = document.createElement('style');
  style.textContent = `
    .Saurus-ai-fab {
      position: fixed;
      bottom: 24px;
      right: 16px;
      z-index: 9999;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(99,102,241,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: white;
      font-size: 1.15rem;
    }
    .Saurus-ai-fab:active {
      transform: scale(0.9);
    }
    .Saurus-ai-fab::after {
      content: 'AI';
      position: absolute;
      top: -6px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 0.48rem;
      font-weight: 900;
      padding: 2px 4px;
      border-radius: 100px;
      letter-spacing: 0.5px;
      font-family: 'Poppins', sans-serif;
    }
    @keyframes fab-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(99,102,241,0.45); }
      50% { box-shadow: 0 4px 28px rgba(99,102,241,0.7); }
    }
    .Saurus-ai-fab { animation: fab-pulse 3s ease-in-out infinite; }
  `;
  document.head.appendChild(style);

  const fab = document.createElement('a');
  fab.href = '/ai';
  fab.className = 'Saurus-ai-fab';
  fab.setAttribute('aria-label', 'Buka Saurus AI');
  fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M228,116a52.06,52.06,0,0,0-52-52H164V56a36,36,0,0,0-72,0v8H80A52.06,52.06,0,0,0,28,116v12a52.06,52.06,0,0,0,52,52h16v20a12,12,0,0,0,24,0V180h16a52.06,52.06,0,0,0,52-52Zm-24,12a28,28,0,0,1-28,28H80a28,28,0,0,1-28-28V116A28,28,0,0,1,80,88H176a28,28,0,0,1,28,28Zm-100-8a12,12,0,1,1-12-12A12,12,0,0,1,104,120Zm72,0a12,12,0,1,1-12-12A12,12,0,0,1,176,120Z"/></svg>';
  document.body.appendChild(fab);
})();
