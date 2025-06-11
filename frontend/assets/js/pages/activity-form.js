/**
 * Página de Formulario de Actividad
 * Maneja tanto la creación como la edición de actividades
 */

export class ActivityFormPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.activityId = params.id; // Para edición
    this.isEditMode = Boolean(this.activityId);
    this.activity = null;
    this.categories = [];
    this.formData = {};
  }

  /**
   * Renderizar la página
   */
  async render() {
    const pageTitle = this.isEditMode
      ? "Editar Actividad"
      : "Crear Nueva Actividad";
    const submitText = this.isEditMode
      ? "Actualizar Actividad"
      : "Crear Actividad";

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
                  ${this.isEditMode ? "Editar" : "Crear"}
                </li>
              </ol>
            </nav>
            
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-6 fw-bold text-primary mb-2">
                  <i class="fas ${
                    this.isEditMode ? "fa-edit" : "fa-plus-circle"
                  } me-3"></i>
                  ${pageTitle}
                </h1>
                <p class="text-muted mb-0">
                  ${
                    this.isEditMode
                      ? "Modifica los datos de tu actividad"
                      : "Completa los datos para crear una nueva actividad extraescolar"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div id="loading-form" class="text-center py-5" style="display: none;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando formulario...</span>
          </div>
          <p class="text-muted mt-3">Cargando datos...</p>
        </div>

        <!-- Formulario -->
        <div id="form-container">
          <form id="activity-form" novalidate>
            <div class="row">
              <!-- Columna principal -->
              <div class="col-lg-8">
                <!-- Información básica -->
                <div class="card border-0 shadow-sm mb-4">
                  <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-info-circle me-2"></i>
                      Información Básica
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <!-- Nombre de la actividad -->
                    <div class="row g-3">
                      <div class="col-12">
                        <label for="name" class="form-label fw-semibold">
                          Nombre de la Actividad *
                        </label>
                        <input 
                          type="text" 
                          class="form-control form-control-lg" 
                          id="name" 
                          name="name"
                          placeholder="Ej: Taller de Robótica para Principiantes"
                          required
                          maxlength="255"
                        >
                        <div class="invalid-feedback"></div>
                        <div class="form-text">Máximo 255 caracteres</div>
                      </div>

                      <!-- Categoría -->
                      <div class="col-md-6">
                        <label for="category_id" class="form-label fw-semibold">
                          Categoría *
                        </label>
                        <select class="form-select form-select-lg" id="category_id" name="category_id" required>
                          <option value="">Selecciona una categoría</option>
                          <!-- Las categorías se cargarán dinámicamente -->
                        </select>
                        <div class="invalid-feedback"></div>
                      </div>

                      <!-- Ubicación -->
                      <div class="col-md-6">
                        <label for="location" class="form-label fw-semibold">
                          Ubicación *
                        </label>
                        <input 
                          type="text" 
                          class="form-control form-control-lg" 
                          id="location" 
                          name="location"
                          placeholder="Ej: Aula 205, Laboratorio de Informática"
                          required
                          maxlength="255"
                        >
                        <div class="invalid-feedback"></div>
                      </div>

                      <!-- Descripción -->
                      <div class="col-12">
                        <label for="description" class="form-label fw-semibold">
                          Descripción *
                        </label>
                        <textarea 
                          class="form-control" 
                          id="description" 
                          name="description"
                          rows="4"
                          placeholder="Describe detalladamente qué se realizará en esta actividad, objetivos, materiales necesarios, etc."
                          required
                          maxlength="1000"
                        ></textarea>
                        <div class="invalid-feedback"></div>
                        <div class="form-text">
                          <span id="description-count">0</span>/1000 caracteres
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fechas y horarios -->
                <div class="card border-0 shadow-sm mb-4">
                  <div class="card-header bg-success text-white">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-calendar-alt me-2"></i>
                      Fechas y Horarios
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <div class="row g-3">
                      <!-- Fecha de inicio -->
                      <div class="col-md-6">
                        <label for="start_date" class="form-label fw-semibold">
                          Fecha y Hora de Inicio *
                        </label>
                        <input 
                          type="datetime-local" 
                          class="form-control form-control-lg" 
                          id="start_date" 
                          name="start_date"
                          required
                        >
                        <div class="invalid-feedback"></div>
                      </div>

                      <!-- Fecha de fin -->
                      <div class="col-md-6">
                        <label for="end_date" class="form-label fw-semibold">
                          Fecha y Hora de Fin *
                        </label>
                        <input 
                          type="datetime-local" 
                          class="form-control form-control-lg" 
                          id="end_date" 
                          name="end_date"
                          required
                        >
                        <div class="invalid-feedback"></div>
                      </div>

                      <!-- Información adicional sobre fechas -->
                      <div class="col-12">
                        <div class="alert alert-info">
                          <i class="fas fa-info-circle me-2"></i>
                          <strong>Importante:</strong> La fecha de inicio debe ser posterior a hoy y la fecha de fin debe ser posterior a la de inicio.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna lateral -->
              <div class="col-lg-4">
                <!-- Configuración -->
                <div class="card border-0 shadow-sm mb-4">
                  <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-cog me-2"></i>
                      Configuración
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <!-- Máximo de participantes -->
                    <div class="mb-4">
                      <label for="max_participants" class="form-label fw-semibold">
                        Máximo de Participantes *
                      </label>
                      <input 
                        type="number" 
                        class="form-control form-control-lg" 
                        id="max_participants" 
                        name="max_participants"
                        min="1"
                        max="100"
                        placeholder="20"
                        required
                      >
                      <div class="invalid-feedback"></div>
                      <div class="form-text">Entre 1 y 100 participantes</div>
                    </div>

                    <!-- Estado de la actividad -->
                    <div class="mb-4">
                      <label class="form-label fw-semibold">Estado</label>
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="is_active" 
                          name="is_active"
                          checked
                        >
                        <label class="form-check-label" for="is_active">
                          <span class="text-success fw-semibold">Actividad Activa</span>
                        </label>
                      </div>
                      <div class="form-text">
                        Solo las actividades activas son visibles para los estudiantes
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Vista previa -->
                <div class="card border-0 shadow-sm">
                  <div class="card-header bg-secondary text-white">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-eye me-2"></i>
                      Vista Previa
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <div id="preview-content" class="text-muted text-center">
                      <i class="fas fa-file-alt fa-3x mb-3"></i>
                      <p>Completa el formulario para ver una vista previa de tu actividad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="card border-0 shadow-sm">
                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center">
                      <!-- Botones de cancelar -->
                      <div>
                        <button type="button" class="btn btn-outline-secondary btn-lg me-2" id="btn-cancel">
                          <i class="fas fa-times me-2"></i>
                          Cancelar
                        </button>
                        <button type="button" class="btn btn-outline-info btn-lg" id="btn-preview">
                          <i class="fas fa-eye me-2"></i>
                          Vista Previa
                        </button>
                      </div>

                      <!-- Botón de envío -->
                      <div>
                        <button type="submit" class="btn btn-primary btn-lg" id="btn-submit">
                          <i class="fas ${
                            this.isEditMode ? "fa-save" : "fa-plus"
                          } me-2"></i>
                          <span id="submit-text">${submitText}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
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
        `🎯 ActivityFormPage: Inicializando formulario ${
          this.isEditMode ? "edición" : "creación"
        }...`
      );

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

      // Cargar datos necesarios
      await this.loadInitialData();

      // Si es modo edición, cargar datos de la actividad
      if (this.isEditMode) {
        await this.loadActivityData();
      }

      // Configurar formulario
      this.setupForm();

      // Configurar event listeners
      this.setupEventListeners();

      // Ocultar loading
      this.hideLoading();

      console.log("✅ ActivityFormPage: Formulario inicializado correctamente");
    } catch (error) {
      console.error(
        "❌ ActivityFormPage: Error inicializando formulario:",
        error
      );
      this.showError("Error cargando el formulario");
    }
  }

  /**
   * Cargar datos iniciales
   */
  async loadInitialData() {
    try {
      // Cargar categorías
      this.categories = await this.app.categoriesAPI.getCategories();

      // Poblar select de categorías
      this.loadCategoriesSelect();

      console.log(
        `📊 ActivityFormPage: ${this.categories.length} categorías cargadas`
      );
    } catch (error) {
      console.error(
        "❌ ActivityFormPage: Error cargando datos iniciales:",
        error
      );
      throw error;
    }
  }

  /**
   * Cargar datos de la actividad para edición
   */
  async loadActivityData() {
    try {
      this.activity = await this.app.activitiesAPI.getActivity(this.activityId);

      // Verificar que el usuario es el propietario
      const currentUser = this.app.auth.getCurrentUser();
      if (this.activity.user_id !== currentUser.id) {
        this.app.alert.show(
          "No tienes permisos para editar esta actividad",
          "danger"
        );
        this.router.navigate("/my-activities");
        return;
      }

      // Rellenar formulario con datos existentes
      this.populateForm();

      console.log(
        `📝 ActivityFormPage: Actividad "${this.activity.name}" cargada para edición`
      );
    } catch (error) {
      console.error("❌ ActivityFormPage: Error cargando actividad:", error);
      throw error;
    }
  }

  /**
   * Cargar categorías en el select
   */
  loadCategoriesSelect() {
    const categorySelect = document.getElementById("category_id");
    if (!categorySelect) return;

    // Limpiar opciones existentes (excepto la primera)
    categorySelect.innerHTML =
      '<option value="">Selecciona una categoría</option>';

    // Agregar categorías
    this.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  /**
   * Rellenar formulario con datos de la actividad
   */
  populateForm() {
    if (!this.activity) return;

    // Campos de texto
    document.getElementById("name").value = this.activity.name || "";
    document.getElementById("description").value =
      this.activity.description || "";
    document.getElementById("location").value = this.activity.location || "";
    document.getElementById("max_participants").value =
      this.activity.max_participants || "";

    // Categoría
    const categorySelect = document.getElementById("category_id");
    if (categorySelect && this.activity.category_id) {
      categorySelect.value = this.activity.category_id;
    }

    // Fechas (convertir de datetime a datetime-local)
    if (this.activity.start_date) {
      document.getElementById("start_date").value = this.formatDateTimeLocal(
        this.activity.start_date
      );
    }
    if (this.activity.end_date) {
      document.getElementById("end_date").value = this.formatDateTimeLocal(
        this.activity.end_date
      );
    }

    // Estado
    document.getElementById("is_active").checked = Boolean(
      this.activity.is_active
    );

    // Actualizar contador de descripción
    this.updateDescriptionCounter();

    // Generar vista previa
    this.generatePreview();
  }

  /**
   * Configurar formulario
   */
  setupForm() {
    // Establecer fecha mínima como hoy
    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);

    document.getElementById("start_date").min = minDateTime;
    document.getElementById("end_date").min = minDateTime;

    // Contador de caracteres de descripción
    this.updateDescriptionCounter();
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const form = document.getElementById("activity-form");
    const descriptionField = document.getElementById("description");
    const startDateField = document.getElementById("start_date");
    const endDateField = document.getElementById("end_date");

    // Envío del formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Contador de caracteres
    descriptionField.addEventListener("input", () => {
      this.updateDescriptionCounter();
      this.generatePreview();
    });

    // Validación de fechas en tiempo real
    startDateField.addEventListener("change", () => {
      this.validateDates();
      this.generatePreview();
    });

    endDateField.addEventListener("change", () => {
      this.validateDates();
      this.generatePreview();
    });

    // Vista previa en tiempo real
    form.addEventListener("input", () => {
      this.generatePreview();
    });

    // Botón cancelar
    document.getElementById("btn-cancel").addEventListener("click", () => {
      this.handleCancel();
    });

    // Botón vista previa
    document.getElementById("btn-preview").addEventListener("click", () => {
      this.showPreviewModal();
    });

    // Validación en tiempo real
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("blur", () => {
        this.validateField(field);
      });
    });
  }

  /**
   * Manejar envío del formulario
   */
  async handleSubmit() {
    try {
      // Validar formulario
      if (!this.validateForm()) {
        this.app.alert.show(
          "Por favor corrige los errores en el formulario",
          "warning"
        );
        return;
      }

      // Mostrar loading en botón
      const submitBtn = document.getElementById("btn-submit");
      const submitText = document.getElementById("submit-text");
      const originalText = submitText.textContent;

      submitBtn.disabled = true;
      submitText.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

      // Recopilar datos del formulario
      const formData = this.collectFormData();

      // Enviar al backend
      let result;
      if (this.isEditMode) {
        result = await this.app.activitiesAPI.updateActivity(
          this.activityId,
          formData
        );
      } else {
        result = await this.app.activitiesAPI.createActivity(formData);
      }

      // Mostrar éxito
      const message = this.isEditMode
        ? "¡Actividad actualizada exitosamente!"
        : "¡Actividad creada exitosamente!";

      this.app.alert.show(message, "success");

      // Redireccionar
      setTimeout(() => {
        this.router.navigate("/my-activities");
      }, 1500);
    } catch (error) {
      console.error("❌ ActivityFormPage: Error guardando actividad:", error);

      // Restaurar botón
      const submitBtn = document.getElementById("btn-submit");
      const submitText = document.getElementById("submit-text");
      submitBtn.disabled = false;
      submitText.textContent = this.isEditMode
        ? "Actualizar Actividad"
        : "Crear Actividad";

      // Mostrar error
      const message =
        error.message || "Error al guardar la actividad. Inténtalo de nuevo.";
      this.app.alert.show(message, "danger");
    }
  }

  /**
   * Recopilar datos del formulario
   */
  collectFormData() {
    const form = document.getElementById("activity-form");
    const formData = new FormData(form);

    const data = {
      name: formData.get("name").trim(),
      description: formData.get("description").trim(),
      category_id: parseInt(formData.get("category_id")),
      location: formData.get("location").trim(),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      max_participants: parseInt(formData.get("max_participants")),
      is_active: document.getElementById("is_active").checked,
    };

    return data;
  }

  /**
   * Validar formulario completo
   */
  validateForm() {
    const form = document.getElementById("activity-form");
    let isValid = true;

    // Validar todos los campos
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Validar fechas específicamente
    if (!this.validateDates()) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validar campo individual
   */
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Limpiar estado anterior
    field.classList.remove("is-invalid", "is-valid");

    // Validaciones según el campo
    switch (field.name) {
      case "name":
        if (!value) {
          errorMessage = "El nombre es requerido";
          isValid = false;
        } else if (value.length < 3) {
          errorMessage = "El nombre debe tener al menos 3 caracteres";
          isValid = false;
        } else if (value.length > 255) {
          errorMessage = "El nombre no puede exceder 255 caracteres";
          isValid = false;
        }
        break;

      case "description":
        if (!value) {
          errorMessage = "La descripción es requerida";
          isValid = false;
        } else if (value.length < 10) {
          errorMessage = "La descripción debe tener al menos 10 caracteres";
          isValid = false;
        } else if (value.length > 1000) {
          errorMessage = "La descripción no puede exceder 1000 caracteres";
          isValid = false;
        }
        break;

      case "category_id":
        if (!value) {
          errorMessage = "Debes seleccionar una categoría";
          isValid = false;
        }
        break;

      case "location":
        if (!value) {
          errorMessage = "La ubicación es requerida";
          isValid = false;
        } else if (value.length > 255) {
          errorMessage = "La ubicación no puede exceder 255 caracteres";
          isValid = false;
        }
        break;

      case "max_participants":
        const num = parseInt(value);
        if (!value) {
          errorMessage = "El máximo de participantes es requerido";
          isValid = false;
        } else if (isNaN(num) || num < 1) {
          errorMessage = "Debe ser un número mayor a 0";
          isValid = false;
        } else if (num > 100) {
          errorMessage = "No puede exceder 100 participantes";
          isValid = false;
        }
        break;

      case "start_date":
      case "end_date":
        if (!value) {
          errorMessage = "La fecha es requerida";
          isValid = false;
        }
        break;
    }

    // Aplicar clases y mostrar errores
    if (isValid) {
      field.classList.add("is-valid");
    } else {
      field.classList.add("is-invalid");
      const feedback = field.nextElementSibling;
      if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = errorMessage;
      }
    }

    return isValid;
  }

  /**
   * Validar fechas
   */
  validateDates() {
    const startDate = document.getElementById("start_date");
    const endDate = document.getElementById("end_date");

    if (!startDate.value || !endDate.value) return true; // Será validado por campos requeridos

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const now = new Date();

    let isValid = true;

    // Fecha de inicio no puede ser en el pasado
    if (start <= now) {
      startDate.classList.add("is-invalid");
      const feedback = startDate.nextElementSibling;
      if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = "La fecha de inicio debe ser posterior a ahora";
      }
      isValid = false;
    }

    // Fecha de fin debe ser posterior a fecha de inicio
    if (end <= start) {
      endDate.classList.add("is-invalid");
      const feedback = endDate.nextElementSibling;
      if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent =
          "La fecha de fin debe ser posterior a la de inicio";
      }
      isValid = false;
    }

    // Si las fechas son válidas, marcar como válidas
    if (isValid) {
      startDate.classList.remove("is-invalid");
      startDate.classList.add("is-valid");
      endDate.classList.remove("is-invalid");
      endDate.classList.add("is-valid");

      // Actualizar fecha mínima del campo end_date
      endDate.min = startDate.value;
    }

    return isValid;
  }

  /**
   * Actualizar contador de descripción
   */
  updateDescriptionCounter() {
    const description = document.getElementById("description");
    const counter = document.getElementById("description-count");

    if (description && counter) {
      counter.textContent = description.value.length;

      // Cambiar color según límite
      if (description.value.length > 900) {
        counter.classList.add("text-warning");
      } else if (description.value.length > 950) {
        counter.classList.remove("text-warning");
        counter.classList.add("text-danger");
      } else {
        counter.classList.remove("text-warning", "text-danger");
      }
    }
  }

  /**
   * Generar vista previa
   */
  generatePreview() {
    const preview = document.getElementById("preview-content");
    if (!preview) return;

    const formData = this.collectFormData();

    if (!formData.name && !formData.description) {
      preview.innerHTML = `
        <div class="text-muted text-center">
          <i class="fas fa-file-alt fa-3x mb-3"></i>
          <p>Completa el formulario para ver una vista previa de tu actividad</p>
        </div>
      `;
      return;
    }

    const categoryName = this.getCategoryName(formData.category_id);
    const startDate = formData.start_date
      ? this.formatDate(formData.start_date)
      : "Sin fecha";
    const endDate = formData.end_date
      ? this.formatDate(formData.end_date)
      : "Sin fecha";

    preview.innerHTML = `
      <div class="text-start">
        <h6 class="fw-bold text-primary mb-2">${
          formData.name || "Nombre de actividad"
        }</h6>
        <div class="mb-2">
          <small class="text-muted">
            <i class="fas fa-tag me-1"></i>
            ${categoryName || "Sin categoría"}
          </small>
        </div>
        <div class="mb-2">
          <small class="text-muted">
            <i class="fas fa-map-marker-alt me-1"></i>
            ${formData.location || "Sin ubicación"}
          </small>
        </div>
        <div class="mb-2">
          <small class="text-muted">
            <i class="fas fa-users me-1"></i>
            Máx. ${formData.max_participants || "0"} participantes
          </small>
        </div>
        <div class="mb-3">
          <small class="text-muted">
            <i class="fas fa-calendar me-1"></i>
            ${startDate} - ${endDate}
          </small>
        </div>
        <p class="small text-muted">
          ${this.truncateText(formData.description || "Sin descripción", 100)}
        </p>
        <div class="text-center mt-3">
          <span class="badge ${
            formData.is_active ? "bg-success" : "bg-secondary"
          }">
            ${formData.is_active ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Manejar cancelación
   */
  handleCancel() {
    if (
      confirm(
        "¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados."
      )
    ) {
      this.router.navigate("/my-activities");
    }
  }

  /**
   * Mostrar modal de vista previa
   */
  showPreviewModal() {
    // TODO: Implementar modal de vista previa más detallada
    this.app.alert.show("Vista previa disponible en el panel lateral", "info");
  }

  /**
   * Utilidades
   */
  getCategoryName(categoryId) {
    const category = this.categories.find((c) => c.id == categoryId);
    return category ? category.name : null;
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

  formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  showLoading() {
    const loading = document.getElementById("loading-form");
    const container = document.getElementById("form-container");

    if (loading) loading.style.display = "block";
    if (container) container.style.display = "none";
  }

  hideLoading() {
    const loading = document.getElementById("loading-form");
    const container = document.getElementById("form-container");

    if (loading) loading.style.display = "none";
    if (container) container.style.display = "block";
  }

  showError(message) {
    this.hideLoading();
    this.app.alert.show(message, "danger");
  }
}
