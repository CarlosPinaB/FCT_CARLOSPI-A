/**
 * Página de Mis Inscripciones - Para Alumnos
 * Gestión completa de inscripciones del usuario
 */

export class MyEnrollmentsPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;

    // Estado de la página
    this.enrollments = [];
    this.filteredEnrollments = [];
    this.loading = false;
    this.stats = {};
    this.filters = {
      status: "",
      sort: "newest",
    };
    this.currentPage = 1;
    this.itemsPerPage = 6;
  }

  /**
   * Renderizar la página
   */
  async render() {
    return `
      <div class="container py-4">
        <!-- Header de la página -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-6 fw-bold text-primary mb-2">
                  <i class="fas fa-bookmark me-3"></i>
                  Mis Inscripciones
                </h1>
                <p class="text-muted mb-0">
                  Gestiona tus actividades inscritas y revisa tu historial
                </p>
              </div>
              <div class="text-end">
                <a href="#" data-route="/activities" class="btn btn-outline-primary">
                  <i class="fas fa-plus me-2"></i>
                  Explorar Actividades
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="row mb-4" id="stats-section">
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-primary bg-opacity-10 border-primary border-opacity-25">
              <div class="card-body text-center">
                <i class="fas fa-bookmark text-primary mb-2" style="font-size: 2rem;"></i>
                <h4 class="text-primary mb-1" id="total-enrollments">-</h4>
                <p class="text-muted mb-0 small">Total Inscripciones</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-success bg-opacity-10 border-success border-opacity-25">
              <div class="card-body text-center">
                <i class="fas fa-check-circle text-success mb-2" style="font-size: 2rem;"></i>
                <h4 class="text-success mb-1" id="active-enrollments">-</h4>
                <p class="text-muted mb-0 small">Activas</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-info bg-opacity-10 border-info border-opacity-25">
              <div class="card-body text-center">
                <i class="fas fa-calendar-check text-info mb-2" style="font-size: 2rem;"></i>
                <h4 class="text-info mb-1" id="upcoming-enrollments">-</h4>
                <p class="text-muted mb-0 small">Próximas</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-warning bg-opacity-10 border-warning border-opacity-25">
              <div class="card-body text-center">
                <i class="fas fa-times-circle text-warning mb-2" style="font-size: 2rem;"></i>
                <h4 class="text-warning mb-1" id="cancelled-enrollments">-</h4>
                <p class="text-muted mb-0 small">Canceladas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="row g-3 justify-content-center">
                  <!-- Filtro por estado -->
                  <div class="col-lg-4 col-md-5">
                    <select class="form-select" id="status-filter">
                      <option value="">Todos los estados</option>
                      <option value="active">Activas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>
                  
                  <!-- Ordenamiento -->
                  <div class="col-lg-4 col-md-5">
                    <select class="form-select" id="sort-filter">
                      <option value="newest">Más recientes</option>
                      <option value="oldest">Más antiguas</option>
                      <option value="activity_date">Por fecha de actividad</option>
                      <option value="activity_name">Por nombre de actividad</option>
                    </select>
                  </div>
                  
                  <!-- Botón limpiar filtros -->
                  <div class="col-lg-2 col-md-2">
                    <button type="button" class="btn btn-outline-secondary w-100" id="clear-filters">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div id="loading-enrollments" class="text-center py-5" style="display: none;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando inscripciones...</span>
          </div>
          <p class="text-muted mt-3">Cargando tus inscripciones...</p>
        </div>

        <!-- Lista de inscripciones -->
        <div id="enrollments-list" class="row">
          <!-- Las inscripciones se cargarán aquí dinámicamente -->
        </div>

        <!-- Empty state -->
        <div id="empty-state" class="text-center py-5" style="display: none;">
          <i class="fas fa-bookmark display-1 text-muted mb-3"></i>
          <h3 class="text-muted">No tienes inscripciones</h3>
          <p class="text-muted mb-4">
            ¡Empieza a explorar actividades para inscribirte!
          </p>
          <a href="#" data-route="/activities" class="btn btn-primary">
            <i class="fas fa-search me-2"></i>
            Explorar Actividades
          </a>
        </div>

        <!-- Empty state filtrado -->
        <div id="empty-filtered-state" class="text-center py-5" style="display: none;">
          <i class="fas fa-filter display-1 text-muted mb-3"></i>
          <h3 class="text-muted">No se encontraron inscripciones</h3>
          <p class="text-muted">
            Intenta ajustar los filtros o <button type="button" class="btn btn-link p-0" id="clear-all-filters">limpiar la búsqueda</button>
          </p>
        </div>

        <!-- Paginación -->
        <div class="row mt-4">
          <div class="col-12">
            <nav aria-label="Paginación de inscripciones">
              <ul class="pagination justify-content-center" id="pagination">
                <!-- La paginación se generará dinámicamente -->
              </ul>
            </nav>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar la página después del render
   */
  async init() {
    try {
      // Verificar permisos
      if (
        !this.app.auth.isAuthenticated() ||
        this.app.auth.getCurrentUser()?.role !== "alumno"
      ) {
        this.router.navigate("/login");
        return;
      }

      console.log(
        "🎯 MyEnrollmentsPage: Inicializando página de inscripciones..."
      );

      // Mostrar loading
      this.showLoading();

      // Cargar datos iniciales
      await this.loadInitialData();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar inscripciones
      await this.filterAndRenderEnrollments();

      console.log("✅ MyEnrollmentsPage: Página inicializada correctamente");
    } catch (error) {
      console.error("❌ MyEnrollmentsPage: Error inicializando página:", error);
      this.showError("Error cargando tus inscripciones");
    }
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    try {
      // Cargar inscripciones y estadísticas en paralelo
      const [enrollments, stats] = await Promise.all([
        this.app.enrollmentsAPI.getMyEnrollments(),
        this.app.enrollmentsAPI.getEnrollmentStats(),
      ]);

      this.enrollments = enrollments || [];
      this.stats = stats || {};

      // Actualizar estadísticas en la UI
      this.updateStatsDisplay();

      console.log(
        `📊 MyEnrollmentsPage: ${this.enrollments.length} inscripciones cargadas`
      );
    } catch (error) {
      console.error(
        "❌ MyEnrollmentsPage: Error cargando datos iniciales:",
        error
      );
      throw error;
    }
  }

  /**
   * Actualizar estadísticas en la UI
   */
  updateStatsDisplay() {
    const totalElement = document.getElementById("total-enrollments");
    const activeElement = document.getElementById("active-enrollments");
    const upcomingElement = document.getElementById("upcoming-enrollments");
    const cancelledElement = document.getElementById("cancelled-enrollments");

    if (totalElement) totalElement.textContent = this.stats.total || 0;
    if (activeElement) activeElement.textContent = this.stats.active || 0;
    if (upcomingElement) upcomingElement.textContent = this.stats.upcoming || 0;
    if (cancelledElement)
      cancelledElement.textContent = this.stats.cancelled || 0;
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Filtro por estado
    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filters.status = e.target.value;
        this.currentPage = 1;
        this.filterAndRenderEnrollments();
      });
    }

    // Ordenamiento
    const sortFilter = document.getElementById("sort-filter");
    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        this.filters.sort = e.target.value;
        this.currentPage = 1;
        this.filterAndRenderEnrollments();
      });
    }

    // Limpiar filtros
    const clearFilters = document.getElementById("clear-filters");
    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        this.clearFilters();
      });
    }

    const clearAllFilters = document.getElementById("clear-all-filters");
    if (clearAllFilters) {
      clearAllFilters.addEventListener("click", () => {
        this.clearFilters();
      });
    }
  }

  /**
   * Filtrar y renderizar inscripciones
   */
  async filterAndRenderEnrollments() {
    try {
      this.showLoading();

      // Aplicar filtros
      this.filteredEnrollments = this.applyFilters(this.enrollments);

      // Aplicar ordenamiento
      this.filteredEnrollments = this.applySorting(this.filteredEnrollments);

      // Renderizar inscripciones de la página actual
      this.renderEnrollmentsList();

      // Renderizar paginación
      this.renderPagination();

      this.hideLoading();
    } catch (error) {
      console.error(
        "❌ MyEnrollmentsPage: Error filtrando inscripciones:",
        error
      );
      this.showError("Error aplicando filtros");
    }
  }

  /**
   * Aplicar filtros a las inscripciones
   */
  applyFilters(enrollments) {
    let filtered = [...enrollments];

    // Filtro por estado
    if (this.filters.status) {
      filtered = filtered.filter(
        (enrollment) => enrollment.status === this.filters.status
      );
    }

    return filtered;
  }

  /**
   * Aplicar ordenamiento
   */
  applySorting(enrollments) {
    const sorted = [...enrollments];

    switch (this.filters.sort) {
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

      case "activity_date":
        return sorted.sort(
          (a, b) =>
            new Date(a.activity.start_date) - new Date(b.activity.start_date)
        );

      case "activity_name":
        return sorted.sort((a, b) =>
          a.activity.name.localeCompare(b.activity.name)
        );

      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }
  }

  /**
   * Renderizar lista de inscripciones
   */
  renderEnrollmentsList() {
    const listContainer = document.getElementById("enrollments-list");
    const emptyState = document.getElementById("empty-state");
    const emptyFilteredState = document.getElementById("empty-filtered-state");

    if (!listContainer) return;

    // Calcular inscripciones para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const enrollmentsToShow = this.filteredEnrollments.slice(
      startIndex,
      endIndex
    );

    // Manejar estados vacíos
    if (this.enrollments.length === 0) {
      listContainer.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      if (emptyFilteredState) emptyFilteredState.style.display = "none";
      return;
    }

    if (enrollmentsToShow.length === 0) {
      listContainer.innerHTML = "";
      if (emptyState) emptyState.style.display = "none";
      if (emptyFilteredState) emptyFilteredState.style.display = "block";
      return;
    }

    // Ocultar estados vacíos
    if (emptyState) emptyState.style.display = "none";
    if (emptyFilteredState) emptyFilteredState.style.display = "none";

    // Renderizar inscripciones
    listContainer.innerHTML = enrollmentsToShow
      .map((enrollment) => this.renderEnrollmentItem(enrollment))
      .join("");

    // Configurar event listeners para las inscripciones
    this.setupEnrollmentEventListeners();
  }

  /**
   * Renderizar un item de inscripción
   */
  renderEnrollmentItem(enrollment) {
    // Debug: log de la inscripción que se está renderizando
    console.log(`🎨 MyEnrollments - Renderizando inscripción:`, enrollment);

    const activity = enrollment.activity;
    const formattedStartDate = this.formatDate(activity.start_date);
    const formattedEndDate = this.formatDate(activity.end_date);
    const startTime = this.formatTime(activity.start_date);
    const endTime = this.formatTime(activity.end_date);
    const enrollmentDate = this.formatDate(enrollment.created_at);

    const isActive =
      enrollment.status === "active" || enrollment.status === "approved";
    const isCancelled = enrollment.status === "cancelled";
    const isUpcoming = new Date(activity.start_date) > new Date();
    const canCancel = isActive && isUpcoming;

    const statusClass = isActive ? "success" : "secondary";
    const statusText = isActive ? "Activa" : "Cancelada";
    const statusIcon = isActive ? "check-circle" : "times-circle";

    // Debug: log de los estados calculados
    console.log(`🎯 MyEnrollments - Inscripción ${enrollment.id} - Estados:`, {
      enrollmentStatus: enrollment.status,
      isActive,
      isCancelled,
      isUpcoming,
      canCancel,
      activityId: activity.id,
      statusText,
    });

    return `
      <div class="col-md-6 mb-4">
        <div class="card h-100 border-0 shadow-sm enrollment-card ${
          isActive ? "" : "opacity-75"
        }">
          <div class="card-body p-4">
            <!-- Header con estado -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title text-primary mb-0 fw-bold">
                ${activity.name}
              </h5>
              <span class="badge bg-${statusClass} bg-opacity-10 text-${statusClass} border border-${statusClass} border-opacity-25">
                <i class="fas fa-${statusIcon} me-1"></i>
                ${statusText}
              </span>
            </div>

            <!-- Información de la actividad -->
            <div class="activity-info mb-3">
              <div class="row g-2 text-muted small">
                <div class="col-12">
                  <i class="fas fa-map-marker-alt me-2"></i>
                  ${activity.location}
                </div>
                <div class="col-12">
                  <i class="fas fa-calendar me-2"></i>
                  ${formattedStartDate} - ${formattedEndDate}
                </div>
                <div class="col-12">
                  <i class="fas fa-clock me-2"></i>
                  ${startTime} - ${endTime}
                </div>
                <div class="col-12">
                  <i class="fas fa-user me-2"></i>
                  Profesor: ${activity.teacher?.name || "N/A"}
                </div>
              </div>
            </div>

            <!-- Descripción -->
            <p class="card-text text-muted mb-3">
              ${this.truncateText(activity.description, 120)}
            </p>

            <!-- Información de inscripción -->
            <div class="enrollment-info mb-3 p-2 bg-light bg-opacity-50 rounded">
              <small class="text-muted">
                <i class="fas fa-calendar-plus me-1"></i>
                Inscrito el: <span class="fw-semibold">${enrollmentDate}</span>
              </small>
            </div>

            <!-- Acciones -->
            <div class="card-actions d-flex gap-2">
              <!-- Botón ver detalles -->
              <button type="button" class="btn btn-outline-primary btn-sm flex-fill btn-view-activity" data-activity-id="${
                activity.id
              }">
                <i class="fas fa-eye me-1"></i>
                Ver Detalles
              </button>

              <!-- Botón cancelar (solo si es activa y próxima) -->
              ${
                canCancel
                  ? `
                <button type="button" class="btn btn-outline-danger btn-sm btn-cancel-enrollment" data-activity-id="${activity.id}" data-enrollment-id="${enrollment.id}">
                  <i class="fas fa-times me-1"></i>
                  Cancelar
                </button>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Configurar event listeners para las inscripciones
   */
  setupEnrollmentEventListeners() {
    // Botones de ver detalles
    document.querySelectorAll(".btn-view-activity").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const button =
          e.currentTarget || e.target.closest(".btn-view-activity");
        const activityId = button.getAttribute("data-activity-id");
        console.log(`🔍 MyEnrollments - Ver detalles ActivityId:`, activityId);
        this.router.navigate(`/activity/${activityId}`);
      });
    });

    // Botones de cancelar inscripción
    document.querySelectorAll(".btn-cancel-enrollment").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button =
          e.currentTarget || e.target.closest(".btn-cancel-enrollment");
        const activityId = button.getAttribute("data-activity-id");
        console.log(`🔍 MyEnrollments - Cancelar ActivityId:`, activityId);

        if (!activityId || activityId === "null") {
          console.error("❌ MyEnrollments - ActivityId inválido:", activityId);
          this.app.alert.show("Error: ID de actividad inválido", "danger");
          return;
        }

        await this.handleCancelEnrollment(activityId);
      });
    });
  }

  /**
   * Manejar cancelación de inscripción
   */
  async handleCancelEnrollment(activityId) {
    try {
      // Mostrar confirmación
      if (
        !confirm(
          "¿Estás seguro de que quieres cancelar tu inscripción a esta actividad?\n\nEsta acción no se puede deshacer."
        )
      ) {
        return;
      }

      // Realizar cancelación
      this.app.loader.show("Cancelando inscripción...");

      await this.app.enrollmentsAPI.unenrollFromActivity(activityId);

      this.app.alert.show("Inscripción cancelada exitosamente", "success");

      // Recargar datos
      await this.loadInitialData();
      await this.filterAndRenderEnrollments();

      this.app.loader.hide();
    } catch (error) {
      console.error(
        "❌ MyEnrollmentsPage: Error cancelando inscripción:",
        error
      );
      const message =
        error.message ||
        "Error al cancelar la inscripción. Inténtalo de nuevo.";
      this.app.alert.show(message, "danger");
      this.app.loader.hide();
    }
  }

  /**
   * Renderizar paginación
   */
  renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    const totalPages = Math.ceil(
      this.filteredEnrollments.length / this.itemsPerPage
    );

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Botón anterior
    paginationHTML += `
      <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
        <button class="page-link" ${
          this.currentPage === 1 ? "disabled" : ""
        } data-page="${this.currentPage - 1}">
          <i class="fas fa-chevron-left"></i>
        </button>
      </li>
    `;

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        paginationHTML += `
          <li class="page-item ${i === this.currentPage ? "active" : ""}">
            <button class="page-link" data-page="${i}">${i}</button>
          </li>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += `
          <li class="page-item disabled">
            <span class="page-link">...</span>
          </li>
        `;
      }
    }

    // Botón siguiente
    paginationHTML += `
      <li class="page-item ${
        this.currentPage === totalPages ? "disabled" : ""
      }">
        <button class="page-link" ${
          this.currentPage === totalPages ? "disabled" : ""
        } data-page="${this.currentPage + 1}">
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // Event listeners para paginación
    paginationContainer.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const page = parseInt(e.target.getAttribute("data-page"));
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.filterAndRenderEnrollments();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters() {
    // Resetear filtros
    this.filters = {
      status: "",
      sort: "newest",
    };
    this.currentPage = 1;

    // Limpiar campos del formulario
    const statusFilter = document.getElementById("status-filter");
    const sortFilter = document.getElementById("sort-filter");

    if (statusFilter) statusFilter.value = "";
    if (sortFilter) sortFilter.value = "newest";

    // Recargar inscripciones
    this.filterAndRenderEnrollments();
  }

  /**
   * Utilidades
   */
  formatDate(dateString) {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  formatTime(dateString) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return new Date(dateString).toLocaleTimeString("es-ES", options);
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  showLoading() {
    const loading = document.getElementById("loading-enrollments");
    const list = document.getElementById("enrollments-list");

    if (loading) loading.style.display = "block";
    if (list) list.style.display = "none";
  }

  hideLoading() {
    const loading = document.getElementById("loading-enrollments");
    const list = document.getElementById("enrollments-list");

    if (loading) loading.style.display = "none";
    if (list) list.style.display = "block";
  }

  showError(message) {
    this.hideLoading();
    this.app.alert.show(message, "danger");
  }
}
