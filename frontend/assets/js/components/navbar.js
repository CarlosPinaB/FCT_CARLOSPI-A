/**
 * Navbar Manager - Manejo del navbar y navegación
 */

export class NavbarManager {
  constructor(navbar, router) {
    this.navbar = navbar;
    this.router = router;
    this.initialized = false;
  }

  /**
   * Inicializar el navbar
   */
  init() {
    this.setupEventListeners();
    this.initialized = true;
    console.log("✅ NavbarManager: Navbar inicializado");
  }

  /**
   * Configurar event listeners del navbar
   */
  setupEventListeners() {
    // Event listener para navegación
    this.navbar.addEventListener("click", (event) => {
      const routeLink = event.target.closest("[data-route]");
      if (routeLink) {
        event.preventDefault();
        const route = routeLink.getAttribute("data-route");
        this.router.navigate(route);
      }
    });

    // Event listener para colapsar navbar en móviles después de click
    this.navbar.addEventListener("click", (event) => {
      const navLink = event.target.closest(".nav-link");
      if (navLink) {
        const navbarCollapse = this.navbar.querySelector(".navbar-collapse");
        const navbarToggler = this.navbar.querySelector(".navbar-toggler");

        if (navbarCollapse && navbarToggler) {
          // Cerrar navbar en móviles
          if (!navbarCollapse.classList.contains("show")) return;

          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }
      }
    });
  }

  /**
   * Actualizar estado de autenticación en el navbar
   */
  updateAuthState(user) {
    const guestElements = this.navbar.querySelectorAll(".guest-only");
    const authElements = this.navbar.querySelectorAll(".auth-only");
    const profesorElements = this.navbar.querySelectorAll(".profesor-only");
    const alumnoElements = this.navbar.querySelectorAll(".alumno-only");
    const userNameElement = this.navbar.querySelector("#user-name");

    if (user) {
      // Usuario autenticado
      guestElements.forEach((el) => (el.style.display = "none"));
      authElements.forEach((el) => {
        el.style.display = "block";
        el.classList.remove("d-none");
      });

      // Actualizar nombre de usuario
      if (userNameElement) {
        userNameElement.textContent = user.name;
      }

      // Mostrar elementos según rol
      if (user.role === "profesor") {
        profesorElements.forEach((el) => (el.style.display = "block"));
        alumnoElements.forEach((el) => (el.style.display = "none"));
      } else if (user.role === "alumno") {
        profesorElements.forEach((el) => (el.style.display = "none"));
        alumnoElements.forEach((el) => (el.style.display = "block"));
      }
    } else {
      // Usuario no autenticado
      guestElements.forEach((el) => (el.style.display = "block"));
      authElements.forEach((el) => {
        el.style.display = "none";
        el.classList.add("d-none");
      });
      profesorElements.forEach((el) => (el.style.display = "none"));
      alumnoElements.forEach((el) => (el.style.display = "none"));

      // Limpiar nombre de usuario
      if (userNameElement) {
        userNameElement.textContent = "Usuario";
      }
    }
  }

  /**
   * Actualizar enlace activo
   */
  updateActiveLink(currentPath) {
    // Remover clases activas
    this.navbar.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Agregar clase activa al enlace actual
    const activeLink = this.navbar.querySelector(
      `[data-route="${currentPath}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  /**
   * Mostrar indicador de carga en navbar
   */
  showLoading() {
    const navbar = this.navbar.querySelector(".navbar-brand");
    if (navbar) {
      const originalContent = navbar.innerHTML;
      navbar.innerHTML = `
        <i class="fas fa-spinner fa-spin me-2"></i>
        Cargando...
      `;

      // Restaurar después de un tiempo
      setTimeout(() => {
        navbar.innerHTML = originalContent;
      }, 1000);
    }
  }

  /**
   * Agregar notificación badge
   */
  addNotificationBadge(elementSelector, count) {
    const element = this.navbar.querySelector(elementSelector);
    if (element && count > 0) {
      // Remover badge existente
      const existingBadge = element.querySelector(".notification-badge");
      if (existingBadge) {
        existingBadge.remove();
      }

      // Agregar nuevo badge
      const badge = document.createElement("span");
      badge.className =
        "notification-badge badge bg-danger position-absolute top-0 start-100 translate-middle";
      badge.style.fontSize = "0.7rem";
      badge.textContent = count > 99 ? "99+" : count;

      element.style.position = "relative";
      element.appendChild(badge);
    }
  }

  /**
   * Remover notificación badge
   */
  removeNotificationBadge(elementSelector) {
    const element = this.navbar.querySelector(elementSelector);
    if (element) {
      const badge = element.querySelector(".notification-badge");
      if (badge) {
        badge.remove();
      }
    }
  }
}

export default NavbarManager;
