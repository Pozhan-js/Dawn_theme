if (!customElements.get('my-feature-accordion')) {
  class MyFeatureAccordion extends HTMLElement {
    connectedCallback() {
      if (!this.hasAttribute('data-accordion-mode')) return;

      this.details = this.querySelectorAll('details');

      this.details.forEach((detail) => {
        detail.addEventListener('toggle', () => {
          if (!detail.open) return;

          this.details.forEach((other) => {
            if (other !== detail) other.removeAttribute('open');
          });
        });
      });
    }
  }

  customElements.define('my-feature-accordion', MyFeatureAccordion);
}
