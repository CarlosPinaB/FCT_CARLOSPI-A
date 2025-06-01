/**
 * Página de Error 403 - Acceso Denegado
 */

export class Error403Page {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
  }

  async render() {
    return `
      <div class="container mt-5 pt-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card border-0 shadow">
              <div class="card-body text-center p-5">
                <div class="mb-4">
                  <i class="fas fa-ban text-warning" style="font-size: 5rem;"></i>
                </div>
                
                <h1 class="h2 mb-3">Acceso Denegado</h1>
                <p class="lead text-muted mb-4">
                  No tienes permisos para acceder a esta página.
                </p>
                
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button class="btn btn-primary me-md-2" data-route="/dashboard">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Ir al Dashboard
                  </button>
                  <button class="btn btn-outline-secondary" data-route="/">
                    <i class="fas fa-home me-2"></i>
                    Ir al Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    console.log("🚫 Error403Page: Página inicializada");
  }
}

// Exportar la clase usando ES6 modules
export { Error403Page };
