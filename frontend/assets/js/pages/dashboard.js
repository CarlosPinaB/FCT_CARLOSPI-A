/**
 * Dashboard Page - Sistema de Actividades Extraescolares
 * Dashboard diferenciado por roles (profesor/alumno)
 */

class DashboardPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.stats = {};

    // Obtener usuario inmediatamente para render()
    this.user = this.app?.authService?.getUser();

    if (!this.user) {
      console.error("❌ Dashboard: Usuario no autenticado");
    }
  }

  /**
   * Renderizar la página dashboard - SOLO devuelve HTML
   */
  render() {
    if (!this.user) {
      return `
        <div class="container mt-4">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Debes iniciar sesión para ver el dashboard.
          </div>
        </div>
      `;
    }

    const isProfesor = this.user.role === "profesor";

    return `
      <div class="dashboard-container">
        <!-- Header del Dashboard -->
        <div class="dashboard-header mb-4">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h3 mb-1">
                <i class="fas fa-tachometer-alt me-2"></i>
                ¡Bienvenido, ${this.user.name}!
              </h1>
              <p class="text-muted mb-0">
                ${
                  isProfesor
                    ? "Panel de gestión para profesores"
                    : "Tu panel de actividades"
                }
              </p>
            </div>
            <div class="col-md-4 text-end">
              <span class="badge bg-${isProfesor ? "primary" : "success"} fs-6">
                <i class="fas fa-${
                  isProfesor ? "chalkboard-teacher" : "user-graduate"
                } me-1"></i>
                ${isProfesor ? "Profesor" : "Alumno"}
              </span>
            </div>
          </div>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="row g-4 mb-4" id="dashboard-stats">
          ${this.renderLoadingStats()}
        </div>

        <!-- Contenido Específico por Rol -->
        <div class="row g-4">
          <div class="col-lg-8">
            ${
              isProfesor
                ? this.renderProfesorContent()
                : this.renderAlumnoContent()
            }
          </div>
          <div class="col-lg-4">
            ${this.renderSidebar()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar después del render - Patrón SPA
   */
  async init(params) {
    console.log("📊 Dashboard: Inicializando después del render...");

    try {
      // Verificar autenticación
      if (!this.user) {
        console.error("❌ Dashboard: Usuario no autenticado");
        this.router.navigate("/login");
        return;
      }

      // Cargar datos específicos del rol
      await this.loadRoleSpecificData();

      console.log("✅ Dashboard: Dashboard inicializado correctamente");
    } catch (error) {
      console.error("❌ Dashboard: Error inicializando:", error);
      this.app.alert.error("Error cargando el dashboard");
    }
  }

  /**
   * Renderizar estadísticas de carga
   */
  renderLoadingStats() {
    return `
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <p class="card-text mt-2 mb-0 text-muted">Cargando...</p>
          </div>
        </div>
      </div>
    `.repeat(4);
  }

  /**
   * Renderizar contenido específico para profesores
   */
  renderProfesorContent() {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-calendar-alt me-2"></i>
            Mis Actividades Recientes
          </h5>
        </div>
        <div class="card-body">
          <div id="recent-activities">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted">Cargando actividades...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas Profesor -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-bolt me-2"></i>
            Acciones Rápidas
          </h5>
        </div>
        <div class="card-body">
          <div class="d-grid gap-2">
            <button class="btn btn-primary" data-route="/activity/create">
              <i class="fas fa-plus me-2"></i>
              Crear Nueva Actividad
            </button>
            <button class="btn btn-outline-primary" data-route="/my-activities">
              <i class="fas fa-list me-2"></i>
              Gestionar Mis Actividades
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar contenido específico para alumnos
   */
  renderAlumnoContent() {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-bookmark me-2"></i>
            Mis Inscripciones Activas
          </h5>
        </div>
        <div class="card-body">
          <div id="my-enrollments">
            <div class="text-center py-4">
              <div class="spinner-border text-success" role="status"></div>
              <p class="mt-2 text-muted">Cargando inscripciones...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividades Recomendadas -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-star me-2"></i>
            Actividades Recomendadas
          </h5>
        </div>
        <div class="card-body">
          <div id="recommended-activities">
            <div class="text-center py-4">
              <div class="spinner-border text-warning" role="status"></div>
              <p class="mt-2 text-muted">Cargando recomendaciones...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar sidebar común
   */
  renderSidebar() {
    return `
      <!-- Información de Perfil -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-user me-2"></i>
            Mi Perfil
          </h5>
        </div>
        <div class="card-body">
          <div class="text-center mb-3">
            <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                 style="width: 80px; height: 80px;">
              <i class="fas fa-user fa-2x text-muted"></i>
            </div>
          </div>
          <h6 class="text-center mb-1">${this.user.name}</h6>
          <p class="text-center text-muted small mb-3">${this.user.email}</p>
          <div class="d-grid">
            <button class="btn btn-outline-secondary btn-sm" data-route="/profile">
              <i class="fas fa-edit me-1"></i>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Enlaces Rápidos -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-transparent border-0 pb-0">
          <h5 class="card-title mb-0">
            <i class="fas fa-link me-2"></i>
            Enlaces Rápidos
          </h5>
        </div>
        <div class="card-body">
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action border-0 px-0" data-route="/activities">
              <i class="fas fa-search me-2 text-primary"></i>
              Explorar Actividades
            </a>
            ${
              this.user.role === "alumno"
                ? `
              <a href="#" class="list-group-item list-group-item-action border-0 px-0" data-route="/my-enrollments">
                <i class="fas fa-bookmark me-2 text-success"></i>
                Mis Inscripciones
              </a>
            `
                : `
              <a href="#" class="list-group-item list-group-item-action border-0 px-0" data-route="/my-activities">
                <i class="fas fa-cog me-2 text-primary"></i>
                Gestionar Actividades
              </a>
            `
            }
            <a href="#" class="list-group-item list-group-item-action border-0 px-0" data-route="/profile">
              <i class="fas fa-user-cog me-2 text-secondary"></i>
              Configurar Perfil
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Cargar datos específicos según el rol
   */
  async loadRoleSpecificData() {
    try {
      if (this.user.role === "profesor") {
        await this.loadProfesorData();
      } else {
        await this.loadAlumnoData();
      }

      await this.loadStats();
    } catch (error) {
      console.error("❌ Dashboard: Error cargando datos:", error);
    }
  }

  /**
   * Cargar datos específicos para profesores
   */
  async loadProfesorData() {
    try {
      // Cargar actividades del profesor
      const activities = await this.app.activitiesAPI.getMyActivities();
      this.renderRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error("❌ Dashboard: Error cargando datos de profesor:", error);
      document.getElementById("recent-activities").innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error cargando actividades
        </div>
      `;
    }
  }

  /**
   * Cargar datos específicos para alumnos
   */
  async loadAlumnoData() {
    try {
      // Cargar inscripciones del alumno
      const enrollments = await this.app.enrollmentsAPI.getMyEnrollments();
      this.renderMyEnrollments(enrollments.slice(0, 5));

      // Cargar actividades recomendadas
      const recommended = await this.app.activitiesAPI.getPublicActivities();
      this.renderRecommendedActivities(recommended.slice(0, 3));
    } catch (error) {
      console.error("❌ Dashboard: Error cargando datos de alumno:", error);
    }
  }

  /**
   * Cargar estadísticas generales
   */
  async loadStats() {
    try {
      let stats = {};

      if (this.user.role === "profesor") {
        const activities = await this.app.activitiesAPI.getMyActivities();
        const totalParticipants = activities.reduce(
          (sum, activity) => sum + (activity.enrolled_count || 0),
          0
        );

        stats = {
          totalActivities: activities.length,
          activeActivities: activities.filter((a) => a.is_active).length,
          totalParticipants: totalParticipants,
          thisMonth: activities.filter(
            (a) =>
              new Date(a.start_date) >=
              new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ).length,
        };
      } else {
        const enrollments = await this.app.enrollmentsAPI.getMyEnrollments();
        const allActivities =
          await this.app.activitiesAPI.getPublicActivities();

        stats = {
          totalEnrollments: enrollments.length,
          activeEnrollments: enrollments.filter(
            (e) => e.status === "active" || e.status === "approved"
          ).length,
          availableActivities: allActivities.length,
          thisMonth: enrollments.filter(
            (e) =>
              new Date(e.created_at) >=
              new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          ).length,
        };
      }

      this.renderStats(stats);
    } catch (error) {
      console.error("❌ Dashboard: Error cargando estadísticas:", error);
    }
  }

  /**
   * Renderizar estadísticas
   */
  renderStats(stats) {
    const isProfesor = this.user.role === "profesor";

    const statsConfig = isProfesor
      ? [
          {
            label: "Mis Actividades",
            value: stats.totalActivities,
            icon: "calendar-alt",
            color: "primary",
          },
          {
            label: "Activas",
            value: stats.activeActivities,
            icon: "check-circle",
            color: "success",
          },
          {
            label: "Participantes",
            value: stats.totalParticipants,
            icon: "users",
            color: "info",
          },
          {
            label: "Este Mes",
            value: stats.thisMonth,
            icon: "chart-line",
            color: "warning",
          },
        ]
      : [
          {
            label: "Mis Inscripciones",
            value: stats.totalEnrollments,
            icon: "bookmark",
            color: "success",
          },
          {
            label: "Activas",
            value: stats.activeEnrollments,
            icon: "check-circle",
            color: "primary",
          },
          {
            label: "Disponibles",
            value: stats.availableActivities,
            icon: "search",
            color: "info",
          },
          {
            label: "Este Mes",
            value: stats.thisMonth,
            icon: "calendar",
            color: "warning",
          },
        ];

    const statsHtml = statsConfig
      .map(
        (stat) => `
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="text-${stat.color} mb-2">
              <i class="fas fa-${stat.icon} fa-2x"></i>
            </div>
            <h3 class="h4 mb-1">${stat.value}</h3>
            <p class="card-text text-muted small mb-0">${stat.label}</p>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    document.getElementById("dashboard-stats").innerHTML = statsHtml;
  }

  /**
   * Renderizar actividades recientes del profesor
   */
  renderRecentActivities(activities) {
    if (!activities || activities.length === 0) {
      document.getElementById("recent-activities").innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
          <h6 class="text-muted">No tienes actividades creadas</h6>
          <button class="btn btn-primary btn-sm mt-2" data-route="/activity/create">
            <i class="fas fa-plus me-1"></i>
            Crear Primera Actividad
          </button>
        </div>
      `;
      return;
    }

    const activitiesHtml = activities
      .map(
        (activity) => `
      <div class="d-flex align-items-center py-2 border-bottom">
        <div class="flex-grow-1">
          <h6 class="mb-1">${activity.name}</h6>
          <small class="text-muted">
            <i class="fas fa-calendar me-1"></i>
            ${new Date(activity.start_date).toLocaleDateString()}
            <span class="ms-2">
              <i class="fas fa-users me-1"></i>
              ${activity.enrolled_count || 0}/${
          activity.capacity || "Sin límite"
        }
            </span>
          </small>
        </div>
        <div class="text-end">
          <span class="badge bg-${
            activity.is_active ? "success" : "secondary"
          }">
            ${activity.is_active ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>
    `
      )
      .join("");

    document.getElementById("recent-activities").innerHTML = `
      ${activitiesHtml}
      <div class="text-center mt-3">
        <button class="btn btn-outline-primary btn-sm" data-route="/my-activities">
          Ver Todas las Actividades
        </button>
      </div>
    `;
  }

  /**
   * Renderizar inscripciones del alumno
   */
  renderMyEnrollments(enrollments) {
    if (!enrollments || enrollments.length === 0) {
      document.getElementById("my-enrollments").innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-bookmark fa-3x text-muted mb-3"></i>
          <h6 class="text-muted">No tienes inscripciones activas</h6>
          <button class="btn btn-success btn-sm mt-2" data-route="/activities">
            <i class="fas fa-search me-1"></i>
            Explorar Actividades
          </button>
        </div>
      `;
      return;
    }

    const enrollmentsHtml = enrollments
      .map(
        (enrollment) => `
      <div class="d-flex align-items-center py-2 border-bottom">
        <div class="flex-grow-1">
          <h6 class="mb-1">${enrollment.activity.name}</h6>
          <small class="text-muted">
            <i class="fas fa-calendar me-1"></i>
            ${new Date(enrollment.activity.start_date).toLocaleDateString()}
            <span class="ms-2">
              <i class="fas fa-map-marker-alt me-1"></i>
              ${enrollment.activity.location || "Sin ubicación"}
            </span>
          </small>
        </div>
        <div class="text-end">
          <span class="badge bg-${
            enrollment.status === "active" || enrollment.status === "approved"
              ? "success"
              : "warning"
          }">
            ${
              enrollment.status === "active" || enrollment.status === "approved"
                ? "Inscrito"
                : "Cancelado"
            }
          </span>
        </div>
      </div>
    `
      )
      .join("");

    document.getElementById("my-enrollments").innerHTML = `
      ${enrollmentsHtml}
      <div class="text-center mt-3">
        <button class="btn btn-outline-success btn-sm" data-route="/my-enrollments">
          Ver Todas las Inscripciones
        </button>
      </div>
    `;
  }

  /**
   * Renderizar actividades recomendadas
   */
  renderRecommendedActivities(activities) {
    if (!activities || activities.length === 0) {
      document.getElementById("recommended-activities").innerHTML = `
        <div class="text-center py-3">
          <i class="fas fa-search fa-2x text-muted mb-2"></i>
          <p class="text-muted mb-0">No hay actividades disponibles</p>
        </div>
      `;
      return;
    }

    const activitiesHtml = activities
      .map(
        (activity) => `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3">
          <h6 class="card-title mb-1 text-truncate">${activity.name}</h6>
          <small class="text-muted d-block">
            <i class="fas fa-calendar me-1"></i>
            ${new Date(activity.start_date).toLocaleDateString()}
          </small>
          <button class="btn btn-outline-primary btn-sm mt-2" 
                  data-route="/activity/${activity.id}">
            Ver Detalles
          </button>
        </div>
      </div>
    `
      )
      .join("");

    document.getElementById("recommended-activities").innerHTML =
      activitiesHtml;
  }
}

// Exportar la clase usando ES6 modules
export { DashboardPage };
