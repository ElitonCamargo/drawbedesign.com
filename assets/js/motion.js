/* ==========================================================================
   MOTION SYSTEM — drawbe
   Responsável por ativar animações quando elementos entram na viewport
   Usa IntersectionObserver (performático e moderno)
   ========================================================================== */

(function () {
  let observer;

  /**
   * Inicializa o observer de motion
   * Pode ser chamada múltiplas vezes (ex: após renderizar templates)
   */
  function initMotion() {
    const motionElements = document.querySelectorAll(
      '[class*="fx-"]'
    );

    if (!motionElements.length) return;

    /**
     * Configuração do IntersectionObserver
     * threshold: porcentagem visível para ativar
     */
    if (!observer) {
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target;

              // Ativa animação
              el.classList.add('is-visible');
              el.classList.remove('is-hidden');

              // Para observar depois de ativar (anima uma única vez)
              obs.unobserve(el);
            }
          });
        },
        {
          root: null,         // viewport
          threshold: 0.15,    // 15% visível já ativa (suave)
          rootMargin: '0px 0px -60px 0px' // ativa um pouco antes do centro
        }
      );
    }

    /**
     * Inicializa observação
     */
    motionElements.forEach(el => {
      // Garante estado inicial correto
      if (!el.classList.contains('is-visible')) {
        el.classList.add('is-hidden');
      }

      observer.observe(el);
    });
  }

  // Inicializa na primeira carga
  initMotion();

  // Expõe a função globalmente para ser chamada após renderizar templates
  window.Motion = { initMotion };

})();
