/**
 * Página de Registro - Simple y Funcional
 */

import { AuthService } from "../api/auth-api.js";
import { AlertManager } from "../components/alert.js";
import { LoaderManager } from "../components/loader.js";

export class RegisterPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    this.authService = new AuthService();
    console.log("📝 RegisterPage: Inicializada");
  }

  render() {
    return `
      <div class="container mt-5 pt-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow">
              <div class="card-body">
                
                <!-- Header -->
                <div class="text-center mb-4">
                  <i class="fas fa-user-plus fa-3x text-success mb-3"></i>
                  <h2 class="h4 fw-bold">Crear Cuenta</h2>
                  <p class="text-muted">Únete a nuestra comunidad educativa</p>
                </div>

                <!-- Formulario -->
                <form id="register-form">
                  
                  <!-- Nombre -->
                  <div class="mb-3">
                    <label for="name" class="form-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      class="form-control"
                      id="name"
                      placeholder="Tu nombre completo"
                      required
                    >
                  </div>

                  <!-- Email -->
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control"
                      id="email"
                      placeholder="tu@email.com"
                      required
                    >
                  </div>

                  <!-- Password -->
                  <div class="mb-3">
                    <label for="password" class="form-label">Contraseña</label>
                    <input 
                      type="password" 
                      class="form-control"
                      id="password"
                      placeholder="Mínimo 8 caracteres"
                      required
                    >
                  </div>

                  <!-- Confirm Password -->
                  <div class="mb-3">
                    <label for="password_confirmation" class="form-label">Confirmar Contraseña</label>
                    <input 
                      type="password" 
                      class="form-control"
                      id="password_confirmation"
                      placeholder="Repite tu contraseña"
                      required
                    >
                  </div>

                  <!-- Rol -->
                  <div class="mb-4">
                    <label class="form-label">Tipo de cuenta</label>
                    <div class="row">
                      <div class="col-6">
                        <div class="form-check form-check-card">
                          <input 
                            class="form-check-input" 
                            type="radio" 
                            name="role" 
                            id="role-alumno" 
                            value="alumno"
                            checked
                          >
                          <label class="form-check-label w-100 text-center p-3 border rounded" for="role-alumno">
                            <i class="fas fa-user-graduate fa-2x text-success d-block mb-2"></i>
                            <strong>Alumno</strong>
                            <small class="d-block text-muted">Inscríbete en actividades</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="form-check form-check-card">
                          <input 
                            class="form-check-input" 
                            type="radio" 
                            name="role" 
                            id="role-profesor" 
                            value="profesor"
                          >
                          <label class="form-check-label w-100 text-center p-3 border rounded" for="role-profesor">
                            <i class="fas fa-chalkboard-teacher fa-2x text-info d-block mb-2"></i>
                            <strong>Profesor</strong>
                            <small class="d-block text-muted">Crea y gestiona actividades</small>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Submit -->
                  <button type="submit" class="btn btn-success btn-lg w-100 mb-3" id="register-btn">
                    <i class="fas fa-user-plus me-2"></i>Crear Cuenta
                  </button>

                </form>

                <!-- Login Link -->
                <div class="text-center">
                  <small>
                    ¿Ya tienes cuenta? 
                    <a href="#" data-route="/login">Inicia sesión</a>
                  </small>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Método que el router llama después de renderizar
  async init() {
    console.log("📝 RegisterPage: Inicializando después del render");
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById("register-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById(
      "password_confirmation"
    );
    const registerBtn = document.getElementById("register-btn");

    // Mejorar UX de selección de roles
    const roleLabels = document.querySelectorAll(".form-check-card label");
    roleLabels.forEach((label) => {
      label.addEventListener("click", function () {
        // Remover clase activa de todos
        roleLabels.forEach((l) =>
          l.classList.remove("bg-light", "border-primary")
        );
        // Agregar a la seleccionada
        this.classList.add("bg-light", "border-primary");
      });
    });

    // Submit del formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const passwordConfirmation = confirmPasswordInput.value.trim();
      const role = document.querySelector('input[name="role"]:checked').value;

      // Validaciones básicas
      if (!name || !email || !password || !passwordConfirmation) {
        AlertManager.error("Por favor completa todos los campos");
        return;
      }

      if (password.length < 8) {
        AlertManager.error("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      if (password !== passwordConfirmation) {
        AlertManager.error("Las contraseñas no coinciden");
        return;
      }

      try {
        registerBtn.disabled = true;
        registerBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';
        LoaderManager.show("Creando cuenta...");

        console.log("📝 Intentando registro:", { email, role });

        const response = await this.authService.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        });

        if (response.success) {
          console.log("✅ Registro exitoso:", response.data.user);
          AlertManager.success(
            `¡Cuenta creada exitosamente! Bienvenido/a, ${response.data.user.name}`
          );

          // Notificar a la app del login automático
          this.app.handleLoginSuccess(response.data.user);

          // Redirigir al dashboard
          setTimeout(() => {
            this.router.navigate("/dashboard");
          }, 2000);
        } else {
          console.warn("❌ Error de registro:", response.message);

          // Manejar errores específicos
          if (response.errors) {
            const errorMessages = Object.values(response.errors).flat();
            AlertManager.error(errorMessages.join("<br>"));
          } else {
            AlertManager.error(response.message || "Error al crear la cuenta");
          }
        }
      } catch (error) {
        console.error("❌ Error durante registro:", error);
        AlertManager.error("Error de conexión. Inténtalo de nuevo.");
      } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML =
          '<i class="fas fa-user-plus me-2"></i>Crear Cuenta';
        LoaderManager.hide();
      }
    });

    // Validación en tiempo real de confirmación de contraseña
    confirmPasswordInput.addEventListener("input", () => {
      const password = passwordInput.value;
      const confirmation = confirmPasswordInput.value;

      if (confirmation && password !== confirmation) {
        confirmPasswordInput.classList.add("is-invalid");
      } else {
        confirmPasswordInput.classList.remove("is-invalid");
      }
    });

    console.log("✅ RegisterPage: Event listeners configurados");
  }

  cleanup() {
    LoaderManager.hide();
    console.log("🧹 RegisterPage: Limpieza completada");
  }
}

export default RegisterPage;
