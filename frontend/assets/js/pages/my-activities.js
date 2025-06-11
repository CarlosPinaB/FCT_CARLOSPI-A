/**
 * Página de Mis Actividades - Gestión de actividades del profesor
 */

export class MyActivitiesPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.activities = [];
    this.filteredActivities = [];
    this.categories = [];
    this.currentFilter = "all";
    this.currentSort = "newest";
    this.searchQuery = "";
  }

  /**
   * Renderizar la página
   */
  async render() {
    return `
      <div class="container py-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#" data-route="/dashboard" class="text-decoration-none">
                    <i class="fas fa-home me-1"></i>
                    Dashboard
                  </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  Mis Actividades
                </li>
              </ol>
            </nav>
            
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-6 fw-bold text-primary mb-2">
                  <i class="fas fa-tasks me-3"></i>
                  Mis Actividades
                </h1>
                <p class="text-muted mb-0">Gestiona y administra tus actividades extraescolares</p>
              </div>
              <div>
                <a href="#" data-route="/activity/create" class="btn btn-primary btn-lg">
                  <i class="fas fa-plus me-2"></i>
                  Nueva Actividad
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div id="loading-activities" class="text-center py-5" style="display: none;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando actividades...</span>
          </div>
          <p class="text-muted mt-3">Cargando tus actividades...</p>
        </div>

        <!-- Filtros y controles -->
        <div class="row mb-4" id="controls-section" style="display: none;">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="row g-3 align-items-center">
                  <!-- Búsqueda -->
                  <div class="col-md-4">
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-search"></i>
                      </span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="search-input"
                        placeholder="Buscar actividades..."
                      >
                    </div>
                  </div>

                  <!-- Filtro por estado -->
                  <div class="col-md-3">
                    <select class="form-select" id="filter-status">
                      <option value="all">Todas las actividades</option>
                      <option value="active">Solo activas</option>
                      <option value="inactive">Solo inactivas</option>
                    </select>
                  </div>

                  <!-- Ordenar -->
                  <div class="col-md-3">
                    <select class="form-select" id="sort-select">
                      <option value="newest">Más recientes</option>
                      <option value="oldest">Más antiguas</option>
                      <option value="name">Por nombre</option>
                      <option value="participants">Por participantes</option>
                      <option value="date">Por fecha de inicio</option>
                    </select>
                  </div>

                  <!-- Contador -->
                  <div class="col-md-2 text-end">
                    <span class="badge bg-primary fs-6" id="activities-count">0 actividades</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de actividades -->
        <div id="activities-container">
          <!-- Las actividades se cargarán aquí -->
        </div>

        <!-- Estado vacío -->
        <div id="empty-state" class="text-center py-5" style="display: none;">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-5">
                  <i class="fas fa-calendar-plus text-muted mb-4" style="font-size: 4rem;"></i>
                  <h3 class="text-muted mb-3">No tienes actividades</h3>
                  <p class="text-muted mb-4">
                    Comienza creando tu primera actividad extraescolar para que los estudiantes puedan inscribirse.
                  </p>
                  <a href="#" data-route="/activity/create" class="btn btn-primary btn-lg">
                    <i class="fas fa-plus me-2"></i>
                    Crear Primera Actividad
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                Confirmar eliminación
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar la actividad <strong id="delete-activity-name"></strong>?</p>
              <div class="alert alert-warning">
                <i class="fas fa-info-circle me-2"></i>
                Esta acción no se puede deshacer. Todos los participantes inscritos serán desinscritos automáticamente.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="confirm-delete">
                <i class="fas fa-trash me-2"></i>
                Eliminar Actividad
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar la página
   */
  async init() {
    try {
      console.log("🎯 MyActivitiesPage: Inicializando página...");

      // Verificar permisos
      if (
        !this.app.auth.isAuthenticated() ||
        this.app.auth.getCurrentUser()?.role !== "profesor"
      ) {
        this.router.navigate("/login");
        return;
      }

      // Mostrar loading
      this.showLoading();

      // Cargar datos
      await this.loadData();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar actividades
      this.renderActivities();

      // Ocultar loading y mostrar controles
      this.hideLoading();

      console.log("✅ MyActivitiesPage: Página inicializada correctamente");
    } catch (error) {
      console.error("❌ MyActivitiesPage: Error inicializando página:", error);
      this.showError("Error cargando tus actividades");
    }
  }

  /**
   * Cargar datos necesarios
   */
  async loadData() {
    try {
      // Cargar actividades del profesor
      this.activities = await this.app.activitiesAPI.getMyActivities();
      this.filteredActivities = [...this.activities];

      // Cargar categorías
      this.categories = await this.app.categoriesAPI.getCategories();

      console.log(
        `📊 MyActivitiesPage: ${this.activities.length} actividades cargadas`
      );
    } catch (error) {
      console.error("❌ MyActivitiesPage: Error cargando datos:", error);
      throw error;
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Filtro por estado
    const filterStatus = document.getElementById("filter-status");
    if (filterStatus) {
      filterStatus.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.applyFilters();
      });
    }

    // Ordenamiento
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.applySorting();
        this.renderActivities();
      });
    }

    // Modal de eliminación
    const deleteModal = document.getElementById("deleteModal");
    const confirmDelete = document.getElementById("confirm-delete");

    if (confirmDelete) {
      confirmDelete.addEventListener("click", () => {
        this.handleDeleteConfirm();
      });
    }
  }

  /**
   * Aplicar filtros
   */
  applyFilters() {
    this.filteredActivities = this.activities.filter((activity) => {
      // Filtro por búsqueda
      const matchesSearch =
        !this.searchQuery ||
        activity.name.toLowerCase().includes(this.searchQuery) ||
        activity.description.toLowerCase().includes(this.searchQuery) ||
        activity.location.toLowerCase().includes(this.searchQuery);

      // Filtro por estado
      let matchesStatus = true;
      if (this.currentFilter === "active") {
        matchesStatus = activity.is_active;
      } else if (this.currentFilter === "inactive") {
        matchesStatus = !activity.is_active;
      }

      return matchesSearch && matchesStatus;
    });

    this.applySorting();
    this.renderActivities();
  }

  /**
   * Aplicar ordenamiento
   */
  applySorting() {
    switch (this.currentSort) {
      case "newest":
        this.filteredActivities.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "oldest":
        this.filteredActivities.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case "name":
        this.filteredActivities.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "participants":
        this.filteredActivities.sort(
          (a, b) =>
            (b.current_participants || 0) - (a.current_participants || 0)
        );
        break;
      case "date":
        this.filteredActivities.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );
        break;
    }
  }

  /**
   * Renderizar lista de actividades
   */
  renderActivities() {
    const container = document.getElementById("activities-container");
    const emptyState = document.getElementById("empty-state");
    const controlsSection = document.getElementById("controls-section");
    const activitiesCount = document.getElementById("activities-count");

    if (!container) return;

    // Actualizar contador
    if (activitiesCount) {
      const count = this.filteredActivities.length;
      activitiesCount.textContent = `${count} actividad${
        count !== 1 ? "es" : ""
      }`;
    }

    // Mostrar/ocultar controles y estado vacío
    if (this.activities.length === 0) {
      // No hay actividades en absoluto
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      if (controlsSection) controlsSection.style.display = "none";
      return;
    } else {
      if (emptyState) emptyState.style.display = "none";
      if (controlsSection) controlsSection.style.display = "block";
    }

    // Renderizar actividades filtradas
    if (this.filteredActivities.length === 0) {
      container.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-search text-muted mb-3" style="font-size: 2rem;"></i>
                <h5 class="text-muted mb-2">No se encontraron actividades</h5>
                <p class="text-muted mb-3">
                  Prueba ajustando los filtros o la búsqueda para ver más resultados.
                </p>
                <button class="btn btn-outline-primary" onclick="this.clearFilters()">
                  <i class="fas fa-times me-2"></i>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Renderizar actividades
    const activitiesHTML = this.filteredActivities
      .map((activity) => this.renderActivityCard(activity))
      .join("");

    container.innerHTML = `
      <div class="row g-4">
        ${activitiesHTML}
      </div>
    `;

    // Agregar event listeners a las tarjetas
    this.setupActivityCardListeners();
  }

  /**
   * Renderizar tarjeta de actividad
   */
  renderActivityCard(activity) {
    const categoryName = this.getCategoryName(activity.category_id);
    const categoryIcon = this.getCategoryIcon(activity.category_id);
    const statusBadge = activity.is_active
      ? '<span class="badge bg-success">Activa</span>'
      : '<span class="badge bg-secondary">Inactiva</span>';

    const participantsCount = activity.current_participants || 0;
    const maxParticipants = activity.max_participants || 0;
    const participantsPercentage =
      maxParticipants > 0 ? (participantsCount / maxParticipants) * 100 : 0;

    const startDate = this.formatDate(activity.start_date);
    const endDate = this.formatDate(activity.end_date);
    const isUpcoming = new Date(activity.start_date) > new Date();
    const isPast = new Date(activity.end_date) < new Date();

    return `
      <div class="col-lg-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100 activity-card" data-activity-id="${
          activity.id
        }">
          <div class="card-header bg-white border-0 pb-0">
            <div class="d-flex justify-content-between align-items-start">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fas ${categoryIcon} text-primary" style="font-size: 1.5rem;"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-1">${activity.name}</h6>
                  <small class="text-muted">
                    <i class="fas fa-tag me-1"></i>
                    ${categoryName}
                  </small>
                </div>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" data-route="/activity/${
                      activity.id
                    }">
                      <i class="fas fa-eye me-2"></i>Ver detalles
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" data-route="/activity/edit/${
                      activity.id
                    }">
                      <i class="fas fa-edit me-2"></i>Editar
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" data-action="participants" data-activity-id="${
                      activity.id
                    }">
                      <i class="fas fa-users me-2"></i>Ver participantes
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" data-action="toggle-status" data-activity-id="${
                      activity.id
                    }">
                      <i class="fas fa-${
                        activity.is_active ? "pause" : "play"
                      } me-2"></i>
                      ${activity.is_active ? "Desactivar" : "Activar"}
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" data-action="delete" data-activity-id="${
                      activity.id
                    }">
                      <i class="fas fa-trash me-2"></i>Eliminar
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card-body">
            <!-- Estado y fecha -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              ${statusBadge}
              <small class="text-muted">
                ${
                  isPast
                    ? "🔒 Finalizada"
                    : isUpcoming
                    ? "⏰ Próxima"
                    : "🔄 En curso"
                }
              </small>
            </div>

            <!-- Descripción -->
            <p class="text-muted small mb-3">
              ${this.truncateText(activity.description, 100)}
            </p>

            <!-- Información clave -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <small class="text-muted">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  ${activity.location}
                </small>
              </div>
              <div class="col-12">
                <small class="text-muted">
                  <i class="fas fa-calendar me-1"></i>
                  ${startDate} - ${endDate}
                </small>
              </div>
            </div>

            <!-- Progreso de participantes -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">Participantes</small>
                <small class="fw-semibold">${participantsCount}/${maxParticipants}</small>
              </div>
              <div class="progress" style="height: 6px;">
                <div 
                  class="progress-bar ${
                    participantsPercentage >= 90
                      ? "bg-warning"
                      : participantsPercentage >= 100
                      ? "bg-danger"
                      : "bg-primary"
                  }" 
                  style="width: ${Math.min(participantsPercentage, 100)}%"
                ></div>
              </div>
              <small class="text-muted">${participantsPercentage.toFixed(
                0
              )}% ocupado</small>
            </div>
          </div>

          <div class="card-footer bg-white border-0 pt-0">
            <div class="d-flex gap-2">
              <a href="#" data-route="/activity/${
                activity.id
              }" class="btn btn-outline-primary btn-sm flex-fill">
                <i class="fas fa-eye me-1"></i>Ver
              </a>
              <a href="#" data-route="/activity/edit/${
                activity.id
              }" class="btn btn-primary btn-sm flex-fill">
                <i class="fas fa-edit me-1"></i>Editar
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Configurar listeners para las tarjetas de actividades
   */
  setupActivityCardListeners() {
    // Acciones del dropdown
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const action = e.target.getAttribute("data-action");
        const activityId = e.target.getAttribute("data-activity-id");

        this.handleActivityAction(action, activityId);
      });
    });
  }

  /**
   * Manejar acciones de actividades
   */
  async handleActivityAction(action, activityId) {
    const activity = this.activities.find((a) => a.id == activityId);
    if (!activity) return;

    switch (action) {
      case "delete":
        this.showDeleteModal(activity);
        break;

      case "toggle-status":
        await this.toggleActivityStatus(activity);
        break;

      case "participants":
        this.router.navigate(`/activity/${activityId}/participants`);
        break;
    }
  }

  /**
   * Mostrar modal de eliminación
   */
  showDeleteModal(activity) {
    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    document.getElementById("delete-activity-name").textContent = activity.name;

    // Guardar ID para confirmación
    this.activityToDelete = activity.id;

    modal.show();
  }

  /**
   * Confirmar eliminación
   */
  async handleDeleteConfirm() {
    try {
      if (!this.activityToDelete) return;

      await this.app.activitiesAPI.deleteActivity(this.activityToDelete);

      this.app.alert.show("Actividad eliminada exitosamente", "success");

      // Recargar datos
      await this.loadData();
      this.applyFilters();

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      );
      modal.hide();

      this.activityToDelete = null;
    } catch (error) {
      console.error("❌ Error eliminando actividad:", error);
      this.app.alert.show("Error al eliminar la actividad", "danger");
    }
  }

  /**
   * Alternar estado de actividad
   */
  async toggleActivityStatus(activity) {
    try {
      const newStatus = !activity.is_active;

      await this.app.activitiesAPI.updateActivity(activity.id, {
        is_active: newStatus,
      });

      const statusText = newStatus ? "activada" : "desactivada";
      this.app.alert.show(`Actividad ${statusText} exitosamente`, "success");

      // Actualizar en memoria
      activity.is_active = newStatus;

      // Re-renderizar
      this.renderActivities();
    } catch (error) {
      console.error("❌ Error cambiando estado:", error);
      this.app.alert.show(
        "Error al cambiar el estado de la actividad",
        "danger"
      );
    }
  }

  /**
   * Limpiar filtros
   */
  clearFilters() {
    document.getElementById("search-input").value = "";
    document.getElementById("filter-status").value = "all";
    document.getElementById("sort-select").value = "newest";

    this.searchQuery = "";
    this.currentFilter = "all";
    this.currentSort = "newest";

    this.applyFilters();
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
    if (!category) return "fa-circle";

    const iconMap = {
      deportes: "fa-futbol",
      arte: "fa-palette",
      música: "fa-music",
      tecnología: "fa-laptop-code",
      ciencias: "fa-flask",
    };

    return iconMap[category.name.toLowerCase()] || "fa-circle";
  }

  formatDate(dateString) {
    // Extraer fecha y hora directamente del string sin conversión de zona horaria
    const date = new Date(dateString);

    // Formatear solo la fecha
    const dateOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("es-ES", dateOptions);

    // Extraer hora directamente del string
    const timePart = dateString.includes("T")
      ? dateString.split("T")[1]
      : dateString.split(" ")[1];
    if (timePart) {
      const time = timePart.split(":");
      if (time.length >= 2) {
        return `${formattedDate}, ${time[0]}:${time[1]}`;
      }
    }

    return formattedDate;
  }

  truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  showLoading() {
    const loading = document.getElementById("loading-activities");
    if (loading) loading.style.display = "block";
  }

  hideLoading() {
    const loading = document.getElementById("loading-activities");
    if (loading) loading.style.display = "none";
  }

  showError(message) {
    this.hideLoading();
    this.app.alert.show(message, "danger");
  }
}
