/**
 * Página de Login - Simple y Funcional
 */

export class LoginPage {
  constructor(router, app, params = {}) {
    this.router = router;
    this.app = app;
    this.params = params;
    console.log("🔐 LoginPage: Inicializada");
  }

  render() {
    return `
      <div class="container mt-5 pt-5">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card shadow">
              <div class="card-body">
                
                <!-- Header -->
                <div class="text-center mb-4">
                  <i class="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                  <h2 class="h4 fw-bold">Iniciar Sesión</h2>
                  <p class="text-muted">Accede a tu cuenta</p>
                </div>

                <!-- Formulario -->
                <form id="login-form">
                  
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
                      placeholder="Tu contraseña"
                      required
                    >
                  </div>

                  <!-- Submit -->
                  <button type="submit" class="btn btn-primary w-100 mb-3" id="login-btn">
                    <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
                  </button>

                  <!-- Demo -->
                  <div class="text-center mb-3">
                    <small class="text-muted">Cuentas demo:</small><br>
                    <button type="button" class="btn btn-outline-info btn-sm me-2" id="demo-profesor">
                      Profesor
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" id="demo-alumno">
                      Alumno
                    </button>
                  </div>

                </form>

                <!-- Register Link -->
                <div class="text-center">
                  <small>
                    ¿No tienes cuenta? 
                    <a href="#" data-route="/register">Regístrate</a>
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
    console.log("🔐 LoginPage: Inicializando después del render");
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");

    // Submit del formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        this.app.alert.error("Por favor completa todos los campos");
        return;
      }

      try {
        loginBtn.disabled = true;
        loginBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...';
        this.app.loader.show("Iniciando sesión...");

        console.log("🔐 Intentando login:", email);
        const response = await this.app.authService.login(email, password);

        if (response.success) {
          const user = response.data.user;
          console.log("✅ Login exitoso:", user);
          this.app.alert.success(`¡Bienvenido/a, ${user.name}!`);

          // Notificar a la app principal
          if (window.app && window.app.handleLoginSuccess) {
            window.app.handleLoginSuccess(user);
          } else {
            // Fallback: actualizar navbar manualmente
            this.app.navbar?.updateAuthState?.(user);
          }

          // Redirigir
          setTimeout(() => {
            this.router.navigate("/dashboard");
          }, 1500);
        } else {
          throw new Error(response.message || "Error de autenticación");
        }
      } catch (error) {
        console.error("❌ Error durante login:", error);
        this.app.alert.error(error.message || "Error de autenticación");
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML =
          '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión';
        this.app.loader.hide();
      }
    });

    // Botones demo
    document.getElementById("demo-profesor")?.addEventListener("click", () => {
      console.log("🔐 Cargando credenciales de profesor");
      emailInput.value = "profesor@test.com";
      passwordInput.value = "password123";
      this.app.alert.info("Credenciales de profesor cargadas");
    });

    document.getElementById("demo-alumno")?.addEventListener("click", () => {
      console.log("🔐 Cargando credenciales de alumno");
      emailInput.value = "alumno@test.com";
      passwordInput.value = "password123";
      this.app.alert.info("Credenciales de alumno cargadas");
    });

    console.log("✅ LoginPage: Event listeners configurados");
  }

  cleanup() {
    this.app.loader.hide();
    console.log("🧹 LoginPage: Limpieza completada");
  }
}

export default LoginPage;
