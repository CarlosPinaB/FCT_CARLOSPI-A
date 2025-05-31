/**
 * Sistema de Actividades Extraescolares - Frontend
 * Aplicación SPA con JavaScript Vanilla
 *
 * @version 1.0.0
 * @author Sistema de Actividades Extraescolares
 */

// Importaciones de módulos
import Router from "./router.js";
import { AuthService } from "./api/auth-api.js";
import { AlertManager } from "./components/alert.js";
import { LoaderManager } from "./components/loader.js";
import { NavbarManager } from "./components/navbar.js";

/**
 * Clase principal de la aplicación
 */
class App {
  constructor() {
    this.router = null;
    this.authService = null;
    this.isInitialized = false;

    // Referencias a elementos del DOM
    this.elements = {
      mainContent: null,
      navbar: null,
      loadingOverlay: null,
      alertContainer: null,
    };

    // Estado de la aplicación
    this.state = {
      user: null,
      isAuthenticated: false,
      currentRoute: "/",
    };

    console.log("🚀 App: Inicializando aplicación...");
  }

  /**
   * Inicializar la aplicación
   */
  async init() {
    try {
      console.log("📋 App: Iniciando configuración...");

      // 1. Configurar referencias DOM
      this.setupDOMReferences();

      // 2. Inicializar servicios
      this.initializeServices();

      // 3. Configurar event listeners globales
      this.setupGlobalEventListeners();

      // 4. Verificar autenticación
      await this.checkAuthentication();

      // 5. Inicializar router
      this.initializeRouter();

      // 6. Configurar navbar
      this.setupNavbar();

      // 7. Marcar como inicializado
      this.isInitialized = true;

      console.log("✅ App: Aplicación inicializada correctamente");

      // Mostrar mensaje de bienvenida
      AlertManager.success("¡Aplicación cargada correctamente!");
    } catch (error) {
      console.error("❌ App: Error al inicializar aplicación:", error);
      AlertManager.error(
        "Error al cargar la aplicación. Por favor, recarga la página."
      );
    }
  }

  /**
   * Configurar referencias a elementos del DOM
   */
  setupDOMReferences() {
    console.log("🔗 App: Configurando referencias DOM...");

    this.elements = {
      mainContent: document.getElementById("main-content"),
      navbar: document.getElementById("navbar"),
      loadingOverlay: document.getElementById("loading-overlay"),
      alertContainer: document.getElementById("alert-container"),
    };

    // Verificar que todos los elementos existen
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        throw new Error(`Elemento DOM requerido no encontrado: ${key}`);
      }
    }

    console.log("✅ App: Referencias DOM configuradas");
  }

  /**
   * Inicializar servicios de la aplicación
   */
  initializeServices() {
    console.log("⚙️ App: Inicializando servicios...");

    // Inicializar servicio de autenticación
    this.authService = new AuthService();

    // Inicializar managers de componentes
    AlertManager.init(this.elements.alertContainer);
    LoaderManager.init(this.elements.loadingOverlay);

    console.log("✅ App: Servicios inicializados");
  }

  /**
   * Configurar event listeners globales
   */
  setupGlobalEventListeners() {
    console.log("👂 App: Configurando event listeners globales...");

    // Listener para errores globales
    window.addEventListener("error", (event) => {
      console.error("❌ Error global:", event.error);
      AlertManager.error("Ha ocurrido un error inesperado");
    });

    // Listener para errores de promesas
    window.addEventListener("unhandledrejection", (event) => {
      console.error("❌ Promesa rechazada:", event.reason);
      AlertManager.error("Error de conexión. Verifica tu internet.");
    });

    // Listener para cambios de conexión
    window.addEventListener("online", () => {
      AlertManager.success("Conexión restaurada");
    });

    window.addEventListener("offline", () => {
      AlertManager.warning("Sin conexión a internet");
    });

    // Listener para logout desde navbar
    document.addEventListener("click", (event) => {
      if (
        event.target.id === "logout-btn" ||
        event.target.closest("#logout-btn")
      ) {
        event.preventDefault();
        this.handleLogout();
      }
    });

    console.log("✅ App: Event listeners globales configurados");
  }

  /**
   * Verificar estado de autenticación al iniciar
   */
  async checkAuthentication() {
    console.log("🔐 App: Verificando autenticación...");

    try {
      const isAuthenticated = this.authService.isAuthenticated();

      if (isAuthenticated) {
        const user = this.authService.getUser();
        if (user) {
          this.updateAuthenticationState(user);
          console.log("✅ App: Usuario autenticado encontrado:", user.email);
        } else {
          // Token existe pero no hay datos de usuario, intentar obtenerlos
          await this.refreshUserData();
        }
      } else {
        console.log("ℹ️ App: Usuario no autenticado");
      }
    } catch (error) {
      console.error("❌ App: Error verificando autenticación:", error);
      this.authService.clearAuth();
    }
  }

  /**
   * Refrescar datos del usuario desde el servidor
   */
  async refreshUserData() {
    try {
      const response = await this.authService.getProfile();
      if (response.success) {
        this.updateAuthenticationState(response.data.user);
        console.log("✅ App: Datos de usuario actualizados");
      } else {
        throw new Error("No se pudieron obtener los datos del usuario");
      }
    } catch (error) {
      console.error("❌ App: Error obteniendo datos del usuario:", error);
      this.authService.clearAuth();
    }
  }

  /**
   * Actualizar estado de autenticación
   */
  updateAuthenticationState(user) {
    this.state.user = user;
    this.state.isAuthenticated = true;

    // Actualizar clases del body para mostrar/ocultar elementos
    document.body.classList.add("authenticated");
    document.body.classList.add(`role-${user.role}`);

    // Actualizar navbar
    if (this.navbar) {
      this.navbar.updateAuthState(user);
    }

    console.log(
      `✅ App: Estado de autenticación actualizado para ${user.role}: ${user.name}`
    );
  }

  /**
   * Limpiar estado de autenticación
   */
  clearAuthenticationState() {
    this.state.user = null;
    this.state.isAuthenticated = false;

    // Actualizar clases del body
    document.body.classList.remove("authenticated");
    document.body.classList.remove("role-profesor", "role-alumno");

    // Actualizar navbar
    if (this.navbar) {
      this.navbar.updateAuthState(null);
    }

    console.log("✅ App: Estado de autenticación limpiado");
  }

  /**
   * Inicializar el router
   */
  initializeRouter() {
    console.log("🧭 App: Inicializando router...");

    this.router = new Router(this.elements.mainContent, this);
    this.router.init();

    console.log("✅ App: Router inicializado");
  }

  /**
   * Configurar el navbar
   */
  setupNavbar() {
    console.log("🧩 App: Configurando navbar...");

    this.navbar = new NavbarManager(this.elements.navbar, this.router);
    this.navbar.init();

    // Actualizar con el estado actual de autenticación
    if (this.state.isAuthenticated) {
      this.navbar.updateAuthState(this.state.user);
    }

    console.log("✅ App: Navbar configurado");
  }

  /**
   * Manejar logout
   */
  async handleLogout() {
    try {
      console.log("🚪 App: Iniciando logout...");

      LoaderManager.show("Cerrando sesión...");

      const response = await this.authService.logout();

      if (response.success) {
        this.clearAuthenticationState();
        AlertManager.success("Sesión cerrada correctamente");

        // Redirigir a la página principal
        this.router.navigate("/");
      } else {
        throw new Error(response.message || "Error al cerrar sesión");
      }
    } catch (error) {
      console.error("❌ App: Error en logout:", error);
      AlertManager.error("Error al cerrar sesión");
    } finally {
      LoaderManager.hide();
    }
  }

  /**
   * Manejar login exitoso
   */
  handleLoginSuccess(user) {
    console.log("✅ App: Login exitoso para:", user.email);

    this.updateAuthenticationState(user);
    AlertManager.success(`¡Bienvenido, ${user.name}!`);

    // Redirigir al dashboard
    this.router.navigate("/dashboard");
  }

  /**
   * Obtener estado actual de la aplicación
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role) {
    return this.state.isAuthenticated && this.state.user?.role === role;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return this.state.isAuthenticated;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.state.user;
  }
}

// Instancia global de la aplicación
const app = new App();

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    app.init();
  });
} else {
  app.init();
}

// Exportar para uso global
window.App = app;

export default app;
