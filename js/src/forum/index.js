import app from 'flarum/forum/app';
import addAutoMoreSettings from './addAutoMoreSettings';

app.initializers.add('peopleinside/automore', () => {
  addAutoMoreSettings();

  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  const CONFIG = {
    rootMargin: '150px',
    clickCooldown: 500, // Cooldown minimo anti-sfarfallio, rimosso il blocco maxAutoLoads
    debug: false,
  };

  const log = (...args) => {
    if (CONFIG.debug) console.debug('[automore]', ...args);
  };

  const isAutoLoadEnabled = () => {
    if (app.session && app.session.user) {
      return app.session.user.preferences().automore_enabled !== false;
    }
    // Per gli ospiti, controlla il localStorage (allineato al nome della preferenza)
    return localStorage.getItem('automore_enabled') !== 'false';
  };

  const observer = new IntersectionObserver((entries) => {
    if (!isAutoLoadEnabled()) {
      log('Auto-load disabled by user');
      return;
    }

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const button = target.tagName === 'BUTTON' ? target : target.querySelector('button');

        // SICUREZZA: Clicchiamo solo se il pulsante è attivo e Flarum non sta già caricando
        if (
          button &&
          !button.disabled &&
          !button.classList.contains('disabled') &&
          !button.classList.contains('is-loading')
        ) {
          const now = Date.now();
          const lastClick = button.getAttribute('data-last-auto-click')
            ? parseInt(button.getAttribute('data-last-auto-click'), 10)
            : 0;

          if (now - lastClick > CONFIG.clickCooldown) {
            button.setAttribute('data-last-auto-click', now.toString());
            log('Auto-click triggered');
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

  // BEST PRACTICE: WeakSet per evitare Memory Leaks nel DOM di Flarum
  const observedElements = new WeakSet();

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
          }
        });
      } catch (e) {
        console.debug('[automore] Selector error:', selector, e);
      }
    });
  };

  findAndObserveButtons();

  // PERFORMANCE: Debounce sul MutationObserver (evita scansioni DOM a raffica)
  let debounceTimer;
  const mutationObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      findAndObserveButtons();
    }, 200);
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  log('Initialized', CONFIG);
});
