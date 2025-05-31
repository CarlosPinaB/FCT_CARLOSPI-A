/**
 * Storage Manager - Manejo de localStorage
 * Gestiona el almacenamiento de tokens, datos de usuario y configuraciones
 */

export class StorageManager {
  constructor() {
    this.keys = {
      token: "activities_auth_token",
      user: "activities_user_data",
      preferences: "activities_preferences",
      cache: "activities_cache",
    };
  }

  /**
   * Verificar si localStorage está disponible
   */
  isAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn("localStorage no disponible:", error);
      return false;
    }
  }

  /**
   * Guardar dato en localStorage
   */
  setItem(key, value) {
    if (!this.isAvailable()) return false;

    try {
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now(),
        version: "1.0",
      });
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error("Error guardando en localStorage:", error);
      return false;
    }
  }

  /**
   * Obtener dato de localStorage
   */
  getItem(key) {
    if (!this.isAvailable()) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Verificar estructura del dato
      if (typeof parsed === "object" && parsed.value !== undefined) {
        return parsed.value;
      }

      // Compatibilidad con datos antiguos
      return parsed;
    } catch (error) {
      console.error("Error leyendo de localStorage:", error);
      this.removeItem(key); // Limpiar dato corrupto
      return null;
    }
  }

  /**
   * Remover dato de localStorage
   */
  removeItem(key) {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removiendo de localStorage:", error);
      return false;
    }
  }

  /**
   * Limpiar todo el storage
   */
  clear() {
    if (!this.isAvailable()) return false;

    try {
      // Solo limpiar las claves de la aplicación
      Object.values(this.keys).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error limpiando localStorage:", error);
      return false;
    }
  }

  /**
   * Guardar token de autenticación
   */
  setToken(token) {
    return this.setItem(this.keys.token, token);
  }

  /**
   * Obtener token de autenticación
   */
  getToken() {
    return this.getItem(this.keys.token);
  }

  /**
   * Remover token de autenticación
   */
  removeToken() {
    return this.removeItem(this.keys.token);
  }

  /**
   * Guardar datos del usuario
   */
  setUser(user) {
    return this.setItem(this.keys.user, user);
  }

  /**
   * Obtener datos del usuario
   */
  getUser() {
    return this.getItem(this.keys.user);
  }

  /**
   * Remover datos del usuario
   */
  removeUser() {
    return this.removeItem(this.keys.user);
  }

  /**
   * Guardar preferencias del usuario
   */
  setPreferences(preferences) {
    return this.setItem(this.keys.preferences, preferences);
  }

  /**
   * Obtener preferencias del usuario
   */
  getPreferences() {
    return this.getItem(this.keys.preferences) || {};
  }

  /**
   * Actualizar una preferencia específica
   */
  setPreference(key, value) {
    const preferences = this.getPreferences();
    preferences[key] = value;
    return this.setPreferences(preferences);
  }

  /**
   * Obtener una preferencia específica
   */
  getPreference(key, defaultValue = null) {
    const preferences = this.getPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  /**
   * Guardar datos en cache temporal
   */
  setCache(key, data, expirationMinutes = 60) {
    const cache = this.getCache();
    cache[key] = {
      data,
      expires: Date.now() + expirationMinutes * 60 * 1000,
    };
    return this.setItem(this.keys.cache, cache);
  }

  /**
   * Obtener datos del cache
   */
  getCacheItem(key) {
    const cache = this.getCache();
    const item = cache[key];

    if (!item) return null;

    // Verificar si expiró
    if (Date.now() > item.expires) {
      delete cache[key];
      this.setItem(this.keys.cache, cache);
      return null;
    }

    return item.data;
  }

  /**
   * Obtener todo el cache
   */
  getCache() {
    return this.getItem(this.keys.cache) || {};
  }

  /**
   * Limpiar cache expirado
   */
  clearExpiredCache() {
    const cache = this.getCache();
    const now = Date.now();
    let hasExpired = false;

    for (const key in cache) {
      if (cache[key].expires < now) {
        delete cache[key];
        hasExpired = true;
      }
    }

    if (hasExpired) {
      this.setItem(this.keys.cache, cache);
    }
  }

  /**
   * Obtener tamaño utilizado en localStorage
   */
  getStorageSize() {
    if (!this.isAvailable()) return 0;

    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    return totalSize;
  }

  /**
   * Verificar si hay espacio disponible
   */
  hasSpace(sizeNeeded = 1024) {
    try {
      const testData = "x".repeat(sizeNeeded);
      const testKey = "__space_test__";
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Exportar todos los datos de la aplicación
   */
  exportData() {
    const data = {};

    Object.entries(this.keys).forEach(([name, key]) => {
      const value = this.getItem(key);
      if (value !== null) {
        data[name] = value;
      }
    });

    return {
      data,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  }

  /**
   * Importar datos de la aplicación
   */
  importData(exportedData) {
    if (!exportedData || !exportedData.data) {
      throw new Error("Datos de importación inválidos");
    }

    let imported = 0;

    Object.entries(exportedData.data).forEach(([name, value]) => {
      if (this.keys[name]) {
        if (this.setItem(this.keys[name], value)) {
          imported++;
        }
      }
    });

    console.log(`✅ StorageManager: ${imported} elementos importados`);
    return imported;
  }

  /**
   * Obtener información del storage
   */
  getInfo() {
    return {
      available: this.isAvailable(),
      size: this.getStorageSize(),
      hasToken: !!this.getToken(),
      hasUser: !!this.getUser(),
      cacheItems: Object.keys(this.getCache()).length,
      preferences: Object.keys(this.getPreferences()).length,
    };
  }
}

export default StorageManager;
