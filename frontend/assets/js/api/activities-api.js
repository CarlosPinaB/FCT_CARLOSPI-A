/**
 * Activities API - Sistema de Actividades Extraescolares
 * Maneja todas las operaciones relacionadas con actividades
 */

class ActivitiesAPI {
  constructor(httpClient) {
    this.http = httpClient;
    this.basePath = "activities";
  }

  /**
   * Obtener todas las actividades públicas
   */
  async getPublicActivities(filters = {}) {
    try {
      console.log("🔍 ActivitiesAPI: Obteniendo actividades públicas...");

      const queryParams = new URLSearchParams();

      // Agregar filtros si existen
      if (filters.category_id) {
        queryParams.append("category_id", filters.category_id);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      if (filters.is_active !== undefined) {
        queryParams.append("is_active", filters.is_active);
      }

      const url = queryParams.toString()
        ? `${this.basePath}?${queryParams.toString()}`
        : this.basePath;

      const response = await this.http.get(url);

      console.log(
        `✅ ActivitiesAPI: ${response.data.length} actividades obtenidas`
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ ActivitiesAPI: Error obteniendo actividades públicas:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener actividades del profesor autenticado
   */
  async getMyActivities() {
    try {
      console.log("📋 ActivitiesAPI: Obteniendo mis actividades...");

      const response = await this.http.get("my-activities");

      console.log(
        `✅ ActivitiesAPI: ${response.data.length} actividades obtenidas`
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ ActivitiesAPI: Error obteniendo mis actividades:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener una actividad específica por ID
   */
  async getActivity(id) {
    try {
      console.log(`🔍 ActivitiesAPI: Obteniendo actividad ${id}...`);

      const response = await this.http.get(`${this.basePath}/${id}`);

      console.log(
        `✅ ActivitiesAPI: Actividad "${response.data.title}" obtenida`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ ActivitiesAPI: Error obteniendo actividad ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crear una nueva actividad
   */
  async createActivity(activityData) {
    try {
      console.log("➕ ActivitiesAPI: Creando nueva actividad...");

      // Validar datos requeridos
      this.validateActivityData(activityData);

      const response = await this.http.post(this.basePath, activityData);

      console.log(
        `✅ ActivitiesAPI: Actividad "${response.data.title}" creada exitosamente`
      );
      return response.data;
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error creando actividad:", error);
      throw error;
    }
  }

  /**
   * Actualizar una actividad existente
   */
  async updateActivity(id, activityData) {
    try {
      console.log(`✏️ ActivitiesAPI: Actualizando actividad ${id}...`);

      // Validar datos requeridos
      this.validateActivityData(activityData, false);

      const response = await this.http.put(
        `${this.basePath}/${id}`,
        activityData
      );

      console.log(
        `✅ ActivitiesAPI: Actividad "${response.data.title}" actualizada exitosamente`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ ActivitiesAPI: Error actualizando actividad ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Eliminar una actividad
   */
  async deleteActivity(id) {
    try {
      console.log(`🗑️ ActivitiesAPI: Eliminando actividad ${id}...`);

      await this.http.delete(`${this.basePath}/${id}`);

      console.log(`✅ ActivitiesAPI: Actividad ${id} eliminada exitosamente`);
      return true;
    } catch (error) {
      console.error(
        `❌ ActivitiesAPI: Error eliminando actividad ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener participantes de una actividad (solo profesores)
   */
  async getActivityParticipants(id) {
    try {
      console.log(
        `👥 ActivitiesAPI: Obteniendo participantes de actividad ${id}...`
      );

      const response = await this.http.get(
        `${this.basePath}/${id}/participants`
      );

      console.log(
        `✅ ActivitiesAPI: ${response.data.length} participantes obtenidos`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ ActivitiesAPI: Error obteniendo participantes de actividad ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Validar datos de actividad
   */
  validateActivityData(data, isCreate = true) {
    const errors = [];

    // Validaciones requeridas para creación
    if (isCreate) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push("El título es requerido");
      }
      if (!data.description || data.description.trim().length === 0) {
        errors.push("La descripción es requerida");
      }
      if (!data.category_id) {
        errors.push("La categoría es requerida");
      }
      if (!data.start_date) {
        errors.push("La fecha de inicio es requerida");
      }
      if (!data.end_date) {
        errors.push("La fecha de fin es requerida");
      }
    }

    // Validaciones comunes
    if (data.title && data.title.length > 255) {
      errors.push("El título no puede exceder 255 caracteres");
    }

    if (
      data.capacity &&
      (data.capacity < 1 || !Number.isInteger(data.capacity))
    ) {
      errors.push("La capacidad debe ser un número entero mayor a 0");
    }

    if (data.location && data.location.length > 255) {
      errors.push("La ubicación no puede exceder 255 caracteres");
    }

    // Validación de fechas
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push("La fecha de inicio no puede ser anterior a hoy");
      }

      if (endDate < startDate) {
        errors.push(
          "La fecha de fin no puede ser anterior a la fecha de inicio"
        );
      }
    }

    // Validación de horarios
    if (data.start_time && data.end_time) {
      const startTime = data.start_time.split(":");
      const endTime = data.end_time.split(":");

      const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
      const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);

      if (endMinutes <= startMinutes) {
        errors.push("La hora de fin debe ser posterior a la hora de inicio");
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }
  }

  /**
   * Formatear datos de actividad para envío al backend
   */
  formatActivityData(formData) {
    const data = {
      title: formData.title?.trim(),
      description: formData.description?.trim(),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      location: formData.location?.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      days_of_week: formData.days_of_week || null,
      image_url: formData.image_url?.trim() || null,
      is_active:
        formData.is_active !== undefined ? Boolean(formData.is_active) : true,
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
   * Obtener actividades con filtros avanzados
   */
  async getActivitiesWithFilters(filters = {}) {
    try {
      const {
        category_id,
        search,
        is_active,
        start_date_from,
        start_date_to,
        has_capacity,
        page = 1,
        per_page = 12,
      } = filters;

      const queryParams = new URLSearchParams();

      if (category_id) queryParams.append("category_id", category_id);
      if (search) queryParams.append("search", search);
      if (is_active !== undefined) queryParams.append("is_active", is_active);
      if (start_date_from)
        queryParams.append("start_date_from", start_date_from);
      if (start_date_to) queryParams.append("start_date_to", start_date_to);
      if (has_capacity !== undefined)
        queryParams.append("has_capacity", has_capacity);
      if (page) queryParams.append("page", page);
      if (per_page) queryParams.append("per_page", per_page);

      const url = `${this.basePath}?${queryParams.toString()}`;
      const response = await this.http.get(url);

      return {
        data: response.data,
        pagination: response.meta || {
          current_page: page,
          per_page: per_page,
          total: response.data.length,
        },
      };
    } catch (error) {
      console.error(
        "❌ ActivitiesAPI: Error obteniendo actividades con filtros:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividades para el dashboard
   */
  async getActivityStats() {
    try {
      console.log("📊 ActivitiesAPI: Obteniendo estadísticas...");

      // Para profesores, obtenemos sus actividades
      const activities = await this.getMyActivities();

      const stats = {
        total: activities.length,
        active: activities.filter((a) => a.is_active).length,
        inactive: activities.filter((a) => !a.is_active).length,
        this_month: activities.filter((a) => {
          const activityDate = new Date(a.start_date);
          const now = new Date();
          return (
            activityDate.getMonth() === now.getMonth() &&
            activityDate.getFullYear() === now.getFullYear()
          );
        }).length,
        total_participants: activities.reduce(
          (sum, activity) => sum + (activity.enrolled_count || 0),
          0
        ),
      };

      console.log("✅ ActivitiesAPI: Estadísticas calculadas", stats);
      return stats;
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  /**
   * Buscar actividades por texto
   */
  async searchActivities(query, filters = {}) {
    return this.getActivitiesWithFilters({
      ...filters,
      search: query,
    });
  }

  /**
   * Obtener actividades por categoría
   */
  async getActivitiesByCategory(categoryId, filters = {}) {
    return this.getActivitiesWithFilters({
      ...filters,
      category_id: categoryId,
    });
  }

  /**
   * Verificar si el usuario puede editar una actividad
   */
  async canEditActivity(activityId) {
    try {
      const activity = await this.getActivity(activityId);
      const user = window.app.auth.getCurrentUser();

      return user && user.role === "profesor" && activity.user_id === user.id;
    } catch (error) {
      console.error("❌ ActivitiesAPI: Error verificando permisos:", error);
      return false;
    }
  }

  /**
   * Obtener actividades populares (con más inscripciones)
   */
  async getPopularActivities(limit = 5) {
    try {
      const activities = await this.getPublicActivities({ is_active: true });

      return activities
        .sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0))
        .slice(0, limit);
    } catch (error) {
      console.error(
        "❌ ActivitiesAPI: Error obteniendo actividades populares:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener próximas actividades (por fecha de inicio)
   */
  async getUpcomingActivities(limit = 5) {
    try {
      const activities = await this.getPublicActivities({ is_active: true });
      const now = new Date();

      return activities
        .filter((activity) => new Date(activity.start_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, limit);
    } catch (error) {
      console.error(
        "❌ ActivitiesAPI: Error obteniendo próximas actividades:",
        error
      );
      throw error;
    }
  }
}

// Exportar la clase usando ES6 modules
export { ActivitiesAPI };
