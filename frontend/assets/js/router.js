/**
 * Router SPA - Sistema de Actividades Extraescolares
 * Maneja la navegación sin recargas usando History API
 */

class Router {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.routes = new Map();
    this.currentRoute = null;
    this.isNavigating = false;

    console.log("🧭 Router: Inicializando router...");
  }

  /**
   * Inicializar el router
   */
  init() {
    // Configurar rutas
    this.setupRoutes();

    // Configurar event listeners
    this.setupEventListeners();

    // Navegar a la ruta inicial
    this.handleInitialRoute();

    console.log("✅ Router: Router inicializado");
  }

  /**
   * Configurar todas las rutas de la aplicación
   */
  setupRoutes() {
    console.log("📍 Router: Configurando rutas...");

    // Rutas públicas
    this.addRoute("/", () => this.loadPage("home"));
    this.addRoute("/login", () => this.loadPage("login"));
    this.addRoute("/register", () => this.loadPage("register"));
    this.addRoute("/activities", () => this.loadPage("activities"));
    this.addRoute("/activity/:id", (params) =>
      this.loadPage("activity-detail", params)
    );

    // Rutas protegidas
    this.addRoute("/dashboard", () => this.loadProtectedPage("dashboard"));
    this.addRoute("/profile", () => this.loadProtectedPage("profile"));

    // Rutas específicas de profesores
    this.addRoute("/my-activities", () =>
      this.loadRoleProtectedPage("my-activities", "profesor")
    );
    this.addRoute("/activity/create", () =>
      this.loadRoleProtectedPage("activity-create", "profesor")
    );
    this.addRoute("/activity/edit/:id", (params) =>
      this.loadRoleProtectedPage("activity-edit", "profesor", params)
    );
    this.addRoute("/activity/:id/participants", (params) =>
      this.loadRoleProtectedPage("participants", "profesor", params)
    );

    // Rutas específicas de alumnos
    this.addRoute("/my-enrollments", () =>
      this.loadRoleProtectedPage("my-enrollments", "alumno")
    );

    // Rutas de error
    this.addRoute("/404", () => this.loadPage("error-404"));
    this.addRoute("/403", () => this.loadPage("error-403"));

    console.log(`✅ Router: ${this.routes.size} rutas configuradas`);
  }

  /**
   * Agregar una ruta al router
   */
  addRoute(path, handler) {
    // Convertir ruta con parámetros a regex
    const paramNames = [];
    const regexPath = path
      .replace(/:[^\s/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      })
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${regexPath}$`);

    this.routes.set(path, {
      regex,
      paramNames,
      handler,
    });
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Listener para navegación por History API
    window.addEventListener("popstate", (event) => {
      this.handleRoute(window.location.pathname);
    });

    // Listener para clicks en enlaces internos
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-route]");
      if (link) {
        event.preventDefault();
        const route = link.getAttribute("data-route");
        this.navigate(route);
      }
    });
  }

  /**
   * Manejar la ruta inicial al cargar la página
   */
  handleInitialRoute() {
    const currentPath = window.location.pathname;
    this.handleRoute(currentPath);
  }

  /**
   * Navegar a una ruta específica
   */
  navigate(path, replace = false) {
    if (this.isNavigating) {
      console.warn("🚧 Router: Navegación en progreso, ignorando...");
      return;
    }

    console.log(`🧭 Router: Navegando a ${path}`);

    // Actualizar la URL en el navegador
    if (replace) {
      window.history.replaceState(null, "", path);
    } else {
      window.history.pushState(null, "", path);
    }

    // Manejar la ruta
    this.handleRoute(path);
  }

  /**
   * Manejar una ruta específica
   */
  async handleRoute(path) {
    if (this.isNavigating) return;

    try {
      this.isNavigating = true;
      console.log(`📍 Router: Manejando ruta: ${path}`);

      // Buscar la ruta que coincida
      const routeMatch = this.findRoute(path);

      if (routeMatch) {
        // Actualizar estado
        this.currentRoute = path;

        // Ejecutar el handler de la ruta
        await routeMatch.route.handler(routeMatch.params);
      } else {
        // Ruta no encontrada
        console.warn(`❌ Router: Ruta no encontrada: ${path}`);
        this.navigate("/404", true);
      }
    } catch (error) {
      console.error("❌ Router: Error manejando ruta:", error);
      this.showErrorPage(error);
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Buscar una ruta que coincida con el path
   */
  findRoute(path) {
    for (const [routePath, route] of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        // Extraer parámetros
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return { route, params };
      }
    }
    return null;
  }

  /**
   * Cargar una página pública
   */
  async loadPage(pageName, params = {}) {
    console.log(`📄 Router: Cargando página: ${pageName}`);

    try {
      // Importar dinámicamente el módulo de la página
      const pageModule = await import(`./pages/${pageName}.js`);
      const PageClass = pageModule.default;

      // Crear instancia de la página con el orden correcto: (router, app)
      const page = new PageClass(this, this.app, params);

      // Renderizar la página
      await this.renderPage(page);
    } catch (error) {
      console.error(`❌ Router: Error cargando página ${pageName}:`, error);
      this.showErrorPage(error);
    }
  }

  /**
   * Cargar una página protegida (requiere autenticación)
   */
  async loadProtectedPage(pageName, params = {}) {
    if (!this.app.isAuthenticated()) {
      console.log("🔒 Router: Página protegida, redirigiendo a login...");
      this.navigate("/login");
      return;
    }

    await this.loadPage(pageName, params);
  }

  /**
   * Cargar una página protegida por rol
   */
  async loadRoleProtectedPage(pageName, requiredRole, params = {}) {
    if (!this.app.isAuthenticated()) {
      console.log("🔒 Router: Página protegida, redirigiendo a login...");
      this.navigate("/login");
      return;
    }

    if (!this.app.hasRole(requiredRole)) {
      console.log(`🚫 Router: Acceso denegado. Rol requerido: ${requiredRole}`);
      this.navigate("/403");
      return;
    }

    await this.loadPage(pageName, params);
  }

  /**
   * Renderizar una página en el contenedor
   */
  async renderPage(page) {
    try {
      // Mostrar loader
      this.showLoader();

      // Limpiar el contenedor
      this.container.innerHTML = "";

      // Renderizar la página
      const content = await page.render();
      this.container.innerHTML = content;

      // Ejecutar scripts de inicialización de la página
      if (page.init && typeof page.init === "function") {
        await page.init();
      }

      // Actualizar estado activo en navbar
      this.updateActiveNavigation();

      console.log("✅ Router: Página renderizada correctamente");
    } catch (error) {
      console.error("❌ Router: Error renderizando página:", error);
      this.showErrorPage(error);
    } finally {
      // Ocultar loader
      this.hideLoader();
    }
  }

  /**
   * Mostrar página de error
   */
  showErrorPage(error) {
    this.container.innerHTML = `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 3rem;"></i>
                <h3 class="card-title">Error</h3>
                <p class="card-text">Ha ocurrido un error al cargar la página.</p>
                <small class="text-muted">${error.message}</small>
                <div class="mt-3">
                  <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-refresh me-2"></i>Recargar página
                  </button>
                  <a href="#" data-route="/" class="btn btn-outline-primary ms-2">
                    <i class="fas fa-home me-2"></i>Ir al inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Mostrar loader
   */
  showLoader() {
    const loaderOverlay = document.getElementById("loading-overlay");
    if (loaderOverlay) {
      loaderOverlay.classList.remove("d-none");
    }
  }

  /**
   * Ocultar loader
   */
  hideLoader() {
    const loaderOverlay = document.getElementById("loading-overlay");
    if (loaderOverlay) {
      loaderOverlay.classList.add("d-none");
    }
  }

  /**
   * Actualizar navegación activa en el navbar
   */
  updateActiveNavigation() {
    // Remover clases activas anteriores
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Agregar clase activa al enlace actual
    const currentPath = window.location.pathname;
    const activeLink = document.querySelector(`[data-route="${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  /**
   * Obtener la ruta actual
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Verificar si estamos en una ruta específica
   */
  isCurrentRoute(path) {
    return this.currentRoute === path;
  }

  /**
   * Generar URL con parámetros
   */
  generateUrl(routePath, params = {}) {
    let url = routePath;

    // Reemplazar parámetros en la URL
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, value);
    }

    return url;
  }

  /**
   * Manejar redirección con mensaje
   */
  redirectWithMessage(path, message, type = "info") {
    if (message) {
      // Guardar mensaje en sessionStorage para mostrarlo después de la redirección
      sessionStorage.setItem("flashMessage", JSON.stringify({ message, type }));
    }
    this.navigate(path);
  }

  /**
   * Obtener y mostrar mensaje flash si existe
   */
  checkFlashMessage() {
    const flashMessage = sessionStorage.getItem("flashMessage");
    if (flashMessage) {
      const { message, type } = JSON.parse(flashMessage);
      sessionStorage.removeItem("flashMessage");

      // Importar y usar AlertManager
      setTimeout(() => {
        if (window.AlertManager) {
          window.AlertManager[type](message);
        }
      }, 100);
    }
  }
}

export default Router;
