/**
 * Sistema de Carga - Manejo de indicadores de loading
 */

export class LoaderManager {
  static overlay = null;
  static loadingText = null;
  static initialized = false;
  static isVisible = false;

  /**
   * Inicializar el sistema de loader
   */
  static init(overlay) {
    this.overlay = overlay;
    this.loadingText = overlay?.querySelector(".loading-text");
    this.initialized = true;
    console.log("✅ LoaderManager: Sistema de loader inicializado");
  }

  /**
   * Mostrar el loader
   */
  static show(message = "Cargando...") {
    if (!this.initialized || !this.overlay) {
      console.warn("LoaderManager: Sistema no inicializado");
      return;
    }

    // Actualizar texto si se proporciona
    if (this.loadingText && message) {
      this.loadingText.textContent = message;
    }

    // Mostrar overlay
    this.overlay.classList.remove("d-none");
    this.isVisible = true;

    // Prevenir scroll del body
    document.body.style.overflow = "hidden";
  }

  /**
   * Ocultar el loader
   */
  static hide() {
    if (!this.initialized || !this.overlay) {
      return;
    }

    // Ocultar overlay
    this.overlay.classList.add("d-none");
    this.isVisible = false;

    // Restaurar scroll del body
    document.body.style.overflow = "";

    // Resetear texto
    if (this.loadingText) {
      this.loadingText.textContent = "Cargando...";
    }
  }

  /**
   * Verificar si el loader está visible
   */
  static isShowing() {
    return this.isVisible;
  }

  /**
   * Mostrar loader por un tiempo específico
   */
  static showForDuration(duration = 2000, message = "Cargando...") {
    this.show(message);
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Mostrar loader con promesa
   */
  static async showWithPromise(promise, message = "Cargando...") {
    try {
      this.show(message);
      const result = await promise;
      return result;
    } finally {
      this.hide();
    }
  }
}

// Exportar también para uso global
window.LoaderManager = LoaderManager;
