/**
 * API de Actividades - Sistema de Actividades Extraescolares
 * Maneja todas las operaciones CRUD de actividades
 */

import { HttpClient } from "./http-client.js";

export class ActivitiesAPI {
  constructor() {
    this.httpClient = new HttpClient();
    this.baseUrl = "/activities";
    console.log("📚 ActivitiesAPI: Inicializada");
  }

  /**
   * Obtener todas las actividades (público)
   */
  async getAll(filters = {}) {
    try {
      console.log("📚 ActivitiesAPI: Obteniendo todas las actividades");

      // Construir query string para filtros
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await this.httpClient.get(url);

      if (response.success) {
        console.log(
          `✅ ActivitiesAPI: ${
            response.data.data?.length || 0
          } actividades obtenidas`
        );
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error obteniendo actividades:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en getAll:", error);
      throw error;
    }
  }

  /**
   * Obtener una actividad por ID (público)
   */
  async getById(id) {
    try {
      console.log(`📚 ActivitiesAPI: Obteniendo actividad ${id}`);

      const response = await this.httpClient.get(`${this.baseUrl}/${id}`);

      if (response.success) {
        console.log(
          "✅ ActivitiesAPI: Actividad obtenida:",
          response.data.title
        );
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error obteniendo actividad:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en getById:", error);
      throw error;
    }
  }

  /**
   * Obtener actividades del profesor autenticado (protegido)
   */
  async getMyActivities() {
    try {
      console.log("📚 ActivitiesAPI: Obteniendo mis actividades");

      const response = await this.httpClient.get("/my-activities");

      if (response.success) {
        console.log(
          `✅ ActivitiesAPI: ${response.data.length} actividades propias obtenidas`
        );
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error obteniendo mis actividades:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en getMyActivities:", error);
      throw error;
    }
  }

  /**
   * Crear nueva actividad (solo profesores)
   */
  async create(activityData) {
    try {
      console.log(
        "📚 ActivitiesAPI: Creando nueva actividad:",
        activityData.title
      );

      const response = await this.httpClient.post(this.baseUrl, activityData);

      if (response.success) {
        console.log(
          "✅ ActivitiesAPI: Actividad creada exitosamente:",
          response.data.title
        );
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error creando actividad:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en create:", error);
      throw error;
    }
  }

  /**
   * Actualizar actividad existente (solo autor)
   */
  async update(id, activityData) {
    try {
      console.log(
        `📚 ActivitiesAPI: Actualizando actividad ${id}:`,
        activityData.title
      );

      const response = await this.httpClient.put(
        `${this.baseUrl}/${id}`,
        activityData
      );

      if (response.success) {
        console.log("✅ ActivitiesAPI: Actividad actualizada exitosamente");
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error actualizando actividad:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en update:", error);
      throw error;
    }
  }

  /**
   * Eliminar actividad (solo autor)
   */
  async delete(id) {
    try {
      console.log(`📚 ActivitiesAPI: Eliminando actividad ${id}`);

      const response = await this.httpClient.delete(`${this.baseUrl}/${id}`);

      if (response.success) {
        console.log("✅ ActivitiesAPI: Actividad eliminada exitosamente");
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error eliminando actividad:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en delete:", error);
      throw error;
    }
  }

  /**
   * Obtener participantes de una actividad (solo autor)
   */
  async getParticipants(id) {
    try {
      console.log(
        `📚 ActivitiesAPI: Obteniendo participantes de actividad ${id}`
      );

      const response = await this.httpClient.get(
        `${this.baseUrl}/${id}/participants`
      );

      if (response.success) {
        console.log(
          `✅ ActivitiesAPI: ${response.data.length} participantes obtenidos`
        );
        return response;
      } else {
        console.warn(
          "❌ ActivitiesAPI: Error obteniendo participantes:",
          response.message
        );
        return response;
      }
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error en getParticipants:", error);
      throw error;
    }
  }

  /**
   * Validar datos de actividad antes de enviar
   */
  validateActivityData(data) {
    const errors = [];

    // Validaciones básicas
    if (!data.title || data.title.trim().length < 3) {
      errors.push("El título debe tener al menos 3 caracteres");
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    }

    if (!data.category_id) {
      errors.push("Debes seleccionar una categoría");
    }

    if (!data.start_date) {
      errors.push("La fecha de inicio es requerida");
    }

    if (!data.end_date) {
      errors.push("La fecha de fin es requerida");
    }

    // Validación de fechas
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const now = new Date();

      if (startDate < now) {
        errors.push("La fecha de inicio debe ser futura");
      }

      if (endDate <= startDate) {
        errors.push("La fecha de fin debe ser posterior a la de inicio");
      }
    }

    // Validación de participantes
    if (data.max_participants && data.max_participants < 1) {
      errors.push("El máximo de participantes debe ser al menos 1");
    }

    if (data.max_participants && data.max_participants > 100) {
      errors.push("El máximo de participantes no puede exceder 100");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formatear datos de actividad para envío
   */
  formatActivityData(formData) {
    return {
      title: formData.title?.trim(),
      description: formData.description?.trim(),
      category_id: parseInt(formData.category_id),
      start_date: formData.start_date,
      end_date: formData.end_date,
      max_participants: formData.max_participants
        ? parseInt(formData.max_participants)
        : null,
      location: formData.location?.trim() || null,
    };
  }

  /**
   * Formatear actividad para mostrar
   */
  formatActivityForDisplay(activity) {
    return {
      ...activity,
      start_date_formatted: this.formatDate(activity.start_date),
      end_date_formatted: this.formatDate(activity.end_date),
      duration: this.calculateDuration(activity.start_date, activity.end_date),
      spots_remaining: activity.max_participants
        ? activity.max_participants - (activity.enrollments_count || 0)
        : null,
      is_full: activity.max_participants
        ? (activity.enrollments_count || 0) >= activity.max_participants
        : false,
      has_started: new Date(activity.start_date) <= new Date(),
      has_ended: new Date(activity.end_date) <= new Date(),
    };
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Calcular duración entre fechas
   */
  calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "1 día";
    } else if (diffDays < 7) {
      return `${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} semana${weeks > 1 ? "s" : ""}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} mes${months > 1 ? "es" : ""}`;
    }
  }
}

export default ActivitiesAPI;
