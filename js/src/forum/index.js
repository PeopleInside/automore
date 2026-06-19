app.initializers.add('peopleinside/automore', (app) => {
  // Check if IntersectionObserver is supported (modern standard)
  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  // Set up the IntersectionObserver with a generous 150px rootMargin
  // to pre-trigger loading before the button is fully visible,
  // creating a seamless, premium infinite scroll experience.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Find the button (could be the target or inside the target)
        const target = entry.target;
        const button = target.tagName === 'BUTTON' ? target : target.querySelector('button');
        
        if (button && !button.disabled && !button.classList.contains('disabled')) {
          // Security / stability rule: enforce a click cooldown to prevent infinite click cycles
          // in case of slow connections or server-side issues.
          const now = Date.now();
          const lastClick = button.getAttribute('data-last-auto-click')
            ? parseInt(button.getAttribute('data-last-auto-click'), 10)
            : 0;
          
          if (now - lastClick > 1000) {
            button.setAttribute('data-last-auto-click', now.toString());
            button.click();
          }
        }
      }
    });
  }, {
    root: null, // use the browser viewport
    rootMargin: '150px', // start clicking the button when it's within 150px of the viewport
    threshold: 0 // trigger as soon as any part of it enters the margin
  });

  const observedElements = new Set();

  // Scans the DOM for Flarum's load-more containers or buttons
  const findAndObserveButtons = () => {
    // Select Flarum 1.x & 2.0 list load-more wrapping classes, e.g. .DiscussionList-loadMore,
    // or generic containers ending in "loadMore", plus direct button elements.
    const selectors = [
      '.DiscussionList-loadMore',
      '[class$="loadMore"]',
      '[class*="-loadMore"]',
      '.DiscussionList-loadMore button',
      '[class$="loadMore"] button'
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
        // Prevent selector parsing issues from halting execution
      }
    });
  };

  // Perform an initial scan
  findAndObserveButtons();

  // Watch for DOM mutations to seamlessly track newly rendered posts or lists
  const mutationObserver = new MutationObserver(() => {
    findAndObserveButtons();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
