(function () {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  const PANEL_SPRING = { type: 'spring', duration: 0.34, bounce: 0.06 };
  const REVEAL_EASE = [0.22, 1, 0.36, 1];

  function waitForMotion(callback) {
    if (window.Motion) {
      callback(window.Motion);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (window.Motion) {
        window.clearInterval(timer);
        callback(window.Motion);
      } else if (attempts >= 40) {
        window.clearInterval(timer);
      }
    }, 50);
  }

  function stopAnimations(controls) {
    if (!controls) return;
    Object.values(controls).forEach((control) => control?.stop?.());
  }

  function getItemParts(item) {
    return {
      details: item.querySelector('details'),
      panel: item.querySelector('[data-motion-panel]'),
      summary: item.querySelector('summary'),
      header: item.querySelector('.my-feature__collapse-header'),
      title: item.querySelector('.my-feature__collapse-title'),
    };
  }

  function isExpanded(item) {
    return item.dataset.expanded === 'true';
  }

  function syncAccessibility(item, expanded) {
    const { details } = getItemParts(item);
    if (!details) return;

    if (expanded) {
      details.setAttribute('open', '');
    } else {
      details.removeAttribute('open');
    }
  }

  function resetInlineHeaderStyles(item) {
    const { header, title } = getItemParts(item);
    if (header) {
      header.style.backgroundColor = '';
      header.style.boxShadow = '';
    }
    if (title) {
      title.style.transform = '';
      title.style.color = '';
    }
  }

  function setPanelVisualState(panel, expanded) {
    if (!panel) return;
    panel.style.overflow = 'hidden';
    panel.style.height = expanded ? 'auto' : '0px';
    panel.style.borderTopWidth = expanded ? '1px' : '0px';
  }

  function getPanelTargetHeight(panel) {
    const previousHeight = panel.style.height;
    panel.style.height = 'auto';
    const height = panel.scrollHeight;
    panel.style.height = previousHeight;
    return height;
  }

  function initBlockAccordionAnimations(section, animate, instant) {
    const accordions = section.querySelectorAll('my-feature-accordion');

    accordions.forEach((accordion) => {
      if (accordion.dataset.motionAccordionReady === 'true') return;
      accordion.dataset.motionAccordionReady = 'true';

      const accordionMode = accordion.hasAttribute('data-accordion-mode');
      const items = Array.from(accordion.querySelectorAll('[data-motion="item"]'));

      items.forEach((item) => {
        item._motionControls = item._motionControls || { panel: null };
        resetInlineHeaderStyles(item);
      });

      const setItemExpanded = (item, expanded) => {
        const { panel } = getItemParts(item);
        if (!panel) return Promise.resolve();

        if (expanded === isExpanded(item)) {
          syncAccessibility(item, expanded);
          setPanelVisualState(panel, expanded);
          resetInlineHeaderStyles(item);
          return Promise.resolve();
        }

        stopAnimations(item._motionControls);
        resetInlineHeaderStyles(item);

        if (expanded) {
          item.dataset.expanded = 'true';
          syncAccessibility(item, expanded);

          const targetHeight = getPanelTargetHeight(panel);
          panel.style.height = '0px';
          panel.style.overflow = 'hidden';
          panel.style.borderTopWidth = '0px';

          if (instant) {
            setPanelVisualState(panel, true);
            return Promise.resolve();
          }

          item._motionControls.panel = animate(
            panel,
            { height: ['0px', `${targetHeight}px`], borderTopWidth: ['0px', '1px'] },
            PANEL_SPRING
          );

          return item._motionControls.panel.finished.then(() => {
            setPanelVisualState(panel, true);
          });
        }

        const startHeight = panel.getBoundingClientRect().height;
        panel.style.height = `${startHeight}px`;
        panel.style.overflow = 'hidden';
        panel.style.borderTopWidth = '1px';

        item.dataset.expanded = 'false';
        syncAccessibility(item, false);

        if (instant) {
          setPanelVisualState(panel, false);
          return Promise.resolve();
        }

        item._motionControls.panel = animate(panel, { height: [`${startHeight}px`, '0px'] }, PANEL_SPRING);

        return item._motionControls.panel.finished.then(() => {
          setPanelVisualState(panel, false);
        });
      };

      const closeOtherItems = (activeItem) => {
        items.forEach((item) => {
          if (item === activeItem || !isExpanded(item)) return;
          setItemExpanded(item, false);
        });
      };

      const toggleItem = (item) => {
        if (isExpanded(item)) {
          setItemExpanded(item, false);
          return;
        }

        if (accordionMode) closeOtherItems(item);
        setItemExpanded(item, true);
      };

      const initializeItems = () => {
        items.forEach((item) => {
          const { panel, summary } = getItemParts(item);
          if (!panel) return;

          stopAnimations(item._motionControls);
          resetInlineHeaderStyles(item);

          if (summary) {
            summary.addEventListener('click', (event) => {
              event.preventDefault();
              toggleItem(item);
            });
          }

          const expanded = isExpanded(item);
          syncAccessibility(item, expanded);
          setPanelVisualState(panel, expanded);
        });

        if (accordionMode) {
          const expandedItems = items.filter((item) => isExpanded(item));
          expandedItems.slice(1).forEach((item) => {
            item.dataset.expanded = 'false';
            const { panel } = getItemParts(item);
            syncAccessibility(item, false);
            setPanelVisualState(panel, false);
            resetInlineHeaderStyles(item);
          });
        }
      };

      initializeItems();
    });
  }

  function initScrollRevealAnimations(section, animate, inView) {
    const title = section.querySelector('[data-motion="title"]');
    const subtitle = section.querySelector('[data-motion="subtitle"]');
    const accent = section.querySelector('[data-motion="accent"]');

    inView(
      section,
      () => {
        section.classList.add('is-motion-ready');

        if (accent) {
          animate(accent, { scaleX: [0, 1], opacity: [0, 1] }, { duration: 0.65, easing: REVEAL_EASE });
        }

        if (title) {
          animate(title, { opacity: [0, 1], y: [24, 0] }, { duration: 0.55, delay: 0.04, easing: REVEAL_EASE });
        }

        if (subtitle) {
          animate(subtitle, { opacity: [0, 1], y: [16, 0] }, { duration: 0.5, delay: 0.12, easing: REVEAL_EASE });
        }
      },
      { margin: '0px 0px -10% 0px' }
    );
  }

  function initMyFeatureAnimations(root = document) {
    waitForMotion(({ animate, inView }) => {
      const sections = root.querySelectorAll('[data-motion-section="my-feature"]');
      const instant = REDUCED_MOTION.matches;

      sections.forEach((section) => {
        if (section.dataset.motionReady === 'true') return;
        section.dataset.motionReady = 'true';

        initBlockAccordionAnimations(section, animate, instant);

        if (instant) {
          section.classList.add('is-motion-ready');
          return;
        }

        initScrollRevealAnimations(section, animate, inView);
      });
    });
  }

  function onReady() {
    initMyFeatureAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', (event) => {
      initMyFeatureAnimations(event.target);
    });
  }
})();
