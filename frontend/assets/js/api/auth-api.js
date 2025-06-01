/**
 * Servicio de Autenticación
 * Maneja login, registro, logout y gestión de tokens
 */

import { HttpClient } from "./http-client.js";
import { StorageManager } from "../utils/storage.js";

export class AuthService {
  constructor(httpClient = null) {
    this.httpClient = httpClient || new HttpClient();
    this.storageManager = new StorageManager();

    // Configurar token automáticamente si existe
    const token = this.getToken();
    if (token) {
      this.httpClient.setAuthToken(token);
    }
  }

  /**
   * Realizar login
   */
  async login(email, password) {
    try {
      console.log("🔐 AuthService: Iniciando login...");

      const response = await this.httpClient.post("/login", {
        email: email.trim(),
        password: password,
      });

      // El backend Laravel retorna { user, token } directamente en caso de éxito
      if (response.user && response.token) {
        // Guardar token y datos del usuario
        this.setToken(response.token);
        this.setUser(response.user);

        // Configurar token en httpClient
        this.httpClient.setAuthToken(response.token);

        console.log("✅ AuthService: Login exitoso");
        return {
          success: true,
          data: response,
          message: "Login exitoso",
        };
      } else {
        throw new Error(response.message || "Error en login");
      }
    } catch (error) {
      console.error("❌ AuthService: Error en login:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        errors: error.errors || null,
      };
    }
  }

  /**
   * Realizar registro
   */
  async register(userData) {
    try {
      console.log("📝 AuthService: Iniciando registro...");

      const response = await this.httpClient.post("/register", {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        role: userData.role,
      });

      // El backend Laravel retorna { user, token } directamente en caso de éxito
      if (response.user && response.token) {
        // Guardar token y datos del usuario
        this.setToken(response.token);
        this.setUser(response.user);

        // Configurar token en httpClient
        this.httpClient.setAuthToken(response.token);

        console.log("✅ AuthService: Registro exitoso");
        return {
          success: true,
          data: response,
          message: "Registro exitoso",
        };
      } else {
        throw new Error(response.message || "Error en registro");
      }
    } catch (error) {
      console.error("❌ AuthService: Error en registro:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        errors: error.errors || null,
      };
    }
  }

  /**
   * Realizar logout
   */
  async logout() {
    try {
      console.log("🚪 AuthService: Iniciando logout...");

      // Intentar logout en el servidor
      const response = await this.httpClient.post("/logout");

      // Limpiar datos locales independientemente de la respuesta del servidor
      this.clearAuth();

      console.log("✅ AuthService: Logout completado");
      return {
        success: true,
        message: "Logout exitoso",
      };
    } catch (error) {
      console.error("❌ AuthService: Error en logout:", error);

      // Aún así limpiar datos locales
      this.clearAuth();

      return {
        success: true, // Consideramos exitoso porque limpiamos localmente
        message: "Sesión cerrada localmente",
      };
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    try {
      console.log("👤 AuthService: Obteniendo perfil...");

      // El endpoint real es /user según las rutas de Laravel
      const response = await this.httpClient.get("/user");

      // Laravel retorna directamente el objeto User
      if (response && response.id) {
        // Actualizar datos del usuario en storage
        this.setUser(response);

        console.log("✅ AuthService: Perfil obtenido");
        return {
          success: true,
          data: { user: response },
        };
      } else {
        throw new Error("Error obteniendo perfil");
      }
    } catch (error) {
      console.error("❌ AuthService: Error obteniendo perfil:", error);

      // Si es error de autorización, limpiar auth
      if (error.status === 401) {
        this.clearAuth();
      }

      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData) {
    try {
      console.log("👤 AuthService: Actualizando perfil...");

      const response = await this.httpClient.put("/profile", userData);

      if (response && response.user) {
        // Actualizar datos del usuario en storage
        this.setUser(response.user);

        console.log("✅ AuthService: Perfil actualizado");
        return response.user;
      } else {
        throw new Error("Error actualizando perfil");
      }
    } catch (error) {
      console.error("❌ AuthService: Error actualizando perfil:", error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(passwordData) {
    try {
      console.log("🔐 AuthService: Cambiando contraseña...");

      const response = await this.httpClient.put("/profile/password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });

      console.log("✅ AuthService: Contraseña cambiada");
      return response;
    } catch (error) {
      console.error("❌ AuthService: Error cambiando contraseña:", error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Obtener token de autenticación
   */
  getToken() {
    return this.storageManager.getToken();
  }

  /**
   * Obtener datos del usuario
   */
  getUser() {
    return this.storageManager.getUser();
  }

  /**
   * Guardar token
   */
  setToken(token) {
    this.storageManager.setToken(token);
  }

  /**
   * Guardar datos del usuario
   */
  setUser(user) {
    this.storageManager.setUser(user);
  }

  /**
   * Limpiar toda la autenticación
   */
  clearAuth() {
    this.storageManager.clear();
    this.httpClient.removeAuthToken();
    console.log("🧹 AuthService: Datos de autenticación limpiados");
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Verificar si el token ha expirado (básico)
   */
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar payload JWT (simplificado)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      return payload.exp && payload.exp < now;
    } catch (error) {
      console.error("Error verificando expiración del token:", error);
      return true;
    }
  }

  /**
   * Refrescar token si es necesario
   */
  async refreshTokenIfNeeded() {
    if (this.isTokenExpired()) {
      console.log("🔄 AuthService: Token expirado, limpiando auth...");
      this.clearAuth();
      return false;
    }
    return true;
  }

  /**
   * Obtener mensaje de error legible
   */
  getErrorMessage(error) {
    if (error.message) {
      return error.message;
    }

    switch (error.status) {
      case 401:
        return "Credenciales incorrectas";
      case 422:
        return "Datos inválidos. Verifica los campos.";
      case 429:
        return "Demasiados intentos. Intenta más tarde.";
      case 500:
        return "Error del servidor. Intenta más tarde.";
      default:
        return "Error de conexión. Verifica tu internet.";
    }
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
