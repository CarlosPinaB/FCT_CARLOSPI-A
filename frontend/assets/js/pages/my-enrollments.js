/**
 * Página temporal de Mis Inscripciones
 */

export class MyEnrollmentsPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
  }

  async render() {
    return `
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center p-5">
                <i class="fas fa-tools text-warning mb-3" style="font-size: 3rem;"></i>
                <h3 class="mb-3">Mis Inscripciones</h3>
                <p class="text-muted mb-4">Esta página está en construcción.</p>
                <a href="#" data-route="/dashboard" class="btn btn-primary">
                  <i class="fas fa-arrow-left me-2"></i>
                  Volver al Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // Verificar permisos
    if (
      !this.app.auth.isAuthenticated() ||
      this.app.auth.getCurrentUser()?.role !== "alumno"
    ) {
      this.router.navigate("/login");
      return;
    }
  }
}
