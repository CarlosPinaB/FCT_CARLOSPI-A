/**
 * API de Categorías - Sistema de Actividades Extraescolares
 * Maneja las operaciones de categorías
 */

import { HttpClient } from "./http-client.js";

export class CategoriesAPI {
  constructor() {
    this.httpClient = new HttpClient();
    this.baseUrl = "/categories";
    console.log("🏷️ CategoriesAPI: Inicializada");
  }

  /**
   * Obtener todas las categorías (público)
   */
  async getAll() {
    try {
      console.log("🏷️ CategoriesAPI: Obteniendo todas las categorías");

      const response = await this.httpClient.get(this.baseUrl);

      if (response.success) {
        console.log(
          `✅ CategoriesAPI: ${response.data.length} categorías obtenidas`
        );
        return response;
      } else {
        console.warn(
          "❌ CategoriesAPI: Error obteniendo categorías:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ CategoriesAPI: Error en getAll:", error);
      throw error;
    }
  }

  /**
   * Obtener una categoría por ID (público)
   */
  async getById(id) {
    try {
      console.log(`🏷️ CategoriesAPI: Obteniendo categoría ${id}`);

      const response = await this.httpClient.get(`${this.baseUrl}/${id}`);

      if (response.success) {
        console.log(
          "✅ CategoriesAPI: Categoría obtenida:",
          response.data.name
        );
        return response;
      } else {
        console.warn(
          "❌ CategoriesAPI: Error obteniendo categoría:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ CategoriesAPI: Error en getById:", error);
      throw error;
    }
  }

  /**
   * Crear nueva categoría (solo profesores)
   */
  async create(categoryData) {
    try {
      console.log(
        "🏷️ CategoriesAPI: Creando nueva categoría:",
        categoryData.name
      );

      const response = await this.httpClient.post(this.baseUrl, categoryData);

      if (response.success) {
        console.log(
          "✅ CategoriesAPI: Categoría creada exitosamente:",
          response.data.name
        );
        return response;
      } else {
        console.warn(
          "❌ CategoriesAPI: Error creando categoría:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ CategoriesAPI: Error en create:", error);
      throw error;
    }
  }

  /**
   * Actualizar categoría existente (solo profesores)
   */
  async update(id, categoryData) {
    try {
      console.log(
        `🏷️ CategoriesAPI: Actualizando categoría ${id}:`,
        categoryData.name
      );

      const response = await this.httpClient.put(
        `${this.baseUrl}/${id}`,
        categoryData
      );

      if (response.success) {
        console.log("✅ CategoriesAPI: Categoría actualizada exitosamente");
        return response;
      } else {
        console.warn(
          "❌ CategoriesAPI: Error actualizando categoría:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ CategoriesAPI: Error en update:", error);
      throw error;
    }
  }

  /**
   * Eliminar categoría (solo profesores)
   */
  async delete(id) {
    try {
      console.log(`🏷️ CategoriesAPI: Eliminando categoría ${id}`);

      const response = await this.httpClient.delete(`${this.baseUrl}/${id}`);

      if (response.success) {
        console.log("✅ CategoriesAPI: Categoría eliminada exitosamente");
        return response;
      } else {
        console.warn(
          "❌ CategoriesAPI: Error eliminando categoría:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ CategoriesAPI: Error en delete:", error);
      throw error;
    }
  }

  /**
   * Formatear categorías para dropdown/select
   */
  formatForSelect(categories) {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
      icon: this.getCategoryIcon(category.name),
    }));
  }

  /**
   * Obtener ícono según el nombre de la categoría
   */
  getCategoryIcon(categoryName) {
    const iconMap = {
      Deportes: "fas fa-running",
      Tecnología: "fas fa-laptop-code",
      Arte: "fas fa-palette",
      Música: "fas fa-music",
      Idiomas: "fas fa-language",
      Ciencias: "fas fa-microscope",
      Literatura: "fas fa-book-open",
      Cocina: "fas fa-utensils",
      Fotografía: "fas fa-camera",
      Teatro: "fas fa-theater-masks",
    };

    return iconMap[categoryName] || "fas fa-tag";
  }

  /**
   * Obtener color según el nombre de la categoría
   */
  getCategoryColor(categoryName) {
    const colorMap = {
      Deportes: "success",
      Tecnología: "primary",
      Arte: "warning",
      Música: "info",
      Idiomas: "secondary",
      Ciencias: "dark",
      Literatura: "danger",
      Cocina: "warning",
      Fotografía: "info",
      Teatro: "primary",
    };

    return colorMap[categoryName] || "secondary";
  }
}

export default CategoriesAPI;
