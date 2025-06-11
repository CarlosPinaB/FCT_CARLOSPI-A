/**
 * Página de Actividades - Lista Pública
 * Vista detallada de todas las actividades disponibles
 */

export class ActivitiesPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;

    // Estado de la página
    this.activities = [];
    this.categories = [];
    this.userEnrollments = []; // Nueva: inscripciones del usuario
    this.filteredActivities = [];
    this.loading = false;
    this.filters = {
      category_id: "",
      status: "active", // 'active', 'all', 'finished'
      search: "", // búsqueda por texto
      sort: "start_date",
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
                  <i class="fas fa-calendar-alt me-3"></i>
                  Actividades Disponibles
                </h1>
                <p class="text-muted mb-0">
                  Descubre todas las actividades extraescolares disponibles
                </p>
              </div>
              <div class="text-end">
                <span id="activities-count" class="badge bg-primary fs-6">
                  <i class="fas fa-list me-1"></i>
                  <span id="count-number">0</span> actividades
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <!-- Barra de búsqueda -->
                <div class="row mb-3">
                  <div class="col-12">
                    <div class="position-relative">
                      <input 
                        type="text" 
                        class="form-control form-control-lg" 
                        id="search-input"
                        placeholder="Buscar actividades por nombre o descripción..."
                        style="padding-left: 45px;">
                      <i class="fas fa-search position-absolute text-muted" 
                         style="left: 15px; top: 50%; transform: translateY(-50%);"></i>
                    </div>
                  </div>
                </div>
                
                <!-- Filtros adicionales -->
                <div class="row g-3 justify-content-center">
                  <!-- Filtro por categoría -->
                  <div class="col-lg-3 col-md-4">
                    <select class="form-select" id="category-filter">
                      <option value="">Todas las categorías</option>
                      <!-- Las categorías se cargarán dinámicamente -->
                    </select>
                  </div>
                  
                  <!-- Filtro por estado -->
                  <div class="col-lg-3 col-md-4">
                    <select class="form-select" id="status-filter">
                      <option value="active">Solo activas</option>
                      <option value="all">Todas</option>
                      <option value="finished">Solo finalizadas</option>
                    </select>
                  </div>
                  
                  <!-- Ordenamiento -->
                  <div class="col-lg-4 col-md-3">
                    <select class="form-select" id="sort-filter">
                      <option value="start_date">Próximas a empezar</option>
                      <option value="title">Por título A-Z</option>
                      <option value="category">Por categoría</option>
                      <option value="created_at">Más recientes</option>
                    </select>
                  </div>
                  
                  <!-- Botón limpiar filtros -->
                  <div class="col-lg-2 col-md-1">
                    <button type="button" class="btn btn-outline-secondary w-100" id="clear-filters" title="Limpiar filtros">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div id="loading-activities" class="text-center py-5" style="display: none;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando actividades...</span>
          </div>
          <p class="text-muted mt-3">Cargando actividades...</p>
        </div>

        <!-- Lista de actividades -->
        <div id="activities-list" class="row">
          <!-- Las actividades se cargarán aquí dinámicamente -->
        </div>

        <!-- Empty state -->
        <div id="empty-state" class="text-center py-5" style="display: none;">
          <i class="fas fa-search display-1 text-muted mb-3"></i>
          <h3 class="text-muted">No se encontraron actividades</h3>
          <p class="text-muted">
            Intenta ajustar los filtros o <button type="button" class="btn btn-link p-0" id="clear-all-filters">limpiar la búsqueda</button>
          </p>
        </div>

        <!-- Paginación -->
        <div class="row mt-4">
          <div class="col-12">
            <nav aria-label="Paginación de actividades">
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
      console.log("🎯 ActivitiesPage: Inicializando página de actividades...");

      // Mostrar loading
      this.showLoading();

      // Cargar datos iniciales
      await this.loadInitialData();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar actividades
      await this.filterAndRenderActivities();

      console.log("✅ ActivitiesPage: Página inicializada correctamente");
    } catch (error) {
      console.error("❌ ActivitiesPage: Error inicializando página:", error);
      this.showError("Error cargando las actividades");
    }
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    try {
      console.log("🔍 ActivitiesPage: Cargando datos iniciales...");

      // Preparar promesas para cargar datos
      const promises = [
        this.app.activitiesAPI.getPublicActivities(),
        this.app.categoriesAPI.getCategories(),
      ];

      // Si el usuario está autenticado como alumno, cargar sus inscripciones
      if (
        this.app.auth.isAuthenticated() &&
        this.app.auth.getCurrentUser()?.role === "alumno"
      ) {
        promises.push(this.app.enrollmentsAPI.getMyEnrollments());
      }

      // Cargar datos en paralelo
      const responses = await Promise.all(promises);

      this.activities = responses[0] || [];
      this.categories = responses[1] || [];
      this.userEnrollments = responses[2] || []; // Solo si es alumno

      // Cargar categorías en el select
      this.loadCategoriesSelect();

      console.log(
        `📊 ActivitiesPage: ${this.activities.length} actividades, ${this.categories.length} categorías y ${this.userEnrollments.length} inscripciones cargadas`
      );
    } catch (error) {
      console.error(
        "❌ ActivitiesPage: Error cargando datos iniciales:",
        error
      );
      throw error;
    }
  }

  /**
   * Cargar categorías en el select
   */
  loadCategoriesSelect() {
    const categorySelect = document.getElementById("category-filter");
    if (!categorySelect) return;

    // Limpiar opciones existentes (excepto la primera)
    categorySelect.innerHTML = '<option value="">Todas las categorías</option>';

    // Agregar categorías
    this.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Campo de búsqueda
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      // Debounce para evitar demasiadas búsquedas mientras se escribe
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filters.search = e.target.value;
          this.currentPage = 1;
          this.filterAndRenderActivities();
        }, 300); // Esperar 300ms después de que el usuario deje de escribir
      });

      // También buscar al presionar Enter
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          clearTimeout(searchTimeout);
          this.filters.search = e.target.value;
          this.currentPage = 1;
          this.filterAndRenderActivities();
        }
      });
    }

    // Filtro por categoría
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.filters.category_id = e.target.value;
        this.currentPage = 1;
        this.filterAndRenderActivities();
      });
    }

    // Filtro por estado
    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filters.status = e.target.value;
        this.currentPage = 1;
        this.filterAndRenderActivities();
      });
    }

    // Ordenamiento
    const sortFilter = document.getElementById("sort-filter");
    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        this.filters.sort = e.target.value;
        this.currentPage = 1;
        this.filterAndRenderActivities();
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
   * Filtrar y renderizar actividades
   */
  async filterAndRenderActivities() {
    try {
      this.showLoading();

      // Aplicar filtros
      this.filteredActivities = this.applyFilters(this.activities);

      // Aplicar ordenamiento
      this.filteredActivities = this.applySorting(this.filteredActivities);

      // Actualizar contador
      this.updateActivitiesCount();

      // Renderizar actividades de la página actual
      this.renderActivitiesList();

      // Renderizar paginación
      this.renderPagination();

      this.hideLoading();
    } catch (error) {
      console.error("❌ ActivitiesPage: Error filtrando actividades:", error);
      this.showError("Error aplicando filtros");
    }
  }

  /**
   * Aplicar filtros a las actividades
   */
  applyFilters(activities) {
    let filtered = [...activities];

    // Filtro por texto de búsqueda
    if (this.filters.search && this.filters.search.trim()) {
      const searchTerm = this.filters.search.toLowerCase().trim();
      filtered = filtered.filter((activity) => {
        const name = activity.name ? activity.name.toLowerCase() : "";
        const description = activity.description
          ? activity.description.toLowerCase()
          : "";
        const teacher = activity.teacher?.name
          ? activity.teacher.name.toLowerCase()
          : "";
        const location = activity.location
          ? activity.location.toLowerCase()
          : "";

        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          teacher.includes(searchTerm) ||
          location.includes(searchTerm)
        );
      });
    }

    // Filtro por categoría
    if (this.filters.category_id) {
      filtered = filtered.filter(
        (activity) => activity.category_id == this.filters.category_id
      );
    }

    // Filtro por estado (activas, todas, finalizadas)
    const now = new Date();
    filtered = filtered.filter((activity) => {
      const endDate = new Date(activity.end_date);
      const isPastActivity = endDate < now;

      switch (this.filters.status) {
        case "active":
          // Solo actividades que no han terminado Y están activas
          return !isPastActivity && activity.is_active;

        case "finished":
          // Solo actividades que ya terminaron
          return isPastActivity;

        case "all":
        default:
          // Todas las actividades activas O recién finalizadas (últimos 30 días)
          if (activity.is_active) return true;

          const daysSinceEnd = (now - endDate) / (1000 * 60 * 60 * 24);
          return daysSinceEnd <= 30; // Mostrar finalizadas de los últimos 30 días
      }
    });

    return filtered;
  }

  /**
   * Aplicar ordenamiento
   */
  applySorting(activities) {
    const sorted = [...activities];

    switch (this.filters.sort) {
      case "title":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case "category":
        return sorted.sort((a, b) => {
          const categoryA = this.getCategoryName(a.category_id);
          const categoryB = this.getCategoryName(b.category_id);
          return categoryA.localeCompare(categoryB);
        });

      case "created_at":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

      case "start_date":
      default:
        return sorted.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );
    }
  }

  /**
   * Renderizar lista de actividades
   */
  renderActivitiesList() {
    const listContainer = document.getElementById("activities-list");
    const emptyState = document.getElementById("empty-state");

    if (!listContainer) return;

    // Calcular actividades para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const activitiesToShow = this.filteredActivities.slice(
      startIndex,
      endIndex
    );

    if (activitiesToShow.length === 0) {
      listContainer.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    // Renderizar actividades
    listContainer.innerHTML = `
      <div class="col-12">
        ${activitiesToShow
          .map((activity) => this.renderActivityItem(activity))
          .join("")}
      </div>
    `;

    // Configurar event listeners para las actividades
    this.setupActivityEventListeners();
  }

  /**
   * Renderizar un item de actividad (formato lista detallada)
   */
  renderActivityItem(activity) {
    // Debug: log de la actividad que se está renderizando
    console.log(`🎨 Renderizando actividad:`, activity);

    const categoryName = this.getCategoryName(activity.category_id);
    const formattedStartDate = this.formatDate(activity.start_date);
    const formattedEndDate = this.formatDate(activity.end_date);
    const startTime = this.formatTime(activity.start_date);
    const endTime = this.formatTime(activity.end_date);
    const participantsText = activity.current_participants
      ? `${activity.current_participants}/${activity.max_participants}`
      : `0/${activity.max_participants}`;

    // Verificar estado de la actividad
    const now = new Date();
    const endDate = new Date(activity.end_date);
    const startDate = new Date(activity.start_date);

    const isPastActivity = endDate < now;
    const isUpcoming = startDate > now;
    const isInProgress = startDate <= now && endDate >= now;

    const hasAvailablePlaces =
      !activity.current_participants ||
      activity.current_participants < activity.max_participants;

    // Verificar si el usuario ya está inscrito en esta actividad
    const isEnrolled = this.isUserEnrolledInActivity(activity.id);

    const canEnroll =
      this.app.auth.isAuthenticated() &&
      this.app.auth.getCurrentUser()?.role === "alumno" &&
      hasAvailablePlaces &&
      !isEnrolled &&
      !isPastActivity;

    const canUnenroll =
      this.app.auth.isAuthenticated() &&
      this.app.auth.getCurrentUser()?.role === "alumno" &&
      isEnrolled &&
      !isPastActivity;

    // Debug: log de los estados calculados
    console.log(`🎯 Actividad ${activity.id} - Estados:`, {
      isPastActivity,
      isUpcoming,
      isInProgress,
      hasAvailablePlaces,
      isEnrolled,
      canEnroll,
      canUnenroll,
      activityId: activity.id,
      currentUser: this.app.auth.getCurrentUser()?.role,
    });

    return `
      <div class="activity-item card border-0 shadow-sm mb-3" data-activity-id="${
        activity.id
      }">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <!-- Icono de categoría -->
            <div class="col-lg-2 col-md-3 mb-3 mb-md-0">
              <div class="activity-icon-container bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center" style="height: 80px;">
                <i class="fas ${this.getCategoryIcon(
                  activity.category_id
                )} text-primary fa-2x"></i>
              </div>
            </div>
            
            <!-- Información principal -->
            <div class="col-lg-7 col-md-6">
              <div class="activity-info">
                <!-- Título y estado -->
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4 class="activity-title mb-0 text-primary fw-bold">
                    ${activity.name}
                  </h4>
                  <div class="activity-status d-flex align-items-center gap-2">
                    <span class="badge ${
                      isPastActivity
                        ? "bg-secondary"
                        : hasAvailablePlaces
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }">
                      ${
                        isPastActivity
                          ? "Finalizada"
                          : hasAvailablePlaces
                          ? "Disponible"
                          : "Lleno"
                      }
                    </span>
                  </div>
                </div>
                
                <!-- Detalles básicos -->
                <div class="activity-details mb-2">
                  <div class="row g-2 text-muted small">
                    <div class="col-auto">
                      <i class="fas fa-map-marker-alt me-1"></i>
                      ${activity.location}
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-calendar me-1"></i>
                      ${formattedStartDate} - ${formattedEndDate}
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-clock me-1"></i>
                      ${startTime} - ${endTime}
                    </div>
                  </div>
                </div>
                
                <!-- Descripción -->
                <p class="activity-description text-muted mb-2">
                  ${this.truncateText(activity.description, 150)}
                </p>
                
                <!-- Tags -->
                <div class="activity-tags d-flex align-items-center gap-2">
                  <span class="badge bg-primary bg-opacity-10 text-primary">
                    <i class="fas fa-tag me-1"></i>
                    ${categoryName}
                  </span>
                  <span class="badge bg-info bg-opacity-10 text-info">
                    <i class="fas fa-users me-1"></i>
                    ${participantsText} participantes
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Acciones -->
            <div class="col-lg-3 col-md-3 text-end">
              <div class="activity-actions d-flex flex-column gap-2">
                <!-- Botón ver más -->
                <button type="button" class="btn btn-outline-primary btn-detail" data-activity-id="${
                  activity.id
                }">
                  <i class="fas fa-eye me-2"></i>
                  Ver Detalles
                </button>
                
                <!-- Botón inscribirse (solo para alumnos no inscritos) -->
                ${
                  canEnroll
                    ? `
                  <button type="button" class="btn btn-success btn-enroll" data-activity-id="${activity.id}">
                    <i class="fas fa-user-plus me-2"></i>
                    Inscribirse
                  </button>
                `
                    : ""
                }
                
                <!-- Botón cancelar inscripción (solo para alumnos inscritos) -->
                ${
                  canUnenroll
                    ? `
                  <button type="button" class="btn btn-outline-danger btn-unenroll" data-activity-id="${activity.id}">
                    <i class="fas fa-user-times me-2"></i>
                    Cancelar Inscripción
                  </button>
                `
                    : ""
                }
                
                <!-- Badge de inscrito -->
                ${
                  isEnrolled
                    ? `
                  <div class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-flex align-items-center justify-content-center py-2">
                    <i class="fas fa-check-circle me-1"></i>
                    ¡Inscrito!
                  </div>
                `
                    : ""
                }
                
                <!-- Información adicional -->
                <div class="activity-meta text-muted small text-center mt-2">
                  <div>Creada por:</div>
                  <div class="fw-semibold">${
                    activity.teacher?.name || "N/A"
                  }</div>
                  ${
                    isPastActivity
                      ? `
                    <div class="mt-1">
                      <small class="text-secondary">
                        <i class="fas fa-flag-checkered me-1"></i>
                        Actividad finalizada
                      </small>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Configurar event listeners para las actividades
   */
  setupActivityEventListeners() {
    // Botones de ver detalles
    document.querySelectorAll(".btn-detail").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const button = e.currentTarget || e.target.closest(".btn-detail");
        const activityId = button.getAttribute("data-activity-id");
        console.log(`🔍 Ver detalles - ActivityId capturado:`, activityId);
        this.router.navigate(`/activity/${activityId}`);
      });
    });

    // Botones de inscripción
    document.querySelectorAll(".btn-enroll").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget || e.target.closest(".btn-enroll");
        const activityId = button.getAttribute("data-activity-id");
        console.log(`🔍 Inscripción - ActivityId capturado:`, activityId);

        if (!activityId || activityId === "null") {
          console.error("❌ ActivityId inválido:", activityId);
          this.app.alert.show("Error: ID de actividad inválido", "danger");
          return;
        }

        await this.handleEnrollment(activityId);
      });
    });

    // Botones de cancelar inscripción
    document.querySelectorAll(".btn-unenroll").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget || e.target.closest(".btn-unenroll");
        const activityId = button.getAttribute("data-activity-id");
        console.log(`🔍 Cancelar - ActivityId capturado:`, activityId);

        if (!activityId || activityId === "null") {
          console.error("❌ ActivityId inválido:", activityId);
          this.app.alert.show("Error: ID de actividad inválido", "danger");
          return;
        }

        await this.handleUnenrollment(activityId);
      });
    });
  }

  /**
   * Verificar si el usuario está inscrito en una actividad
   */
  isUserEnrolledInActivity(activityId) {
    // Debug: log de las inscripciones para investigar
    console.log(`🔍 Verificando inscripción para actividad ${activityId}`);
    console.log("📋 Inscripciones del usuario:", this.userEnrollments);

    const targetActivityId = parseInt(activityId);

    const isEnrolled = this.userEnrollments.some((enrollment) => {
      console.log(`🔍 Checking enrollment:`, enrollment);

      // Verificar múltiples formas de obtener el activity ID
      let enrollmentActivityId = null;

      if (enrollment.activity && enrollment.activity.id) {
        enrollmentActivityId = parseInt(enrollment.activity.id);
      } else if (enrollment.activity_id) {
        enrollmentActivityId = parseInt(enrollment.activity_id);
      }

      const hasMatchingActivity = enrollmentActivityId === targetActivityId;
      const isValidStatus =
        enrollment.status === "active" || enrollment.status === "approved";

      console.log(`🔍 Enrollment details:`, {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        activityId: enrollmentActivityId,
        targetActivityId: targetActivityId,
        hasMatchingActivity,
        isValidStatus,
      });

      const matches = hasMatchingActivity && isValidStatus;
      console.log(`✅ Match for activity ${activityId}:`, matches);
      return matches;
    });

    console.log(`🎯 Resultado final para actividad ${activityId}:`, isEnrolled);
    return isEnrolled;
  }

  /**
   * Manejar inscripción a actividad
   */
  async handleEnrollment(activityId) {
    try {
      if (!this.app.auth.isAuthenticated()) {
        this.app.alert.show("Debes iniciar sesión para inscribirte", "warning");
        this.router.navigate("/login");
        return;
      }

      if (this.app.auth.getCurrentUser()?.role !== "alumno") {
        this.app.alert.show(
          "Solo los alumnos pueden inscribirse a actividades",
          "warning"
        );
        return;
      }

      // Mostrar confirmación
      if (
        !confirm("¿Estás seguro de que quieres inscribirte a esta actividad?")
      ) {
        return;
      }

      // Realizar inscripción
      this.app.loader.show("Inscribiendo...");
      await this.app.enrollmentsAPI.enrollInActivity(activityId);

      this.app.alert.show("¡Te has inscrito exitosamente!", "success");

      // Recargar actividades para actualizar contadores
      await this.loadInitialData();
      await this.filterAndRenderActivities();

      this.app.loader.hide();
    } catch (error) {
      console.error("❌ ActivitiesPage: Error en inscripción:", error);
      const message =
        error.message || "Error al inscribirse. Inténtalo de nuevo.";
      this.app.alert.show(message, "danger");
      this.app.loader.hide();
    }
  }

  /**
   * Manejar cancelación de inscripción
   */
  async handleUnenrollment(activityId) {
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

      // Recargar actividades para actualizar contadores
      await this.loadInitialData();
      await this.filterAndRenderActivities();

      this.app.loader.hide();
    } catch (error) {
      console.error("❌ ActivitiesPage: Error cancelando inscripción:", error);
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
      this.filteredActivities.length / this.itemsPerPage
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
          this.filterAndRenderActivities();
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
      category_id: "",
      status: "active",
      search: "",
      sort: "start_date",
    };
    this.currentPage = 1;

    // Limpiar campos del formulario
    const searchInput = document.getElementById("search-input");
    const categoryFilter = document.getElementById("category-filter");
    const statusFilter = document.getElementById("status-filter");
    const sortFilter = document.getElementById("sort-filter");

    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (statusFilter) statusFilter.value = "active";
    if (sortFilter) sortFilter.value = "start_date";

    // Recargar actividades
    this.filterAndRenderActivities();
  }

  /**
   * Actualizar contador de actividades
   */
  updateActivitiesCount() {
    const countElement = document.getElementById("count-number");
    if (countElement) {
      countElement.textContent = this.filteredActivities.length;
    }
  }

  /**
   * Utilidades
   */
  getCategoryName(categoryId) {
    const category = this.categories.find((c) => c.id == categoryId);
    return category ? category.name : "Sin categoría";
  }

  getCategoryIcon(categoryId) {
    const category = this.categories.find((c) => c.id == categoryId);
    if (!category) return "fa-calendar-alt";

    // Mapeo de iconos por nombre de categoría
    const iconMap = {
      deportes: "fa-running",
      arte: "fa-palette",
      música: "fa-music",
      tecnología: "fa-laptop-code",
      ciencia: "fa-flask",
      idiomas: "fa-language",
      teatro: "fa-theater-masks",
      danza: "fa-dancer",
      lectura: "fa-book",
      cocina: "fa-utensils",
      manualidades: "fa-scissors",
      robótica: "fa-robot",
    };

    const categoryName = category.name.toLowerCase();

    // Buscar coincidencia exacta o parcial
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.includes(key)) {
        return icon;
      }
    }

    // Icono por defecto
    return "fa-calendar-alt";
  }

  formatDate(dateString) {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  formatTime(dateString) {
    // Extraer hora directamente del string sin conversión de zona horaria
    const date = dateString.includes("T")
      ? dateString.split("T")[1]
      : dateString.split(" ")[1];
    if (date) {
      const timePart = date.split(":");
      if (timePart.length >= 2) {
        return `${timePart[0]}:${timePart[1]}`;
      }
    }
    // Fallback si no se puede extraer
    return dateString;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  showLoading() {
    const loading = document.getElementById("loading-activities");
    const list = document.getElementById("activities-list");

    if (loading) loading.style.display = "block";
    if (list) list.style.display = "none";
  }

  hideLoading() {
    const loading = document.getElementById("loading-activities");
    const list = document.getElementById("activities-list");

    if (loading) loading.style.display = "none";
    if (list) list.style.display = "block";
  }

  showError(message) {
    this.hideLoading();
    this.app.alert.show(message, "danger");
  }
}
