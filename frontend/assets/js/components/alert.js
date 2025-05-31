/**
 * Sistema de Alertas - Manejo de notificaciones
 */

export class AlertManager {
  static container = null;
  static initialized = false;

  /**
   * Inicializar el sistema de alertas
   */
  static init(container) {
    this.container = container;
    this.initialized = true;
    console.log("✅ AlertManager: Sistema de alertas inicializado");
  }

  /**
   * Mostrar alerta de éxito
   */
  static success(message, duration = 4000) {
    return this.show(message, "success", duration);
  }

  /**
   * Mostrar alerta de error
   */
  static error(message, duration = 6000) {
    return this.show(message, "danger", duration);
  }

  /**
   * Mostrar alerta de advertencia
   */
  static warning(message, duration = 5000) {
    return this.show(message, "warning", duration);
  }

  /**
   * Mostrar alerta informativa
   */
  static info(message, duration = 4000) {
    return this.show(message, "info", duration);
  }

  /**
   * Mostrar alerta personalizada
   */
  static show(message, type = "info", duration = 4000) {
    if (!this.initialized || !this.container) {
      console.warn("AlertManager: Sistema no inicializado");
      return null;
    }

    const alertId = `alert-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const iconMap = {
      success: "fa-check-circle",
      danger: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };

    const alertHTML = `
      <div id="${alertId}" class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
        <i class="fas ${iconMap[type]} alert-icon"></i>
        <span class="alert-message">${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    // Insertar la alerta
    this.container.insertAdjacentHTML("beforeend", alertHTML);

    const alertElement = document.getElementById(alertId);

    // Auto-ocultar si se especifica duración
    if (duration > 0) {
      setTimeout(() => {
        this.hide(alertId);
      }, duration);
    }

    return alertId;
  }

  /**
   * Ocultar una alerta específica
   */
  static hide(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.classList.remove("show");
      alertElement.classList.add("fade");

      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 150);
    }
  }

  /**
   * Limpiar todas las alertas
   */
  static clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}

// Exportar también para uso global
window.AlertManager = AlertManager;
