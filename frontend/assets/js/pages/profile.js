/**
 * Profile Page - Sistema de Actividades Extraescolares
 * Página para editar perfil y cambiar contraseña
 */

class ProfilePage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.isEditing = false;
    this.isChangingPassword = false;

    // Obtener usuario inmediatamente para render()
    this.user = this.app?.authService?.getUser();

    if (!this.user) {
      console.error("❌ Profile: Usuario no autenticado");
    }
  }

  /**
   * Renderizar la página de perfil - SOLO devuelve HTML
   */
  render() {
    if (!this.user) {
      return `
        <div class="container mt-4">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Debes iniciar sesión para ver tu perfil.
          </div>
        </div>
      `;
    }

    return `
      <div class="profile-container">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#" data-route="/dashboard">Dashboard</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">Mi Perfil</li>
              </ol>
            </nav>
          </div>
        </div>

        <div class="row">
          <!-- Información del Perfil -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body text-center">
                <div class="mb-3">
                  <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style="width: 120px; height: 120px;">
                    <i class="fas fa-user fa-3x text-muted"></i>
                  </div>
                </div>
                <h4 class="mb-1">${
                  this.user.name || "Nombre no disponible"
                }</h4>
                <p class="text-muted mb-3">${
                  this.user.email || "Email no disponible"
                }</p>
                <span class="badge bg-${
                  this.user.role === "profesor" ? "primary" : "success"
                } fs-6">
                  <i class="fas fa-${
                    this.user.role === "profesor"
                      ? "chalkboard-teacher"
                      : "user-graduate"
                  } me-1"></i>
                  ${this.user.role === "profesor" ? "Profesor" : "Alumno"}
                </span>
                <div class="mt-3">
                  <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    Miembro desde ${new Date(
                      this.user.created_at || Date.now()
                    ).toLocaleDateString("es-ES")}
                  </small>
                </div>
              </div>
            </div>

            <!-- Estadísticas rápidas -->
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-transparent border-0">
                <h6 class="card-title mb-0">
                  <i class="fas fa-chart-bar me-2"></i>
                  Resumen de Actividad
                </h6>
              </div>
              <div class="card-body">
                <div id="profile-stats">
                  <div class="text-center py-3">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <p class="mt-2 mb-0 text-muted small">Cargando estadísticas...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Formularios de Edición -->
          <div class="col-lg-8">
            <!-- Editar Información Personal -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-transparent border-0">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-user-edit me-2"></i>
                    Información Personal
                  </h5>
                  <button class="btn btn-outline-primary btn-sm" id="toggle-edit-profile">
                    <i class="fas fa-edit me-1"></i>
                    Editar
                  </button>
                </div>
              </div>
              <div class="card-body">
                <form id="profile-form">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="name" class="form-label">Nombre completo</label>
                      <input type="text" class="form-control" id="name" name="name" 
                             value="${this.user.name || ""}" disabled>
                      <div class="invalid-feedback"></div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Correo electrónico</label>
                      <input type="email" class="form-control" id="email" name="email" 
                             value="${this.user.email || ""}" disabled>
                      <div class="invalid-feedback"></div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="role" class="form-label">Rol</label>
                      <input type="text" class="form-control" id="role" 
                             value="${
                               this.user.role === "profesor"
                                 ? "Profesor"
                                 : "Alumno"
                             }" disabled readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="created_at" class="form-label">Fecha de registro</label>
                      <input type="text" class="form-control" id="created_at" 
                             value="${new Date(
                               this.user.created_at || Date.now()
                             ).toLocaleDateString("es-ES")}" disabled readonly>
                    </div>
                  </div>
                  <div class="d-none" id="profile-form-actions">
                    <hr class="my-3">
                    <div class="d-flex gap-2">
                      <button type="submit" class="btn btn-primary" id="save-profile">
                        <i class="fas fa-save me-1"></i>
                        Guardar Cambios
                      </button>
                      <button type="button" class="btn btn-outline-secondary" id="cancel-edit-profile">
                        <i class="fas fa-times me-1"></i>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-transparent border-0">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-lock me-2"></i>
                    Seguridad
                  </h5>
                  <button class="btn btn-outline-warning btn-sm" id="toggle-change-password">
                    <i class="fas fa-key me-1"></i>
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="alert alert-info" id="security-info">
                  <h6 class="alert-heading">
                    <i class="fas fa-info-circle me-2"></i>
                    Seguridad de la cuenta:
                  </h6>
                  <p class="mb-0">Tu contraseña debe tener al menos 8 caracteres. Recomendamos cambiarla periódicamente para mantener tu cuenta segura.</p>
                </div>

                <form id="password-form" class="d-none">
                  <div class="row">
                    <div class="col-12 mb-3">
                      <label for="current_password" class="form-label">Contraseña actual</label>
                      <input type="password" class="form-control" id="current_password" 
                             name="current_password" required>
                      <div class="invalid-feedback"></div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="new_password" class="form-label">Nueva contraseña</label>
                      <input type="password" class="form-control" id="new_password" 
                             name="new_password" required>
                      <div class="invalid-feedback"></div>
                      <div class="form-text">Mínimo 8 caracteres</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="confirm_password" class="form-label">Confirmar nueva contraseña</label>
                      <input type="password" class="form-control" id="confirm_password" 
                             name="confirm_password" required>
                      <div class="invalid-feedback"></div>
                    </div>
                  </div>
                  <hr class="my-3">
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-warning" id="save-password">
                      <i class="fas fa-save me-1"></i>
                      Cambiar Contraseña
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="cancel-change-password">
                      <i class="fas fa-times me-1"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inicializar después del render - Patrón SPA
   */
  async init(params) {
    console.log("👤 Profile: Inicializando después del render...");

    try {
      // Verificar autenticación
      if (!this.user) {
        console.error("❌ Profile: Usuario no autenticado");
        this.router.navigate("/login");
        return;
      }

      // Configurar event listeners
      this.setupEventListeners();

      // Cargar estadísticas
      await this.loadStats();

      console.log("✅ Profile: Página de perfil inicializada");
    } catch (error) {
      console.error("❌ Profile: Error inicializando:", error);
      this.app.alert.error("Error cargando el perfil");
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Toggle edición de perfil
    document
      .getElementById("toggle-edit-profile")
      .addEventListener("click", () => {
        this.toggleProfileEdit();
      });

    // Cancelar edición de perfil
    document
      .getElementById("cancel-edit-profile")
      .addEventListener("click", () => {
        this.cancelProfileEdit();
      });

    // Guardar perfil
    document.getElementById("profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    // Toggle cambio de contraseña
    document
      .getElementById("toggle-change-password")
      .addEventListener("click", () => {
        this.togglePasswordChange();
      });

    // Cancelar cambio de contraseña
    document
      .getElementById("cancel-change-password")
      .addEventListener("click", () => {
        this.cancelPasswordChange();
      });

    // Guardar contraseña
    document.getElementById("password-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.savePassword();
    });

    // Validación en tiempo real de contraseñas
    document
      .getElementById("confirm_password")
      .addEventListener("input", () => {
        this.validatePasswordMatch();
      });
  }

  /**
   * Cargar estadísticas del usuario
   */
  async loadStats() {
    try {
      let stats = {};

      if (this.user.role === "profesor") {
        // Estadísticas para profesores
        const activitiesResponse =
          await this.app.activitiesAPI.getMyActivities();
        const totalParticipants = activitiesResponse.reduce(
          (sum, activity) => sum + (activity.enrolled_count || 0),
          0
        );

        stats = {
          total_activities: activitiesResponse.length,
          active_activities: activitiesResponse.filter((a) => a.is_active)
            .length,
          total_participants: totalParticipants,
        };
      } else {
        // Estadísticas para alumnos
        const enrollmentsResponse =
          await this.app.enrollmentsAPI.getMyEnrollments();

        stats = {
          total_enrollments: enrollmentsResponse.length,
          active_enrollments: enrollmentsResponse.filter(
            (e) => e.status === "active"
          ).length,
          completed_activities: enrollmentsResponse.filter((e) => {
            const endDate = new Date(e.activity?.end_date);
            return endDate < new Date() && e.status === "active";
          }).length,
        };
      }

      this.renderStats(stats);
    } catch (error) {
      console.error("❌ Profile: Error cargando estadísticas:", error);
      const statsElement = document.getElementById("profile-stats");
      if (statsElement) {
        statsElement.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error cargando estadísticas
          </div>
        `;
      }
    }
  }

  /**
   * Renderizar estadísticas
   */
  renderStats(stats) {
    const isProfesor = this.user.role === "profesor";

    const statsItems = isProfesor
      ? [
          {
            label: "Actividades Creadas",
            value: stats.total_activities,
            icon: "calendar-alt",
            color: "primary",
          },
          {
            label: "Actividades Activas",
            value: stats.active_activities,
            icon: "check-circle",
            color: "success",
          },
          {
            label: "Total Participantes",
            value: stats.total_participants,
            icon: "users",
            color: "info",
          },
        ]
      : [
          {
            label: "Inscripciones",
            value: stats.total_enrollments,
            icon: "bookmark",
            color: "success",
          },
          {
            label: "Activas",
            value: stats.active_enrollments,
            icon: "check-circle",
            color: "primary",
          },
          {
            label: "Completadas",
            value: stats.completed_activities,
            icon: "trophy",
            color: "warning",
          },
        ];

    const statsHtml = statsItems
      .map(
        (stat) => `
      <div class="d-flex align-items-center mb-2">
        <div class="text-${stat.color} me-3">
          <i class="fas fa-${stat.icon}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="fw-bold">${stat.value}</div>
          <small class="text-muted">${stat.label}</small>
        </div>
      </div>
    `
      )
      .join("");

    const statsElement = document.getElementById("profile-stats");
    if (statsElement) {
      statsElement.innerHTML = statsHtml;
    }
  }

  /**
   * Activar/desactivar edición de perfil
   */
  toggleProfileEdit() {
    this.isEditing = !this.isEditing;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const toggleBtn = document.getElementById("toggle-edit-profile");
    const actionsDiv = document.getElementById("profile-form-actions");

    if (this.isEditing) {
      nameInput.disabled = false;
      emailInput.disabled = false;
      toggleBtn.innerHTML = '<i class="fas fa-times me-1"></i>Cancelar';
      toggleBtn.className = "btn btn-outline-secondary btn-sm";
      actionsDiv.classList.remove("d-none");
    } else {
      this.cancelProfileEdit();
    }
  }

  /**
   * Cancelar edición de perfil
   */
  cancelProfileEdit() {
    this.isEditing = false;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const toggleBtn = document.getElementById("toggle-edit-profile");
    const actionsDiv = document.getElementById("profile-form-actions");

    // Restaurar valores originales
    nameInput.value = this.user.name;
    emailInput.value = this.user.email;

    // Deshabilitar inputs
    nameInput.disabled = true;
    emailInput.disabled = true;

    // Limpiar errores
    this.clearFieldErrors(["name", "email"]);

    // Restaurar botón
    toggleBtn.innerHTML = '<i class="fas fa-edit me-1"></i>Editar';
    toggleBtn.className = "btn btn-outline-primary btn-sm";
    actionsDiv.classList.add("d-none");
  }

  /**
   * Guardar cambios de perfil
   */
  async saveProfile() {
    try {
      this.app.loader.show();

      const formData = new FormData(document.getElementById("profile-form"));
      const data = {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
      };

      // Validar datos
      this.validateProfileData(data);

      // Actualizar perfil
      const updatedUser = await this.app.authService.updateProfile(data);

      // Actualizar datos locales
      this.user = updatedUser;

      // Actualizar elementos en el DOM directamente
      const headerName = document.querySelector(".card-body h4");
      //const headerEmail = document.querySelector(".card-body .text-muted");
      if (headerName) headerName.textContent = updatedUser.name;
      //if (headerEmail) headerEmail.textContent = updatedUser.email;

      // Desactivar modo edición
      this.cancelProfileEdit();

      this.app.alert.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("❌ Profile: Error actualizando perfil:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        this.showFieldErrors(error.response.data.errors);
      } else {
        this.app.alert.error(error.message || "Error actualizando el perfil");
      }
    } finally {
      this.app.loader.hide();
    }
  }

  /**
   * Activar/desactivar cambio de contraseña
   */
  togglePasswordChange() {
    this.isChangingPassword = !this.isChangingPassword;

    const passwordSection = document.getElementById("password-form");
    const passwordInfo = document.getElementById("security-info");
    const toggleBtn = document.getElementById("toggle-change-password");

    if (this.isChangingPassword) {
      passwordSection.classList.remove("d-none");
      passwordInfo.classList.add("d-none");
      toggleBtn.innerHTML = '<i class="fas fa-times me-1"></i>Cancelar';
      toggleBtn.className = "btn btn-outline-secondary btn-sm";
    } else {
      this.cancelPasswordChange();
    }
  }

  /**
   * Cancelar cambio de contraseña
   */
  cancelPasswordChange() {
    this.isChangingPassword = false;

    const passwordSection = document.getElementById("password-form");
    const passwordInfo = document.getElementById("security-info");
    const toggleBtn = document.getElementById("toggle-change-password");
    const form = document.getElementById("password-form");

    // Limpiar formulario
    form.reset();
    this.clearFieldErrors([
      "current_password",
      "new_password",
      "confirm_password",
    ]);

    // Mostrar/ocultar secciones
    passwordSection.classList.add("d-none");
    passwordInfo.classList.remove("d-none");

    // Restaurar botón
    toggleBtn.innerHTML = '<i class="fas fa-key me-1"></i>Cambiar Contraseña';
    toggleBtn.className = "btn btn-outline-warning btn-sm";
  }

  /**
   * Guardar nueva contraseña
   */
  async savePassword() {
    try {
      this.app.loader.show();

      const formData = new FormData(document.getElementById("password-form"));
      const data = {
        current_password: formData.get("current_password"),
        new_password: formData.get("new_password"),
        confirm_password: formData.get("confirm_password"),
      };

      // Validar datos
      this.validatePasswordData(data);

      // Cambiar contraseña
      await this.app.authService.changePassword(data);

      // Cancelar modo cambio de contraseña
      this.cancelPasswordChange();

      this.app.alert.success("Contraseña cambiada correctamente");
    } catch (error) {
      console.error("❌ Profile: Error cambiando contraseña:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        this.showFieldErrors(error.response.data.errors);
      } else {
        this.app.alert.error(error.message || "Error cambiando la contraseña");
      }
    } finally {
      this.app.loader.hide();
    }
  }

  /**
   * Validar datos de perfil
   */
  validateProfileData(data) {
    const errors = {};

    if (!data.name || data.name.length < 2) {
      errors.name = ["El nombre debe tener al menos 2 caracteres"];
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = ["Ingresa un email válido"];
    }

    if (Object.keys(errors).length > 0) {
      this.showFieldErrors(errors);
      throw new Error("Datos de perfil inválidos");
    }
  }

  /**
   * Validar datos de contraseña
   */
  validatePasswordData(data) {
    const errors = {};

    if (!data.current_password) {
      errors.current_password = ["La contraseña actual es requerida"];
    }

    if (!data.new_password || data.new_password.length < 8) {
      errors.new_password = [
        "La nueva contraseña debe tener al menos 8 caracteres",
      ];
    }

    if (data.new_password !== data.confirm_password) {
      errors.confirm_password = ["Las contraseñas no coinciden"];
    }

    if (Object.keys(errors).length > 0) {
      this.showFieldErrors(errors);
      throw new Error("Datos de contraseña inválidos");
    }
  }

  /**
   * Validar coincidencia de contraseñas en tiempo real
   */
  validatePasswordMatch() {
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password");

    if (confirmPassword.value && newPassword !== confirmPassword.value) {
      confirmPassword.classList.add("is-invalid");
      confirmPassword.nextElementSibling.textContent =
        "Las contraseñas no coinciden";
    } else {
      confirmPassword.classList.remove("is-invalid");
      confirmPassword.nextElementSibling.textContent = "";
    }
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Mostrar errores de campos
   */
  showFieldErrors(errors) {
    // Limpiar errores previos
    this.clearFieldErrors(Object.keys(errors));

    // Mostrar nuevos errores
    Object.keys(errors).forEach((field) => {
      const input = document.getElementById(field);
      const feedback = input.nextElementSibling;

      if (input && feedback) {
        input.classList.add("is-invalid");
        feedback.textContent = Array.isArray(errors[field])
          ? errors[field][0]
          : errors[field];
      }
    });
  }

  /**
   * Limpiar errores de campos
   */
  clearFieldErrors(fields) {
    fields.forEach((field) => {
      const input = document.getElementById(field);
      const feedback = input.nextElementSibling;

      if (input && feedback) {
        input.classList.remove("is-invalid");
        feedback.textContent = "";
      }
    });
  }
}

// Exportar la clase usando ES6 modules
export { ProfilePage };
