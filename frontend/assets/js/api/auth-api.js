/**
 * Servicio de Autenticación
 * Maneja login, registro, logout y gestión de tokens
 */

import { HttpClient } from "./http-client.js";
import { StorageManager } from "../utils/storage.js";

export class AuthService {
  constructor() {
    this.httpClient = new HttpClient();
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

      if (response.success) {
        // Guardar token y datos del usuario
        this.setToken(response.data.token);
        this.setUser(response.data.user);

        // Configurar token en httpClient
        this.httpClient.setAuthToken(response.data.token);

        console.log("✅ AuthService: Login exitoso");
        return {
          success: true,
          data: response.data,
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

      if (response.success) {
        // Guardar token y datos del usuario
        this.setToken(response.data.token);
        this.setUser(response.data.user);

        // Configurar token en httpClient
        this.httpClient.setAuthToken(response.data.token);

        console.log("✅ AuthService: Registro exitoso");
        return {
          success: true,
          data: response.data,
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

      const response = await this.httpClient.get("/me");

      if (response.success) {
        // Actualizar datos del usuario en storage
        this.setUser(response.data.user);

        console.log("✅ AuthService: Perfil obtenido");
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.message || "Error obteniendo perfil");
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
      console.log("📝 AuthService: Actualizando perfil...");

      const response = await this.httpClient.put("/me", userData);

      if (response.success) {
        // Actualizar datos del usuario en storage
        this.setUser(response.data.user);

        console.log("✅ AuthService: Perfil actualizado");
        return {
          success: true,
          data: response.data,
          message: "Perfil actualizado correctamente",
        };
      } else {
        throw new Error(response.message || "Error actualizando perfil");
      }
    } catch (error) {
      console.error("❌ AuthService: Error actualizando perfil:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        errors: error.errors || null,
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      console.log("🔒 AuthService: Cambiando contraseña...");

      const response = await this.httpClient.put("/change-password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        console.log("✅ AuthService: Contraseña cambiada");
        return {
          success: true,
          message: "Contraseña cambiada correctamente",
        };
      } else {
        throw new Error(response.message || "Error cambiando contraseña");
      }
    } catch (error) {
      console.error("❌ AuthService: Error cambiando contraseña:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        errors: error.errors || null,
      };
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

export default AuthService;
