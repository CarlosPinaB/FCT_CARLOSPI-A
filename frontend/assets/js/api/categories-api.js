/**
 * Categories API - Sistema de Actividades Extraescolares
 * Maneja todas las operaciones relacionadas con categorías
 */

class CategoriesAPI {
  constructor(httpClient) {
    this.http = httpClient;
    this.basePath = "categories";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtener todas las categorías (público)
   */
  async getAllCategories() {
    try {
      console.log("🏷️ CategoriesAPI: Obteniendo todas las categorías...");

      const response = await this.http.get(this.basePath);

      console.log(
        `✅ CategoriesAPI: ${response.data.length} categorías obtenidas`
      );
      return response.data;
    } catch (error) {
      console.error("❌ CategoriesAPI: Error obteniendo categorías:", error);
      throw error;
    }
  }

  /**
   * Alias para getAllCategories (compatibilidad)
   */
  async getCategories() {
    return this.getAllCategories();
  }

  /**
   * Obtener una categoría específica por ID
   */
  async getCategory(id) {
    try {
      console.log(`🔍 CategoriesAPI: Obteniendo categoría ${id}...`);

      const response = await this.http.get(`${this.basePath}/${id}`);

      console.log(
        `✅ CategoriesAPI: Categoría "${response.data.name}" obtenida`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ CategoriesAPI: Error obteniendo categoría ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crear una nueva categoría (solo profesores)
   */
  async createCategory(categoryData) {
    try {
      console.log("➕ CategoriesAPI: Creando nueva categoría...");

      // Validar datos requeridos
      this.validateCategoryData(categoryData);

      const response = await this.http.post(this.basePath, categoryData);

      console.log(
        `✅ CategoriesAPI: Categoría "${response.data.name}" creada exitosamente`
      );
      return response.data;
    } catch (error) {
      console.error("❌ CategoriesAPI: Error creando categoría:", error);
      throw error;
    }
  }

  /**
   * Actualizar una categoría existente (solo profesores)
   */
  async updateCategory(id, categoryData) {
    try {
      console.log(`✏️ CategoriesAPI: Actualizando categoría ${id}...`);

      // Validar datos requeridos
      this.validateCategoryData(categoryData, false);

      const response = await this.http.put(
        `${this.basePath}/${id}`,
        categoryData
      );

      console.log(
        `✅ CategoriesAPI: Categoría "${response.data.name}" actualizada exitosamente`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ CategoriesAPI: Error actualizando categoría ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Eliminar una categoría (solo profesores)
   */
  async deleteCategory(id) {
    try {
      console.log(`🗑️ CategoriesAPI: Eliminando categoría ${id}...`);

      await this.http.delete(`${this.basePath}/${id}`);

      console.log(`✅ CategoriesAPI: Categoría ${id} eliminada exitosamente`);
      return true;
    } catch (error) {
      console.error(
        `❌ CategoriesAPI: Error eliminando categoría ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Validar datos de categoría
   */
  validateCategoryData(data, isCreate = true) {
    const errors = [];

    // Validaciones requeridas para creación
    if (isCreate) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push("El nombre es requerido");
      }
    }

    // Validaciones comunes
    if (data.name) {
      if (data.name.length < 2) {
        errors.push("El nombre debe tener al menos 2 caracteres");
      }
      if (data.name.length > 100) {
        errors.push("El nombre no puede exceder 100 caracteres");
      }
    }

    if (data.description && data.description.length > 500) {
      errors.push("La descripción no puede exceder 500 caracteres");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }
  }

  /**
   * Formatear datos de categoría para envío al backend
   */
  formatCategoryData(formData) {
    const data = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || null,
    };

    // Remover campos null/undefined para actualizaciones parciales
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });

    return data;
  }

  /**
   * Obtener categorías con estadísticas de actividades
   */
  async getCategoriesWithStats() {
    try {
      console.log(
        "📊 CategoriesAPI: Obteniendo categorías con estadísticas..."
      );

      // Obtener todas las categorías
      const categories = await this.getAllCategories();

      // Agregar estadísticas si están disponibles
      const categoriesWithStats = categories.map((category) => ({
        ...category,
        activities_count: category.activities_count || 0,
        active_activities_count: category.active_activities_count || 0,
      }));

      console.log("✅ CategoriesAPI: Categorías con estadísticas obtenidas");
      return categoriesWithStats;
    } catch (error) {
      console.error(
        "❌ CategoriesAPI: Error obteniendo categorías con estadísticas:",
        error
      );
      throw error;
    }
  }

  /**
   * Buscar categorías por nombre
   */
  async searchCategories(query) {
    try {
      console.log(`🔍 CategoriesAPI: Buscando categorías por "${query}"...`);

      const categories = await this.getAllCategories();

      const filteredCategories = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(query.toLowerCase()))
      );

      console.log(
        `✅ CategoriesAPI: ${filteredCategories.length} categorías encontradas`
      );
      return filteredCategories;
    } catch (error) {
      console.error("❌ CategoriesAPI: Error buscando categorías:", error);
      throw error;
    }
  }

  /**
   * Obtener categorías más populares (con más actividades)
   */
  async getPopularCategories(limit = 5) {
    try {
      const categories = await this.getCategoriesWithStats();

      return categories
        .sort((a, b) => (b.activities_count || 0) - (a.activities_count || 0))
        .slice(0, limit);
    } catch (error) {
      console.error(
        "❌ CategoriesAPI: Error obteniendo categorías populares:",
        error
      );
      throw error;
    }
  }

  /**
   * Verificar si una categoría puede ser eliminada
   */
  async canDeleteCategory(categoryId) {
    try {
      const category = await this.getCategory(categoryId);

      // Una categoría puede eliminarse si no tiene actividades asociadas
      // o si el usuario tiene permisos de profesor
      return (category.activities_count || 0) === 0;
    } catch (error) {
      console.error(
        "❌ CategoriesAPI: Error verificando si se puede eliminar:",
        error
      );
      return false;
    }
  }

  /**
   * Formatear categoría para mostrar en select options
   */
  formatCategoriesForSelect(categories) {
    return categories.map((category) => ({
      value: category.id,
      text: category.name,
      description: category.description,
    }));
  }

  /**
   * Obtener categorías activas (que tienen al menos una actividad activa)
   */
  async getActiveCategories() {
    try {
      const categories = await this.getCategoriesWithStats();

      return categories.filter(
        (category) => (category.active_activities_count || 0) > 0
      );
    } catch (error) {
      console.error(
        "❌ CategoriesAPI: Error obteniendo categorías activas:",
        error
      );
      throw error;
    }
  }

  /**
   * Cache simple para categorías (para evitar múltiples llamadas)
   */
  static cache = {
    categories: null,
    timestamp: null,
    expiry: 5 * 60 * 1000, // 5 minutos
  };

  /**
   * Obtener categorías con cache
   */
  async getCategoriesWithCache() {
    const now = Date.now();

    // Verificar si tenemos datos en cache válidos
    if (
      CategoriesAPI.cache.categories &&
      CategoriesAPI.cache.timestamp &&
      now - CategoriesAPI.cache.timestamp < CategoriesAPI.cache.expiry
    ) {
      console.log("📄 CategoriesAPI: Usando categorías desde cache");
      return CategoriesAPI.cache.categories;
    }

    // Obtener datos frescos
    try {
      const categories = await this.getAllCategories();

      // Actualizar cache
      CategoriesAPI.cache.categories = categories;
      CategoriesAPI.cache.timestamp = now;

      console.log("💾 CategoriesAPI: Cache de categorías actualizado");
      return categories;
    } catch (error) {
      // Si hay error y tenemos cache, devolver cache aunque esté expirado
      if (CategoriesAPI.cache.categories) {
        console.warn(
          "⚠️ CategoriesAPI: Error obteniendo categorías, usando cache expirado"
        );
        return CategoriesAPI.cache.categories;
      }
      throw error;
    }
  }

  /**
   * Limpiar cache de categorías
   */
  static clearCache() {
    CategoriesAPI.cache.categories = null;
    CategoriesAPI.cache.timestamp = null;
    console.log("🗑️ CategoriesAPI: Cache limpiado");
  }

  /**
   * Invalidar cache después de operaciones de escritura
   */
  invalidateCache() {
    CategoriesAPI.clearCache();
  }

  /**
   * Crear categoría y limpiar cache
   */
  async createCategoryAndInvalidateCache(categoryData) {
    const result = await this.createCategory(categoryData);
    this.invalidateCache();
    return result;
  }

  /**
   * Actualizar categoría y limpiar cache
   */
  async updateCategoryAndInvalidateCache(id, categoryData) {
    const result = await this.updateCategory(id, categoryData);
    this.invalidateCache();
    return result;
  }

  /**
   * Eliminar categoría y limpiar cache
   */
  async deleteCategoryAndInvalidateCache(id) {
    const result = await this.deleteCategory(id);
    this.invalidateCache();
    return result;
  }
}

// Exportar la clase usando ES6 modules
export { CategoriesAPI };
