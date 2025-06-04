/**
 * Página de Detalle de Actividad
 * Muestra información completa de una actividad específica
 */

export class ActivityDetailPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.activityId = params.id;
    this.activity = null;
    this.category = null;
    this.userEnrollments = []; // Nueva: inscripciones del usuario
    this.isOwner = false;
  }

  /**
   * Renderizar la página
   */
  async render() {
    return `
      <div class="container py-4">
        <!-- Loading state -->
        <div id="loading-detail" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando actividad...</span>
          </div>
          <p class="text-muted mt-3">Cargando información de la actividad...</p>
        </div>

        <!-- Contenido de la actividad -->
        <div id="activity-content" style="display: none;">
          <!-- Navegación de regreso -->
          <div class="row mb-3">
            <div class="col-12">
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                  <li class="breadcrumb-item">
                    <a href="#" data-route="/" class="text-decoration-none">
                      <i class="fas fa-home me-1"></i>
                      Inicio
                    </a>
                  </li>
                  <li class="breadcrumb-item">
                    <a href="#" data-route="/activities" class="text-decoration-none">
                      Actividades
                    </a>
                  </li>
                  <li class="breadcrumb-item active" aria-current="page" id="activity-breadcrumb">
                    Detalle
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          <!-- Header con título y acciones -->
          <div class="row mb-4">
            <div class="col-lg-8">
              <h1 class="display-5 fw-bold text-primary mb-2" id="activity-title">
                <!-- Título se carga dinámicamente -->
              </h1>
              <div class="d-flex align-items-center gap-3 mb-3" id="activity-meta">
                <!-- Meta información se carga dinámicamente -->
              </div>
            </div>
            <div class="col-lg-4 text-lg-end">
              <div id="activity-actions" class="d-flex flex-column gap-2">
                <!-- Acciones se cargan dinámicamente -->
              </div>
            </div>
          </div>

          <!-- Información principal -->
          <div class="row">
            <!-- Información de la actividad -->
            <div class="col-lg-8">
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                  <h3 class="card-title mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    Información de la Actividad
                  </h3>
                  
                  <div class="row g-3 mb-4" id="activity-details">
                    <!-- Detalles se cargan dinámicamente -->
                  </div>
                  
                  <hr>
                  
                  <h4 class="mb-3">Descripción</h4>
                  <div id="activity-description" class="text-muted">
                    <!-- Descripción se carga dinámicamente -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Información lateral -->
            <div class="col-lg-4">
              <!-- Información del organizador -->
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body">
                  <h5 class="card-title mb-3">
                    <i class="fas fa-user-tie me-2"></i>
                    Organizador
                  </h5>
                  <div id="organizer-info">
                    <!-- Info del organizador se carga dinámicamente -->
                  </div>
                </div>
              </div>

              <!-- Participantes -->
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body">
                  <h5 class="card-title mb-3">
                    <i class="fas fa-users me-2"></i>
                    Participantes
                  </h5>
                  <div id="participants-info">
                    <!-- Info de participantes se carga dinámicamente -->
                  </div>
                </div>
              </div>

              <!-- Información adicional -->
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-3">
                    <i class="fas fa-calendar-check me-2"></i>
                    Detalles Adicionales
                  </h5>
                  <div id="additional-info">
                    <!-- Info adicional se carga dinámicamente -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div id="error-state" class="text-center py-5" style="display: none;">
          <i class="fas fa-exclamation-triangle display-1 text-warning mb-3"></i>
          <h3 class="text-muted">Actividad no encontrada</h3>
          <p class="text-muted">
            La actividad que buscas no existe o ha sido eliminada.
          </p>
          <a href="#" data-route="/activities" class="btn btn-primary">
            <i class="fas fa-arrow-left me-2"></i>
            Volver a Actividades
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar la página después del render
   */
  async init() {
    try {
      console.log(
        `🎯 ActivityDetailPage: Inicializando detalle de actividad ${this.activityId}...`
      );

      if (!this.activityId) {
        throw new Error("ID de actividad no proporcionado");
      }

      // Cargar datos de la actividad
      await this.loadActivityData();

      // Renderizar contenido
      this.renderActivityContent();

      // Configurar event listeners
      this.setupEventListeners();

      // Mostrar contenido
      this.showContent();

      console.log("✅ ActivityDetailPage: Página inicializada correctamente");
    } catch (error) {
      console.error(
        "❌ ActivityDetailPage: Error inicializando página:",
        error
      );
      this.showError();
    }
  }

  /**
   * Cargar datos de la actividad
   */
  async loadActivityData() {
    try {
      // Preparar promesas para cargar datos
      const promises = [this.app.activitiesAPI.getActivity(this.activityId)];

      // Si el usuario está autenticado como alumno, cargar sus inscripciones
      if (
        this.app.auth.isAuthenticated() &&
        this.app.auth.getCurrentUser()?.role === "alumno"
      ) {
        promises.push(this.app.enrollmentsAPI.getMyEnrollments());
      }

      // Cargar datos en paralelo
      const responses = await Promise.all(promises);

      // Cargar actividad
      this.activity = responses[0];

      // Cargar inscripciones del usuario si es alumno
      this.userEnrollments = responses[1] || [];

      // Cargar categoría
      if (this.activity.category_id) {
        const categories = await this.app.categoriesAPI.getCategories();
        this.category = categories.find(
          (c) => c.id == this.activity.category_id
        );
      }

      // Verificar si el usuario es el propietario
      const currentUser = this.app.auth.getCurrentUser();
      this.isOwner = currentUser && currentUser.id === this.activity.user_id;

      console.log(
        `📊 ActivityDetailPage: Actividad "${this.activity.name}" cargada, ${this.userEnrollments.length} inscripciones del usuario`
      );
    } catch (error) {
      console.error("❌ ActivityDetailPage: Error cargando datos:", error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está inscrito en esta actividad
   */
  isUserEnrolledInActivity() {
    // Debug: log de las inscripciones para investigar
    console.log(
      `🔍 ACTIVITY-DETAIL: Verificando inscripción para actividad ${this.activityId}`
    );
    console.log(
      "📋 ACTIVITY-DETAIL: Inscripciones del usuario:",
      this.userEnrollments
    );

    const targetActivityId = parseInt(this.activityId);

    const isEnrolled = this.userEnrollments.some((enrollment) => {
      console.log(`🔍 ACTIVITY-DETAIL: Checking enrollment:`, enrollment);

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

      console.log(`🔍 ACTIVITY-DETAIL: Enrollment details:`, {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        activityId: enrollmentActivityId,
        targetActivityId: targetActivityId,
        hasMatchingActivity,
        isValidStatus,
      });

      const matches = hasMatchingActivity && isValidStatus;
      console.log(
        `✅ ACTIVITY-DETAIL: Match for activity ${this.activityId}:`,
        matches
      );
      return matches;
    });

    console.log(
      `🎯 ACTIVITY-DETAIL: Resultado final para actividad ${this.activityId}:`,
      isEnrolled
    );
    return isEnrolled;
  }

  /**
   * Renderizar contenido de la actividad
   */
  renderActivityContent() {
    // Título
    const titleElement = document.getElementById("activity-title");
    if (titleElement) {
      titleElement.textContent = this.activity.name;
    }

    // Breadcrumb
    const breadcrumbElement = document.getElementById("activity-breadcrumb");
    if (breadcrumbElement) {
      breadcrumbElement.textContent = this.activity.name;
    }

    // Meta información
    this.renderMetaInfo();

    // Detalles
    this.renderActivityDetails();

    // Descripción
    this.renderDescription();

    // Organizador
    this.renderOrganizerInfo();

    // Participantes
    this.renderParticipantsInfo();

    // Información adicional
    this.renderAdditionalInfo();

    // Acciones
    this.renderActions();
  }

  /**
   * Renderizar meta información
   */
  renderMetaInfo() {
    const metaElement = document.getElementById("activity-meta");
    if (!metaElement) return;

    const categoryName = this.category ? this.category.name : "Sin categoría";
    const statusBadge = this.activity.is_active
      ? '<span class="badge bg-success">Activa</span>'
      : '<span class="badge bg-secondary">Inactiva</span>';

    metaElement.innerHTML = `
      <span class="badge bg-primary bg-opacity-10 text-primary">
        <i class="fas fa-tag me-1"></i>
        ${categoryName}
      </span>
      ${statusBadge}
      <small class="text-muted">
        <i class="fas fa-calendar-plus me-1"></i>
        Creada el ${this.formatDate(this.activity.created_at)}
      </small>
    `;
  }

  /**
   * Renderizar detalles de la actividad
   */
  renderActivityDetails() {
    const detailsElement = document.getElementById("activity-details");
    if (!detailsElement) return;

    const participantsText = this.activity.current_participants
      ? `${this.activity.current_participants}/${this.activity.max_participants}`
      : `0/${this.activity.max_participants}`;

    detailsElement.innerHTML = `
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-map-marker-alt text-primary me-2"></i>
          <strong>Ubicación:</strong>
          <span class="ms-2">${this.activity.location}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-users text-primary me-2"></i>
          <strong>Participantes:</strong>
          <span class="ms-2">${participantsText}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-calendar text-primary me-2"></i>
          <strong>Fecha inicio:</strong>
          <span class="ms-2">${this.formatDate(this.activity.start_date)}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-calendar-check text-primary me-2"></i>
          <strong>Fecha fin:</strong>
          <span class="ms-2">${this.formatDate(this.activity.end_date)}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-clock text-primary me-2"></i>
          <strong>Hora inicio:</strong>
          <span class="ms-2">${this.formatTime(this.activity.start_date)}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-clock text-primary me-2"></i>
          <strong>Hora fin:</strong>
          <span class="ms-2">${this.formatTime(this.activity.end_date)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar descripción
   */
  renderDescription() {
    const descriptionElement = document.getElementById("activity-description");
    if (descriptionElement) {
      descriptionElement.innerHTML = this.activity.description.replace(
        /\n/g,
        "<br>"
      );
    }
  }

  /**
   * Renderizar información del organizador
   */
  renderOrganizerInfo() {
    const organizerElement = document.getElementById("organizer-info");
    if (!organizerElement) return;

    organizerElement.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="user-avatar bg-primary text-white rounded-circle me-3">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <h6 class="mb-1">${this.activity.teacher?.name || "N/A"}</h6>
          <small class="text-muted">Profesor/Monitor</small>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar información de participantes
   */
  renderParticipantsInfo() {
    const participantsElement = document.getElementById("participants-info");
    if (!participantsElement) return;

    const current = this.activity.current_participants || 0;
    const max = this.activity.max_participants;
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const isAvailable = current < max;

    participantsElement.innerHTML = `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <small>Inscritos: ${current}/${max}</small>
          <small>${percentage.toFixed(0)}%</small>
        </div>
        <div class="progress">
          <div class="progress-bar ${
            isAvailable ? "bg-success" : "bg-warning"
          }" 
               style="width: ${percentage}%"></div>
        </div>
      </div>
      <div class="text-center">
        <span class="badge ${
          isAvailable ? "bg-success" : "bg-warning text-dark"
        }">
          ${isAvailable ? "Plazas disponibles" : "Actividad llena"}
        </span>
      </div>
    `;
  }

  /**
   * Renderizar información adicional
   */
  renderAdditionalInfo() {
    const additionalElement = document.getElementById("additional-info");
    if (!additionalElement) return;

    additionalElement.innerHTML = `
      <div class="small text-muted">
        <div class="d-flex justify-content-between mb-2">
          <span>Estado:</span>
          <span class="fw-semibold">${
            this.activity.is_active ? "Activa" : "Inactiva"
          }</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Creada:</span>
          <span class="fw-semibold">${this.formatDate(
            this.activity.created_at
          )}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Actualizada:</span>
          <span class="fw-semibold">${this.formatDate(
            this.activity.updated_at
          )}</span>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar acciones disponibles
   */
  renderActions() {
    const actionsElement = document.getElementById("activity-actions");
    if (!actionsElement) return;

    const currentUser = this.app.auth.getCurrentUser();
    const isAvailable =
      !this.activity.current_participants ||
      this.activity.current_participants < this.activity.max_participants;

    // Verificar si el usuario ya está inscrito
    const isEnrolled = this.isUserEnrolledInActivity();

    let actionsHTML = "";

    // Botón de regresar
    actionsHTML += `
      <button type="button" class="btn btn-outline-secondary" id="btn-back">
        <i class="fas fa-arrow-left me-2"></i>
        Volver a Actividades
      </button>
    `;

    if (currentUser) {
      if (currentUser.role === "alumno" && this.activity.is_active) {
        if (isEnrolled) {
          // Si ya está inscrito, mostrar botón de cancelar y badge
          actionsHTML += `
            <div class="alert alert-success py-2 px-3 mb-2">
              <i class="fas fa-check-circle me-2"></i>
              ¡Ya estás inscrito en esta actividad!
            </div>
            <button type="button" class="btn btn-outline-danger" id="btn-unenroll">
              <i class="fas fa-user-times me-2"></i>
              Cancelar Inscripción
            </button>
          `;
        } else if (isAvailable) {
          // Si no está inscrito y hay plazas, mostrar botón de inscripción
          actionsHTML += `
            <button type="button" class="btn btn-success" id="btn-enroll">
              <i class="fas fa-user-plus me-2"></i>
              Inscribirse
            </button>
          `;
        } else {
          // Si no hay plazas disponibles
          actionsHTML += `
            <div class="alert alert-warning py-2 px-3 mb-2">
              <i class="fas fa-exclamation-triangle me-2"></i>
              No hay plazas disponibles
            </div>
          `;
        }
      } else if (this.isOwner) {
        // Botones para el propietario
        actionsHTML += `
          <button type="button" class="btn btn-primary" id="btn-edit">
            <i class="fas fa-edit me-2"></i>
            Editar Actividad
          </button>
          <button type="button" class="btn btn-info" id="btn-participants">
            <i class="fas fa-users me-2"></i>
            Ver Participantes
          </button>
        `;
      }
    }

    actionsElement.innerHTML = actionsHTML;
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botón de regresar
    const btnBack = document.getElementById("btn-back");
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        this.router.navigate("/activities");
      });
    }

    // Botón de inscripción
    const btnEnroll = document.getElementById("btn-enroll");
    if (btnEnroll) {
      btnEnroll.addEventListener("click", () => {
        this.handleEnrollment();
      });
    }

    // Botón de cancelar inscripción
    const btnUnenroll = document.getElementById("btn-unenroll");
    if (btnUnenroll) {
      btnUnenroll.addEventListener("click", () => {
        this.handleUnenrollment();
      });
    }

    // Botón de editar
    const btnEdit = document.getElementById("btn-edit");
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        this.router.navigate(`/activity/edit/${this.activityId}`);
      });
    }

    // Botón de participantes
    const btnParticipants = document.getElementById("btn-participants");
    if (btnParticipants) {
      btnParticipants.addEventListener("click", () => {
        this.router.navigate(`/activity/${this.activityId}/participants`);
      });
    }
  }

  /**
   * Manejar inscripción
   */
  async handleEnrollment() {
    try {
      if (
        !confirm("¿Estás seguro de que quieres inscribirte a esta actividad?")
      ) {
        return;
      }

      this.app.loader.show("Inscribiendo...");
      await this.app.enrollmentsAPI.enrollInActivity(this.activityId);

      this.app.alert.show("¡Te has inscrito exitosamente!", "success");

      // Recargar datos para actualizar contadores
      await this.loadActivityData();
      this.renderActivityContent();
      this.setupEventListeners();

      this.app.loader.hide();
    } catch (error) {
      console.error("❌ ActivityDetailPage: Error en inscripción:", error);
      const message =
        error.message || "Error al inscribirse. Inténtalo de nuevo.";
      this.app.alert.show(message, "danger");
      this.app.loader.hide();
    }
  }

  /**
   * Manejar cancelación de inscripción
   */
  async handleUnenrollment() {
    try {
      if (
        !confirm(
          "¿Estás seguro de que quieres cancelar tu inscripción a esta actividad?\n\nEsta acción no se puede deshacer."
        )
      ) {
        return;
      }

      this.app.loader.show("Cancelando inscripción...");
      await this.app.enrollmentsAPI.unenrollFromActivity(this.activityId);

      this.app.alert.show("Inscripción cancelada exitosamente", "success");

      // Recargar datos para actualizar contadores
      await this.loadActivityData();
      this.renderActivityContent();
      this.setupEventListeners();

      this.app.loader.hide();
    } catch (error) {
      console.error(
        "❌ ActivityDetailPage: Error cancelando inscripción:",
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
   * Mostrar contenido
   */
  showContent() {
    const loading = document.getElementById("loading-detail");
    const content = document.getElementById("activity-content");

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  }

  /**
   * Mostrar error
   */
  showError() {
    const loading = document.getElementById("loading-detail");
    const content = document.getElementById("activity-content");
    const error = document.getElementById("error-state");

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "none";
    if (error) error.style.display = "block";
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString) {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  /**
   * Formatear hora
   */
  formatTime(dateString) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    return new Date(dateString).toLocaleTimeString("es-ES", options);
  }
}
