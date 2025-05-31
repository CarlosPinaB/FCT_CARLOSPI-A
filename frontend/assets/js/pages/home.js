/**
 * Página de Inicio - Home
 */

export default class HomePage {
  constructor(app, params = {}) {
    this.app = app;
    this.params = params;
  }

  /**
   * Renderizar la página
   */
  async render() {
    return `
      <div class="hero-section bg-gradient py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="hero-title display-4 fw-bold text-primary mb-4">
                <i class="fas fa-star me-3"></i>
                Actividades Extraescolares
              </h1>
              <p class="hero-subtitle lead text-muted mb-4">
                Descubre y participa en las mejores actividades extraescolares. 
                Conecta con otros estudiantes y desarrolla nuevas habilidades.
              </p>
              <div class="hero-cta d-flex gap-3 flex-wrap">
                ${
                  this.app.isAuthenticated()
                    ? `<a href="#" data-route="/dashboard" class="btn btn-primary btn-lg">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Mi Dashboard
                  </a>`
                    : `<a href="#" data-route="/register" class="btn btn-primary btn-lg">
                    <i class="fas fa-user-plus me-2"></i>
                    Registrarse
                  </a>
                  <a href="#" data-route="/login" class="btn btn-outline-primary btn-lg">
                    <i class="fas fa-sign-in-alt me-2"></i>
                    Iniciar Sesión
                  </a>`
                }
                <a href="#" data-route="/activities" class="btn btn-outline-secondary btn-lg">
                  <i class="fas fa-search me-2"></i>
                  Explorar Actividades
                </a>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="text-center">
                <i class="fas fa-users display-1 text-primary opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container my-5">
        <!-- Estadísticas -->
        <div class="row mb-5">
          <div class="col-12">
            <h2 class="text-center mb-5">
              <i class="fas fa-chart-bar me-2"></i>
              Nuestra Comunidad
            </h2>
          </div>
        </div>
        
        <div class="row g-4 mb-5">
          <div class="col-md-3 col-sm-6">
            <div class="stats-card card h-100 text-center">
              <div class="card-body">
                <div class="stats-icon bg-primary text-white rounded-circle mx-auto mb-3">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <h3 class="stats-number">50+</h3>
                <p class="stats-label text-muted">Actividades Disponibles</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="stats-card card h-100 text-center">
              <div class="card-body">
                <div class="stats-icon bg-success text-white rounded-circle mx-auto mb-3">
                  <i class="fas fa-users"></i>
                </div>
                <h3 class="stats-number">200+</h3>
                <p class="stats-label text-muted">Estudiantes Activos</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="stats-card card h-100 text-center">
              <div class="card-body">
                <div class="stats-icon bg-warning text-white rounded-circle mx-auto mb-3">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 class="stats-number">25+</h3>
                <p class="stats-label text-muted">Profesores</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3 col-sm-6">
            <div class="stats-card card h-100 text-center">
              <div class="card-body">
                <div class="stats-icon bg-info text-white rounded-circle mx-auto mb-3">
                  <i class="fas fa-trophy"></i>
                </div>
                <h3 class="stats-number">15+</h3>
                <p class="stats-label text-muted">Categorías</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Características -->
        <div class="row mb-5">
          <div class="col-12">
            <h2 class="text-center mb-5">
              <i class="fas fa-star me-2"></i>
              ¿Por qué elegirnos?
            </h2>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="fas fa-clock text-primary"></i>
                </div>
                <h4>Horarios Flexibles</h4>
                <p class="text-muted">
                  Actividades adaptadas a tu horario escolar. 
                  Encuentra el momento perfecto para participar.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="fas fa-users text-success"></i>
                </div>
                <h4>Comunidad Activa</h4>
                <p class="text-muted">
                  Conecta con estudiantes que comparten tus intereses. 
                  Forma nuevas amistades y trabaja en equipo.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="fas fa-graduation-cap text-warning"></i>
                </div>
                <h4>Desarrollo Personal</h4>
                <p class="text-muted">
                  Desarrolla nuevas habilidades y talentos. 
                  Complementa tu educación académica.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Final -->
        <div class="row mt-5">
          <div class="col-12">
            <div class="text-center p-5 bg-light rounded">
              <h3 class="mb-3">¿Listo para comenzar?</h3>
              <p class="text-muted mb-4">
                Únete a nuestra comunidad y descubre todas las oportunidades que tenemos para ti.
              </p>
              ${
                !this.app.isAuthenticated()
                  ? `<a href="#" data-route="/register" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-rocket me-2"></i>
                  Comenzar Ahora
                </a>`
                  : ""
              }
              <a href="#" data-route="/activities" class="btn btn-outline-primary btn-lg">
                <i class="fas fa-eye me-2"></i>
                Ver Actividades
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar la página después del render
   */
  async init() {
    console.log("🏠 HomePage: Página inicializada");

    // Agregar animaciones a las estadísticas
    this.animateStats();

    // Verificar mensajes flash
    this.checkFlashMessages();
  }

  /**
   * Animar las estadísticas
   */
  animateStats() {
    const statsNumbers = document.querySelectorAll(".stats-number");

    statsNumbers.forEach((stat) => {
      const target = parseInt(stat.textContent);
      let current = 0;
      const increment = target / 30; // 30 frames de animación

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        stat.textContent =
          Math.floor(current) + (stat.textContent.includes("+") ? "+" : "");
      }, 50);
    });
  }

  /**
   * Verificar y mostrar mensajes flash
   */
  checkFlashMessages() {
    const flashMessage = sessionStorage.getItem("flashMessage");
    if (flashMessage) {
      const { message, type } = JSON.parse(flashMessage);
      sessionStorage.removeItem("flashMessage");

      if (window.AlertManager) {
        setTimeout(() => {
          window.AlertManager[type](message);
        }, 500);
      }
    }
  }
}
