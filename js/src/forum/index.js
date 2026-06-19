import app from 'flarum/forum/app';
import addAutoMoreSettings from './addAutoMoreSettings';

app.initializers.add('peopleinside/automore', () => {
  // Registra il toggle nelle impostazioni utente
  addAutoMoreSettings();

  // Check if IntersectionObserver is supported (modern standard)
  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  // Configurazione
  const CONFIG = {
    maxAutoLoads: 10,
    clickCooldown: 1000,
    rootMargin: '150px',
    debug: false,
  };

  let autoLoadCount = 0;

  const log = (...args) => {
    if (CONFIG.debug) console.debug('[automore]', ...args);
  };

  // Verifica se l'utente ha abilitato l'auto-load
  const isAutoLoadEnabled = () => {
    if (app.session && app.session.user) {
      return app.session.user.preferences().automore_enabled !== false;
    }
    return localStorage.getItem('automore-enabled') !== 'false';
  };

  // Set up the IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    if (!isAutoLoadEnabled()) {
      log('Auto-load disabled by user');
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

  const findAndObserveButtons = () => {
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
            log('Observing:', element);
          }
        });
      } catch (e) {
        console.debug('[automore] Selector error:', selector, e);
      }
    });
  };

  findAndObserveButtons();

  const mutationObserver = new MutationObserver(() => {
    findAndObserveButtons();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  log('Initialized', CONFIG);

  // API pubblica per debug
  window.automore = {
    status: () => ({
      enabled: isAutoLoadEnabled(),
      autoLoadCount,
      maxAutoLoads: CONFIG.maxAutoLoads,
    }),
    reset: () => {
      autoLoadCount = 0;
      log('Counter reset');
    },
  };
});
