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
    this.filteredActivities = [];
    this.loading = false;
    this.filters = {
      category_id: "",
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
                <div class="row g-3 justify-content-center">
                  <!-- Filtro por categoría -->
                  <div class="col-lg-4 col-md-5">
                    <select class="form-select" id="category-filter">
                      <option value="">Todas las categorías</option>
                      <!-- Las categorías se cargarán dinámicamente -->
                    </select>
                  </div>
                  
                  <!-- Ordenamiento -->
                  <div class="col-lg-4 col-md-5">
                    <select class="form-select" id="sort-filter">
                      <option value="start_date">Próximas a empezar</option>
                      <option value="title">Por título A-Z</option>
                      <option value="category">Por categoría</option>
                      <option value="created_at">Más recientes</option>
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
      // Debug: verificar qué está disponible en app
      console.log("🔍 Debug app object:", this.app);
      console.log("🔍 Debug categoriesAPI:", this.app.categoriesAPI);
      console.log(
        "🔍 Debug getCategories method:",
        this.app.categoriesAPI?.getCategories
      );

      // Cargar actividades y categorías en paralelo
      const [activitiesResponse, categoriesResponse] = await Promise.all([
        this.app.activitiesAPI.getPublicActivities(),
        this.app.categoriesAPI.getCategories(),
      ]);

      this.activities = activitiesResponse || [];
      this.categories = categoriesResponse || [];

      // Cargar categorías en el select
      this.loadCategoriesSelect();

      console.log(
        `📊 ActivitiesPage: ${this.activities.length} actividades y ${this.categories.length} categorías cargadas`
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
    // Filtro por categoría
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.filters.category_id = e.target.value;
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

    // Filtro por categoría
    if (this.filters.category_id) {
      filtered = filtered.filter(
        (activity) => activity.category_id == this.filters.category_id
      );
    }

    // Solo actividades activas
    filtered = filtered.filter((activity) => activity.is_active);

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
    const categoryName = this.getCategoryName(activity.category_id);
    const formattedStartDate = this.formatDate(activity.start_date);
    const formattedEndDate = this.formatDate(activity.end_date);
    const startTime = this.formatTime(activity.start_date);
    const endTime = this.formatTime(activity.end_date);
    const participantsText = activity.current_participants
      ? `${activity.current_participants}/${activity.max_participants}`
      : `0/${activity.max_participants}`;

    const isAvailable =
      !activity.current_participants ||
      activity.current_participants < activity.max_participants;
    const canEnroll =
      this.app.auth.isAuthenticated() &&
      this.app.auth.getCurrentUser()?.role === "alumno" &&
      isAvailable;

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
                      isAvailable ? "bg-success" : "bg-warning text-dark"
                    }">
                      ${isAvailable ? "Disponible" : "Lleno"}
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
                
                <!-- Botón inscribirse (solo para alumnos) -->
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
                
                <!-- Información adicional -->
                <div class="activity-meta text-muted small text-center mt-2">
                  <div>Creada por:</div>
                  <div class="fw-semibold">${
                    activity.teacher?.name || "N/A"
                  }</div>
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
        const activityId = e.target.getAttribute("data-activity-id");
        this.router.navigate(`/activity/${activityId}`);
      });
    });

    // Botones de inscripción
    document.querySelectorAll(".btn-enroll").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const activityId = e.target.getAttribute("data-activity-id");
        await this.handleEnrollment(activityId);
      });
    });
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
      await this.app.enrollmentsAPI.enroll(activityId);

      this.app.alert.show("¡Te has inscrito exitosamente!", "success");

      // Recargar actividades para actualizar contadores
      await this.loadInitialData();
      await this.filterAndRenderActivities();
    } catch (error) {
      console.error("❌ ActivitiesPage: Error en inscripción:", error);
      const message =
        error.message || "Error al inscribirse. Inténtalo de nuevo.";
      this.app.alert.show(message, "danger");
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
      sort: "start_date",
    };
    this.currentPage = 1;

    // Limpiar campos del formulario
    const categoryFilter = document.getElementById("category-filter");
    const sortFilter = document.getElementById("sort-filter");

    if (categoryFilter) categoryFilter.value = "";
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
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return new Date(dateString).toLocaleTimeString("es-ES", options);
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
