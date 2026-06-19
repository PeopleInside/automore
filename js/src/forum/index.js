import addAutoMoreSettings from './addAutoMoreSettings';

app.initializers.add('peopleinside/automore', (app) => {
  // Registra il toggle nelle impostazioni utente
  addAutoMoreSettings();

  // Disabilita silenziosamente se IntersectionObserver non è supportato
  if (typeof IntersectionObserver === 'undefined') {
    console.debug('[automore] IntersectionObserver not supported, extension disabled');
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
    // Utenti loggati: preferenza salvata nel profilo
    if (app.session && app.session.user) {
      return app.session.user.preferences().automore_enabled !== false;
    }
    // Ospiti: fallback su localStorage
    return localStorage.getItem('automore-enabled') !== 'false';
  };

  // IntersectionObserver per il caricamento automatico
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
        const button = target.tagName === 'BUTTON'
          ? target
          : target.querySelector('button');

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
    threshold: 0,
  });

  const observedElements = new Set();

  const findAndObserveButtons = () => {
    const selectors = [
      '.DiscussionList-loadMore',
      '.DiscussionList-loadMore button',
      '.PostStream-loadMore',
      '.PostStream-loadMore button',
    ];

    selectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((element) => {
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

  // MutationObserver ottimizzato: osserva solo il contenuto principale
  const mutationObserver = new MutationObserver((mutations) => {
    let shouldRescan = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.matches && (
          node.matches('.DiscussionList-loadMore, .PostStream-loadMore') ||
          (node.querySelector && node.querySelector('.DiscussionList-loadMore, .PostStream-loadMore'))
        )) {
          shouldRescan = true;
        }
      });
    });

    if (shouldRescan) {
      log('DOM mutation, rescanning');
      findAndObserveButtons();
    }
  });

  const observeTarget = document.querySelector('.IndexPage, .DiscussionPage, #content') || document.body;
  mutationObserver.observe(observeTarget, { childList: true, subtree: true });

  log('Initialized', CONFIG);

  // API pubblica per debug/testing
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
