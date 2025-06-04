/**
 * Página de Participantes - Ver inscritos en una actividad
 */

export class ParticipantsPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.activityId = params.id;
    this.activity = null;
    this.participants = [];
    this.filteredParticipants = [];
    this.searchQuery = "";
    this.currentSort = "name";
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
                <li class="breadcrumb-item">
                  <a href="#" data-route="/my-activities" class="text-decoration-none">
                    Mis Actividades
                  </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  Participantes
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <!-- Loading state -->
        <div id="loading-participants" class="text-center py-5" style="display: none;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando participantes...</span>
          </div>
          <p class="text-muted mt-3">Cargando información...</p>
        </div>

        <!-- Content -->
        <div id="content-container" style="display: none;">
          <!-- Activity Header -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="row align-items-center">
                    <div class="col-md-8">
                      <div class="d-flex align-items-center">
                        <div class="me-4">
                          <i class="fas fa-users text-primary" style="font-size: 2.5rem;"></i>
                        </div>
                        <div>
                          <h1 class="h3 fw-bold mb-1" id="activity-title">Cargando...</h1>
                          <p class="text-muted mb-0" id="activity-info">Cargando información...</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <div class="d-flex flex-wrap gap-2 justify-content-md-end">
                        <a href="#" data-route="" id="back-to-activity" class="btn btn-outline-secondary">
                          <i class="fas fa-arrow-left me-2"></i>
                          Ver Actividad
                        </a>
                        <a href="#" data-route="" id="edit-activity" class="btn btn-primary">
                          <i class="fas fa-edit me-2"></i>
                          Editar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="row mb-4" id="stats-section">
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-user-check text-success mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="total-participants">0</h3>
                  <small class="text-muted">Activos</small>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-user-times text-secondary mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="cancelled-participants">0</h3>
                  <small class="text-muted">Cancelados</small>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-users text-primary mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="max-participants">0</h3>
                  <small class="text-muted">Máximo</small>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-chart-pie text-info mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="occupancy-percentage">0%</h3>
                  <small class="text-muted">Ocupación</small>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-users text-dark mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="total-all-participants">0</h3>
                  <small class="text-muted">Total</small>
                </div>
              </div>
            </div>
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center p-4">
                  <i class="fas fa-calendar text-warning mb-2" style="font-size: 2rem;"></i>
                  <h3 class="fw-bold mb-1" id="days-until">--</h3>
                  <small class="text-muted">Días restantes</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="row mb-4" id="controls-section">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="row g-3 align-items-center">
                    <!-- Búsqueda -->
                    <div class="col-md-6">
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="fas fa-search"></i>
                        </span>
                        <input 
                          type="text" 
                          class="form-control" 
                          id="search-participants"
                          placeholder="Buscar por nombre o email..."
                        >
                      </div>
                    </div>

                    <!-- Ordenar -->
                    <div class="col-md-3">
                      <select class="form-select" id="sort-participants">
                        <option value="name">Por nombre</option>
                        <option value="email">Por email</option>
                        <option value="enrollment_date">Por fecha de inscripción</option>
                      </select>
                    </div>

                    <!-- Acciones -->
                    <div class="col-md-3 text-end">
                      <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          <i class="fas fa-download me-2"></i>
                          Exportar
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <a class="dropdown-item" href="#" id="export-csv">
                              <i class="fas fa-file-csv me-2"></i>Exportar CSV
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#" id="export-pdf">
                              <i class="fas fa-file-pdf me-2"></i>Exportar PDF
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Participants List -->
          <div class="row" id="participants-container">
            <!-- Los participantes se cargarán aquí -->
          </div>

          <!-- Empty State -->
          <div id="empty-participants" class="text-center py-5" style="display: none;">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                  <div class="card-body p-5">
                    <i class="fas fa-user-slash text-muted mb-4" style="font-size: 4rem;"></i>
                    <h3 class="text-muted mb-3">No hay participantes inscritos</h3>
                    <p class="text-muted mb-4">
                      Aún no hay estudiantes inscritos en esta actividad. Los estudiantes pueden inscribirse desde la página pública de actividades.
                    </p>
                    <a href="#" data-route="/activities" class="btn btn-outline-primary">
                      <i class="fas fa-external-link-alt me-2"></i>
                      Ver página pública
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para desinscribir -->
      <div class="modal fade" id="unenrollModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-times text-warning me-2"></i>
                Confirmar desinscripción
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas desinscribir a <strong id="unenroll-participant-name"></strong> de esta actividad?</p>
              <div class="alert alert-warning">
                <i class="fas fa-info-circle me-2"></i>
                El estudiante será removido de la actividad y podrás reinscribirlo más tarde si es necesario.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-warning" id="confirm-unenroll">
                <i class="fas fa-user-times me-2"></i>
                Desinscribir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para reinscribir -->
      <div class="modal fade" id="reenrollModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-check text-success me-2"></i>
                Confirmar reinscripción
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas reinscribir a <strong id="reenroll-participant-name"></strong> en esta actividad?</p>
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                El estudiante volverá a ser un participante activo de la actividad.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-success" id="confirm-reenroll">
                <i class="fas fa-user-check me-2"></i>
                Reinscribir
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
      console.log(
        `🎯 ParticipantsPage: Inicializando para actividad ${this.activityId}...`
      );

      // Verificar permisos
      if (
        !this.app.auth.isAuthenticated() ||
        this.app.auth.getCurrentUser()?.role !== "profesor"
      ) {
        this.router.navigate("/login");
        return;
      }

      // Verificar que se proporcionó ID de actividad
      if (!this.activityId) {
        this.app.alert.show("ID de actividad no válido", "danger");
        this.router.navigate("/my-activities");
        return;
      }

      // Mostrar loading
      this.showLoading();

      // Cargar datos
      await this.loadData();

      // Configurar event listeners
      this.setupEventListeners();

      // Renderizar participantes
      this.renderParticipants();

      // Mostrar contenido
      this.showContent();

      console.log("✅ ParticipantsPage: Página inicializada correctamente");
    } catch (error) {
      console.error("❌ ParticipantsPage: Error inicializando página:", error);
      this.showError("Error cargando los participantes");
    }
  }

  /**
   * Cargar datos de la actividad y participantes
   */
  async loadData() {
    try {
      // Cargar información de la actividad
      this.activity = await this.app.activitiesAPI.getActivity(this.activityId);

      // Verificar que el usuario es el propietario
      const currentUser = this.app.auth.getCurrentUser();
      if (this.activity.user_id !== currentUser.id) {
        this.app.alert.show(
          "No tienes permisos para ver los participantes de esta actividad",
          "danger"
        );
        this.router.navigate("/my-activities");
        return;
      }

      // Cargar participantes
      this.participants = await this.app.activitiesAPI.getActivityParticipants(
        this.activityId
      );
      this.filteredParticipants = [...this.participants];

      // Actualizar información en la página
      this.updateActivityInfo();
      this.updateStats();

      console.log(
        `📊 ParticipantsPage: ${this.participants.length} participantes cargados`
      );
    } catch (error) {
      console.error("❌ ParticipantsPage: Error cargando datos:", error);
      throw error;
    }
  }

  /**
   * Actualizar información de la actividad
   */
  updateActivityInfo() {
    document.getElementById("activity-title").textContent = this.activity.name;
    document.getElementById("activity-info").textContent = `${
      this.activity.location
    } • ${this.formatDate(this.activity.start_date)}`;

    // Configurar enlaces
    document
      .getElementById("back-to-activity")
      .setAttribute("data-route", `/activity/${this.activityId}`);
    document
      .getElementById("edit-activity")
      .setAttribute("data-route", `/activity/edit/${this.activityId}`);
  }

  /**
   * Actualizar estadísticas
   */
  updateStats() {
    // Contar participantes por estado
    const activeParticipants = this.participants.filter(
      (participant) => participant.status === "approved"
    ).length;

    const cancelledParticipants = this.participants.filter(
      (participant) => participant.status === "cancelled"
    ).length;

    const totalParticipants = this.participants.length;
    const maxParticipants = this.activity.max_participants;

    // Calcular ocupación basada solo en participantes activos
    const occupancyPercentage =
      maxParticipants > 0 ? (activeParticipants / maxParticipants) * 100 : 0;

    // Calcular días restantes
    const startDate = new Date(this.activity.start_date);
    const today = new Date();
    const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

    // Actualizar todas las estadísticas
    document.getElementById("total-participants").textContent =
      activeParticipants;
    document.getElementById("cancelled-participants").textContent =
      cancelledParticipants;
    document.getElementById("total-all-participants").textContent =
      totalParticipants;
    document.getElementById("max-participants").textContent = maxParticipants;
    document.getElementById(
      "occupancy-percentage"
    ).textContent = `${occupancyPercentage.toFixed(0)}%`;

    const daysElement = document.getElementById("days-until");
    if (daysUntil > 0) {
      daysElement.textContent = daysUntil;
    } else if (daysUntil === 0) {
      daysElement.textContent = "Hoy";
    } else {
      daysElement.textContent = "Iniciada";
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById("search-participants");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Ordenamiento
    const sortSelect = document.getElementById("sort-participants");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.applySorting();
        this.renderParticipants();
      });
    }

    // Exportar CSV
    const exportCsv = document.getElementById("export-csv");
    if (exportCsv) {
      exportCsv.addEventListener("click", (e) => {
        e.preventDefault();
        this.exportToCSV();
      });
    }

    // Exportar PDF
    const exportPdf = document.getElementById("export-pdf");
    if (exportPdf) {
      exportPdf.addEventListener("click", (e) => {
        e.preventDefault();
        this.exportToPDF();
      });
    }

    // Modal de desinscripción
    const confirmUnenroll = document.getElementById("confirm-unenroll");
    if (confirmUnenroll) {
      confirmUnenroll.addEventListener("click", () => {
        this.handleUnenrollConfirm();
      });
    }

    // Modal de reinscripción
    const confirmReenroll = document.getElementById("confirm-reenroll");
    if (confirmReenroll) {
      confirmReenroll.addEventListener("click", () => {
        this.handleReenrollConfirm();
      });
    }
  }

  /**
   * Aplicar filtros de búsqueda
   */
  applyFilters() {
    this.filteredParticipants = this.participants.filter((participant) => {
      const user = participant.student || participant.user;
      if (!user) return false;

      return (
        !this.searchQuery ||
        user.name.toLowerCase().includes(this.searchQuery) ||
        user.email.toLowerCase().includes(this.searchQuery)
      );
    });

    this.applySorting();
    this.renderParticipants();
  }

  /**
   * Aplicar ordenamiento
   */
  applySorting() {
    switch (this.currentSort) {
      case "name":
        this.filteredParticipants.sort((a, b) =>
          (a.student || a.user).name.localeCompare((b.student || b.user).name)
        );
        break;
      case "email":
        this.filteredParticipants.sort((a, b) =>
          (a.student || a.user).email.localeCompare((b.student || b.user).email)
        );
        break;
      case "enrollment_date":
        this.filteredParticipants.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
    }
  }

  /**
   * Renderizar lista de participantes
   */
  renderParticipants() {
    const container = document.getElementById("participants-container");
    const emptyState = document.getElementById("empty-participants");

    if (!container) return;

    // Mostrar/ocultar estado vacío
    if (this.participants.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    } else {
      if (emptyState) emptyState.style.display = "none";
    }

    // Renderizar participantes filtrados
    if (this.filteredParticipants.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center p-4">
              <i class="fas fa-search text-muted mb-3" style="font-size: 2rem;"></i>
              <h5 class="text-muted mb-2">No se encontraron participantes</h5>
              <p class="text-muted">Prueba ajustando la búsqueda para ver más resultados.</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Renderizar lista de participantes
    const participantsHTML = this.filteredParticipants
      .map((participant) => this.renderParticipantCard(participant))
      .join("");

    container.innerHTML = `
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pb-0">
            <h5 class="fw-bold mb-0">
              <i class="fas fa-users me-2"></i>
              Participantes (${this.filteredParticipants.length})
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="border-0 py-3">Estudiante</th>
                    <th class="border-0 py-3">Email</th>
                    <th class="border-0 py-3">Fecha de inscripción</th>
                    <th class="border-0 py-3">Estado</th>
                    <th class="border-0 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${participantsHTML}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Configurar listeners para acciones de participantes
    this.setupParticipantActions();
  }

  /**
   * Renderizar tarjeta de participante
   */
  renderParticipantCard(participant) {
    const user = participant.student || participant.user;
    const enrollmentDate = this.formatDate(participant.created_at);

    // Determinar estado y estilo según el status
    let statusBadge = "";
    switch (participant.status) {
      case "approved":
        statusBadge = '<span class="badge bg-success">Inscrito</span>';
        break;
      case "pending":
        statusBadge = '<span class="badge bg-warning">Pendiente</span>';
        break;
      case "cancelled":
        statusBadge = '<span class="badge bg-secondary">Cancelado</span>';
        break;
      case "rejected":
        statusBadge = '<span class="badge bg-danger">Rechazado</span>';
        break;
      default:
        statusBadge = '<span class="badge bg-secondary">Desconocido</span>';
    }

    return `
      <tr>
        <td class="py-3">
          <div class="d-flex align-items-center">
            <div class="me-3">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                   style="width: 40px; height: 40px;">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div>
              <h6 class="fw-bold mb-1">${user.name}</h6>
              <small class="text-muted">Estudiante</small>
            </div>
          </div>
        </td>
        <td class="py-3">
          <span class="text-muted">${user.email}</span>
        </td>
        <td class="py-3">
          <small class="text-muted">${enrollmentDate}</small>
        </td>
        <td class="py-3">
          ${statusBadge}
        </td>
        <td class="py-3 text-center">
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#" data-action="contact" data-email="${
                  user.email
                }">
                  <i class="fas fa-envelope me-2"></i>Contactar
                </a>
              </li>
              ${
                participant.status === "approved"
                  ? `
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-warning" href="#" data-action="unenroll" data-participant-id="${participant.id}" data-participant-name="${user.name}">
                    <i class="fas fa-user-times me-2"></i>Desinscribir
                  </a>
                </li>
              `
                  : participant.status === "cancelled"
                  ? `
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-success" href="#" data-action="reenroll" data-participant-id="${participant.id}" data-participant-name="${user.name}">
                    <i class="fas fa-user-check me-2"></i>Reinscribir
                  </a>
                </li>
              `
                  : ""
              }
            </ul>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Configurar acciones de participantes
   */
  setupParticipantActions() {
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const action = e.target.getAttribute("data-action");

        if (action === "contact") {
          const email = e.target.getAttribute("data-email");
          this.handleContactParticipant(email);
        } else if (action === "unenroll") {
          const participantId = e.target.getAttribute("data-participant-id");
          const participantName = e.target.getAttribute(
            "data-participant-name"
          );
          this.showUnenrollModal(participantId, participantName);
        } else if (action === "reenroll") {
          const participantId = e.target.getAttribute("data-participant-id");
          const participantName = e.target.getAttribute(
            "data-participant-name"
          );
          this.showReenrollModal(participantId, participantName);
        }
      });
    });
  }

  /**
   * Contactar participante
   */
  handleContactParticipant(email) {
    window.location.href = `mailto:${email}?subject=Actividad: ${this.activity.name}`;
  }

  /**
   * Mostrar modal de desinscripción
   */
  showUnenrollModal(participantId, participantName) {
    const modal = new bootstrap.Modal(document.getElementById("unenrollModal"));
    document.getElementById("unenroll-participant-name").textContent =
      participantName;

    this.participantToUnenroll = participantId;
    modal.show();
  }

  /**
   * Mostrar modal de reinscripción
   */
  showReenrollModal(participantId, participantName) {
    const modal = new bootstrap.Modal(document.getElementById("reenrollModal"));
    document.getElementById("reenroll-participant-name").textContent =
      participantName;

    this.participantToReenroll = participantId;
    modal.show();
  }

  /**
   * Confirmar desinscripción
   */
  async handleUnenrollConfirm() {
    try {
      if (!this.participantToUnenroll) return;

      // Llamar al endpoint de desinscripción
      await this.app.enrollmentsAPI.unenrollParticipant(
        this.participantToUnenroll
      );

      this.app.alert.show("Estudiante desinscrito exitosamente", "success");

      // Recargar datos de participantes
      await this.loadData();
      this.renderParticipants();

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("unenrollModal")
      );
      modal.hide();

      this.participantToUnenroll = null;
    } catch (error) {
      console.error("❌ Error desinscribiendo participante:", error);
      const message =
        error.response?.data?.message || "Error al desinscribir participante";
      this.app.alert.show(message, "danger");
    }
  }

  /**
   * Confirmar reinscripción
   */
  async handleReenrollConfirm() {
    try {
      if (!this.participantToReenroll) return;

      // Llamar al endpoint de reinscripción
      await this.app.enrollmentsAPI.reenrollParticipant(
        this.participantToReenroll
      );

      this.app.alert.show("Estudiante reinscrito exitosamente", "success");

      // Recargar datos de participantes
      await this.loadData();
      this.renderParticipants();

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("reenrollModal")
      );
      modal.hide();

      this.participantToReenroll = null;
    } catch (error) {
      console.error("❌ Error reinscribiendo participante:", error);
      const message =
        error.response?.data?.message || "Error al reinscribir participante";
      this.app.alert.show(message, "danger");
    }
  }

  /**
   * Exportar a CSV
   */
  exportToCSV() {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `participantes_${this.activity.name.replace(/\s+/g, "_")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    this.app.alert.show("Lista exportada exitosamente", "success");
  }

  /**
   * Generar contenido CSV
   */
  generateCSV() {
    const headers = ["Nombre", "Email", "Fecha de Inscripción", "Estado"];
    const rows = this.filteredParticipants.map((participant) => {
      // Obtener el texto del estado
      let statusText = "";
      switch (participant.status) {
        case "approved":
          statusText = "Inscrito";
          break;
        case "pending":
          statusText = "Pendiente";
          break;
        case "cancelled":
          statusText = "Cancelado";
          break;
        case "rejected":
          statusText = "Rechazado";
          break;
        default:
          statusText = "Desconocido";
      }

      return [
        (participant.student || participant.user).name,
        (participant.student || participant.user).email,
        this.formatDate(participant.created_at),
        statusText,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Exportar a PDF
   */
  exportToPDF() {
    // Implementación básica - en una app real usarías una librería como jsPDF
    this.app.alert.show("Exportación a PDF disponible próximamente", "info");
  }

  /**
   * Utilidades
   */
  formatDate(dateString) {
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  showLoading() {
    const loading = document.getElementById("loading-participants");
    const content = document.getElementById("content-container");

    if (loading) loading.style.display = "block";
    if (content) content.style.display = "none";
  }

  showContent() {
    const loading = document.getElementById("loading-participants");
    const content = document.getElementById("content-container");

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  }

  showError(message) {
    this.app.alert.show(message, "danger");
    this.router.navigate("/my-activities");
  }
}
