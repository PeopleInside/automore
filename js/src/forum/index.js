app.initializers.add('peopleinside/automore', (app) => {
  // Check if IntersectionObserver is supported
  if (typeof IntersectionObserver === 'undefined') {
    console.debug('[automore] IntersectionObserver not supported, extension disabled');
    return;
  }

  // Configuration
  const CONFIG = {
    maxAutoLoads: 10,        // Maximum number of automatic loads before stopping
    clickCooldown: 1000,     // Milliseconds between auto-clicks
    rootMargin: '150px',     // Trigger distance from viewport
    debug: false,            // Set to true for verbose logging
  };

  // State tracking
  let autoLoadCount = 0;
  let userHasManuallyStopped = false;

  const log = (...args) => {
    if (CONFIG.debug) {
      console.debug('[automore]', ...args);
    }
  };

  // Check if user has disabled auto-load via localStorage
  const isAutoLoadEnabled = () => {
    const stored = localStorage.getItem('automore-enabled');
    return stored !== 'false'; // Default to true if not set
  };

  const setAutoLoadEnabled = (enabled) => {
    localStorage.setItem('automore-enabled', enabled.toString());
    userHasManuallyStopped = !enabled;
    log('Auto-load', enabled ? 'enabled' : 'disabled', 'by user');
  };

  // Set up the IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    // Don't auto-load if disabled or limit reached
    if (!isAutoLoadEnabled() || userHasManuallyStopped) {
      log('Auto-load skipped (disabled or stopped)');
      return;
    }

    if (autoLoadCount >= CONFIG.maxAutoLoads) {
      log('Max auto-loads reached:', autoLoadCount);
      return;
    }

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const button = target.tagName === 'BUTTON' ? target : target.querySelector('button');
        
        if (button && !button.disabled && !button.classList.contains('disabled')) {
          const now = Date.now();
          const lastClick = button.getAttribute('data-last-auto-click')
            ? parseInt(button.getAttribute('data-last-auto-click'), 10)
            : 0;
          
          if (now - lastClick > CONFIG.clickCooldown) {
            button.setAttribute('data-last-auto-click', now.toString());
            autoLoadCount++;
            log('Auto-click triggered, count:', autoLoadCount);
            button.click();
          }
        }
      }
    });
  }, {
    root: null,
    rootMargin: CONFIG.rootMargin,
    threshold: 0
  });

  const observedElements = new Set();

  // Find and observe load-more buttons
  const findAndObserveButtons = () => {
    // More specific selectors for Flarum 1.x and 2.0
    const selectors = [
      '.DiscussionList-loadMore',
      '.DiscussionList-loadMore button',
      '.PostStream-loadMore',
      '.PostStream-loadMore button'
    ];

    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (!observedElements.has(element)) {
            observedElements.add(element);
            observer.observe(element);
            log('Observing element:', element);
          }
        });
      } catch (e) {
        console.debug('[automore] Selector error:', selector, e);
      }
    });
  };

  // Initial scan
  findAndObserveButtons();

  // Optimized MutationObserver: only watch discussion list containers
  const mutationObserver = new MutationObserver((mutations) => {
    let shouldRescan = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if added node is or contains a load-more button
            if (node.matches && (
              node.matches('.DiscussionList-loadMore') ||
              node.matches('.PostStream-loadMore') ||
              node.querySelector('.DiscussionList-loadMore, .PostStream-loadMore')
            )) {
              shouldRescan = true;
            }
          }
        });
      }
    });

    if (shouldRescan) {
      log('DOM mutation detected, rescanning');
      findAndObserveButtons();
    }
  });

  // Observe only the main content area, not the entire body
  const observeTarget = document.querySelector('.IndexPage, .DiscussionPage, #content') || document.body;
  
  mutationObserver.observe(observeTarget, {
    childList: true,
    subtree: true,
  });

  log('Extension initialized with config:', CONFIG);

  // Expose API for user control (optional, for advanced users)
  window.automore = {
    enable: () => setAutoLoadEnabled(true),
    disable: () => setAutoLoadEnabled(false),
    status: () => ({
      enabled: isAutoLoadEnabled(),
      autoLoadCount,
      maxAutoLoads: CONFIG.maxAutoLoads,
    }),
    reset: () => {
      autoLoadCount = 0;
      log('Auto-load count reset');
    }
  };
});
