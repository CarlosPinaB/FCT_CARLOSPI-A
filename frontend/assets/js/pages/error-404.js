/**
 * Error 404 Page - Sistema de Actividades Extraescolares
 * Página para rutas no encontradas
 */

class Error404Page {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
  }

  /**
   * Renderizar la página de error 404
   */
  render() {
    return `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">
            <div class="text-center">
              <!-- Icono de error -->
              <div class="mb-4">
                <i class="fas fa-search text-muted" style="font-size: 6rem; opacity: 0.3;"></i>
              </div>

              <!-- Número de error -->
              <h1 class="display-1 fw-bold text-primary">404</h1>
              
              <!-- Mensaje principal -->
              <h2 class="h4 mb-3">Página no encontrada</h2>
              <p class="text-muted mb-4">
                Lo sentimos, la página que buscas no existe o ha sido movida.
              </p>

              <!-- Sugerencias -->
              <div class="card border-0 bg-light mb-4">
                <div class="card-body">
                  <h6 class="card-title">¿Qué puedes hacer?</h6>
                  <ul class="list-unstyled mb-0 text-start">
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Verifica que la URL esté escrita correctamente
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Regresa a la página principal
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Explora nuestras actividades disponibles
                    </li>
                    <li class="mb-0">
                      <i class="fas fa-check text-success me-2"></i>
                      Contacta con soporte si el problema persiste
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="d-grid gap-2 d-md-block">
                <button class="btn btn-primary btn-lg" data-route="/">
                  <i class="fas fa-home me-2"></i>
                  Ir al Inicio
                </button>
                <button class="btn btn-outline-primary btn-lg" data-route="/activities">
                  <i class="fas fa-search me-2"></i>
                  Ver Actividades
                </button>
              </div>

              <!-- Enlaces adicionales -->
              <div class="mt-4">
                <small class="text-muted">
                  ¿Necesitas ayuda? 
                  <a href="#" class="text-decoration-none" data-route="/contact">
                    Contacta con nosotros
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividades populares (si las hay) -->
        <div class="row mt-5">
          <div class="col-12">
            <div class="text-center mb-4">
              <h5 class="text-muted">Mientras tanto, echa un vistazo a estas actividades</h5>
            </div>
            <div id="popular-activities" class="row">
              <!-- Se cargará dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar la página de error 404
   */
  async init() {
    console.log("❌ Error404: Mostrando página 404");

    // Cargar actividades populares si es posible
    this.loadPopularActivities();
  }

  /**
   * Cargar actividades populares para mostrar como sugerencia
   */
  async loadPopularActivities() {
    try {
      if (window.app?.activitiesAPI) {
        const activities = await window.app.activitiesAPI.getPopularActivities(
          3
        );
        this.renderPopularActivities(activities);
      }
    } catch (error) {
      console.log("ℹ️ Error404: No se pudieron cargar actividades populares");
      // No es crítico, solo ocultar la sección
      document
        .getElementById("popular-activities")
        .closest(".row").style.display = "none";
    }
  }

  /**
   * Renderizar actividades populares
   */
  renderPopularActivities(activities) {
    if (!activities || activities.length === 0) {
      document
        .getElementById("popular-activities")
        .closest(".row").style.display = "none";
      return;
    }

    const activitiesHtml = activities
      .map(
        (activity) => `
      <div class="col-md-4 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-title text-truncate">${activity.title}</h6>
            <p class="card-text text-muted small text-truncate">
              ${activity.description || "Sin descripción"}
            </p>
            <button class="btn btn-outline-primary btn-sm" data-route="/activity/${
              activity.id
            }">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    document.getElementById("popular-activities").innerHTML = activitiesHtml;
  }
}

// Exportar la clase usando ES6 modules
export { Error404Page };
