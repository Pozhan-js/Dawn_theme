if (!customElements.get('my-feature-accordion')) {
  class MyFeatureAccordion extends HTMLElement {}

  customElements.define('my-feature-accordion', MyFeatureAccordion);
}
