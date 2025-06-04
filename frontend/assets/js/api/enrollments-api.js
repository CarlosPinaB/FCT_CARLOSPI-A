/**
 * Enrollments API - Sistema de Actividades Extraescolares
 * Maneja todas las operaciones relacionadas con inscripciones
 */

class EnrollmentsAPI {
  constructor(httpClient) {
    this.http = httpClient;
    this.basePath = "activities";
  }

  /**
   * Inscribirse en una actividad (solo alumnos)
   */
  async enrollInActivity(activityId) {
    try {
      console.log(
        `📝 EnrollmentsAPI: Inscribiendo en actividad ${activityId}...`
      );

      const response = await this.http.post(
        `${this.basePath}/${activityId}/enroll`
      );

      console.log("✅ EnrollmentsAPI: Inscripción realizada exitosamente");
      return response.data;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error inscribiendo en actividad ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Cancelar inscripción en una actividad (solo alumnos)
   */
  async unenrollFromActivity(activityId) {
    try {
      console.log(
        `❌ EnrollmentsAPI: Cancelando inscripción en actividad ${activityId}...`
      );

      const response = await this.http.delete(
        `${this.basePath}/${activityId}/unenroll`
      );

      console.log("✅ EnrollmentsAPI: Inscripción cancelada exitosamente");
      return response.data;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error cancelando inscripción en actividad ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener mis inscripciones (solo alumnos)
   */
  async getMyEnrollments(filters = {}) {
    try {
      console.log("📋 EnrollmentsAPI: Obteniendo mis inscripciones...");

      const queryParams = new URLSearchParams();

      // Agregar filtros si existen
      if (filters.status) {
        queryParams.append("status", filters.status);
      }
      if (filters.start_date_from) {
        queryParams.append("start_date_from", filters.start_date_from);
      }
      if (filters.start_date_to) {
        queryParams.append("start_date_to", filters.start_date_to);
      }

      const url = queryParams.toString()
        ? `my-enrollments?${queryParams.toString()}`
        : "my-enrollments";

      const response = await this.http.get(url);

      console.log(
        `✅ EnrollmentsAPI: ${response.data.length} inscripciones obtenidas`
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ EnrollmentsAPI: Error obteniendo mis inscripciones:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener participantes de una actividad (solo profesores/autores)
   */
  async getActivityParticipants(activityId, filters = {}) {
    try {
      console.log(
        `👥 EnrollmentsAPI: Obteniendo participantes de actividad ${activityId}...`
      );

      const queryParams = new URLSearchParams();

      // Agregar filtros si existen
      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      const url = queryParams.toString()
        ? `${
            this.basePath
          }/${activityId}/participants?${queryParams.toString()}`
        : `${this.basePath}/${activityId}/participants`;

      const response = await this.http.get(url);

      console.log(
        `✅ EnrollmentsAPI: ${response.data.length} participantes obtenidos`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error obteniendo participantes de actividad ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Verificar si el usuario está inscrito en una actividad
   */
  async isEnrolledInActivity(activityId) {
    try {
      const enrollments = await this.getMyEnrollments({ status: "active" });

      return enrollments.some(
        (enrollment) =>
          enrollment.activity &&
          enrollment.activity.id === parseInt(activityId) &&
          enrollment.status === "active"
      );
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error verificando inscripción en actividad ${activityId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Obtener estadísticas de inscripciones para el dashboard
   */
  async getEnrollmentStats() {
    try {
      console.log(
        "📊 EnrollmentsAPI: Obteniendo estadísticas de inscripciones..."
      );

      const enrollments = await this.getMyEnrollments();

      const stats = {
        total: enrollments.length,
        active: enrollments.filter((e) => e.status === "active").length,
        cancelled: enrollments.filter((e) => e.status === "cancelled").length,
        this_month: enrollments.filter((e) => {
          const enrollmentDate = new Date(e.created_at);
          const now = new Date();
          return (
            enrollmentDate.getMonth() === now.getMonth() &&
            enrollmentDate.getFullYear() === now.getFullYear()
          );
        }).length,
        upcoming: enrollments.filter((e) => {
          const activityDate = new Date(e.activity.start_date);
          const now = new Date();
          return activityDate > now && e.status === "active";
        }).length,
      };

      console.log("✅ EnrollmentsAPI: Estadísticas calculadas", stats);
      return stats;
    } catch (error) {
      console.error("❌ EnrollmentsAPI: Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  /**
   * Obtener próximas actividades inscritas
   */
  async getUpcomingEnrollments(limit = 5) {
    try {
      const enrollments = await this.getMyEnrollments({ status: "active" });
      const now = new Date();

      return enrollments
        .filter(
          (enrollment) =>
            enrollment.activity &&
            new Date(enrollment.activity.start_date) > now
        )
        .sort(
          (a, b) =>
            new Date(a.activity.start_date) - new Date(b.activity.start_date)
        )
        .slice(0, limit);
    } catch (error) {
      console.error(
        "❌ EnrollmentsAPI: Error obteniendo próximas inscripciones:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener historial de inscripciones
   */
  async getEnrollmentHistory(limit = 10) {
    try {
      const enrollments = await this.getMyEnrollments();

      return enrollments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error("❌ EnrollmentsAPI: Error obteniendo historial:", error);
      throw error;
    }
  }

  /**
   * Verificar si una actividad está llena
   */
  async isActivityFull(activityId) {
    try {
      const participants = await this.getActivityParticipants(activityId, {
        status: "active",
      });

      // Obtener información de la actividad para conocer la capacidad
      const activityResponse = await this.http.get(
        `${this.basePath}/${activityId}`
      );
      const activity = activityResponse.data;

      if (!activity.capacity) {
        return false; // Sin límite de capacidad
      }

      return participants.length >= activity.capacity;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error verificando capacidad de actividad ${activityId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Obtener información de inscripción para una actividad específica
   */
  async getEnrollmentInfo(activityId) {
    try {
      const [isEnrolled, isFull, participants] = await Promise.all([
        this.isEnrolledInActivity(activityId),
        this.isActivityFull(activityId),
        this.getActivityParticipants(activityId, { status: "active" }).catch(
          () => []
        ),
      ]);

      return {
        isEnrolled,
        isFull,
        participantsCount: participants.length,
        canEnroll: !isEnrolled && !isFull,
      };
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error obteniendo info de inscripción para actividad ${activityId}:`,
        error
      );
      return {
        isEnrolled: false,
        isFull: false,
        participantsCount: 0,
        canEnroll: false,
      };
    }
  }

  /**
   * Formatear inscripción para mostrar
   */
  formatEnrollmentForDisplay(enrollment) {
    const enrollmentDate = new Date(enrollment.created_at);
    const activityStartDate = new Date(enrollment.activity.start_date);
    const now = new Date();

    return {
      ...enrollment,
      enrollment_date_formatted: enrollmentDate.toLocaleDateString("es-ES"),
      activity_start_formatted: activityStartDate.toLocaleDateString("es-ES"),
      is_upcoming: activityStartDate > now,
      is_past: activityStartDate < now,
      days_until_activity: Math.ceil(
        (activityStartDate - now) / (1000 * 60 * 60 * 24)
      ),
      status_text: enrollment.status === "active" ? "Inscrito" : "Cancelado",
      status_color: enrollment.status === "active" ? "success" : "warning",
    };
  }

  /**
   * Validar si se puede inscribir en una actividad
   */
  async validateEnrollment(activityId) {
    const errors = [];

    try {
      // Verificar si ya está inscrito
      const isEnrolled = await this.isEnrolledInActivity(activityId);
      if (isEnrolled) {
        errors.push("Ya estás inscrito en esta actividad");
      }

      // Verificar si la actividad está llena
      const isFull = await this.isActivityFull(activityId);
      if (isFull) {
        errors.push("La actividad ha alcanzado su capacidad máxima");
      }

      // Obtener información de la actividad
      const activityResponse = await this.http.get(
        `${this.basePath}/${activityId}`
      );
      const activity = activityResponse.data;

      // Verificar si la actividad está activa
      if (!activity.is_active) {
        errors.push("La actividad no está disponible para inscripciones");
      }

      // Verificar si la actividad ya empezó
      const startDate = new Date(activity.start_date);
      const now = new Date();
      if (startDate <= now) {
        errors.push(
          "No es posible inscribirse en actividades que ya han comenzado"
        );
      }
    } catch (error) {
      console.error("❌ EnrollmentsAPI: Error validando inscripción:", error);
      errors.push("Error verificando disponibilidad de la actividad");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exportar lista de participantes a CSV (para profesores)
   */
  async exportParticipantsToCSV(activityId) {
    try {
      console.log(
        `📄 EnrollmentsAPI: Exportando participantes de actividad ${activityId} a CSV...`
      );

      const participants = await this.getActivityParticipants(activityId);

      if (participants.length === 0) {
        throw new Error("No hay participantes para exportar");
      }

      // Crear CSV
      const headers = ["Nombre", "Email", "Fecha de Inscripción", "Estado"];
      const csvContent = [
        headers.join(","),
        ...participants.map((participant) =>
          [
            `"${participant.user.name}"`,
            `"${participant.user.email}"`,
            `"${new Date(participant.created_at).toLocaleDateString("es-ES")}"`,
            `"${participant.status === "active" ? "Activo" : "Cancelado"}"`,
          ].join(",")
        ),
      ].join("\n");

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `participantes-actividad-${activityId}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ EnrollmentsAPI: CSV exportado exitosamente");
      return true;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error exportando participantes:`,
        error
      );
      throw error;
    }
  }

  /**
   * Desinscribir un estudiante de una actividad (solo profesores)
   */
  async unenrollParticipant(enrollmentId) {
    try {
      console.log(
        `❌ EnrollmentsAPI: Desinscribiendo participante ${enrollmentId}...`
      );

      const response = await this.http.delete(
        `enrollments/${enrollmentId}/unenroll`
      );

      console.log("✅ EnrollmentsAPI: Participante desinscrito exitosamente");
      return response.data;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error desinscribiendo participante ${enrollmentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Reinscribir un estudiante cancelado en una actividad (solo profesores)
   */
  async reenrollParticipant(enrollmentId) {
    try {
      console.log(
        `✅ EnrollmentsAPI: Reinscribiendo participante ${enrollmentId}...`
      );

      const response = await this.http.patch(
        `enrollments/${enrollmentId}/reenroll`
      );

      console.log("✅ EnrollmentsAPI: Participante reinscrito exitosamente");
      return response.data;
    } catch (error) {
      console.error(
        `❌ EnrollmentsAPI: Error reinscribiendo participante ${enrollmentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener actividades recomendadas basadas en inscripciones previas
   */
  async getRecommendedActivities(limit = 5) {
    try {
      // Obtener mis inscripciones para analizar preferencias
      const myEnrollments = await this.getMyEnrollments();

      // Obtener categorías de actividades en las que me he inscrito
      const enrolledCategories = myEnrollments
        .map((enrollment) => enrollment.activity?.category_id)
        .filter((categoryId) => categoryId);

      // Obtener actividades públicas
      const allActivitiesResponse = await this.http.get(this.basePath);
      const allActivities = allActivitiesResponse.data;

      // Filtrar actividades recomendadas
      const recommendedActivities = allActivities
        .filter((activity) => {
          // Excluir actividades en las que ya estoy inscrito
          const isAlreadyEnrolled = myEnrollments.some(
            (enrollment) =>
              enrollment.activity?.id === activity.id &&
              enrollment.status === "active"
          );

          // Solo incluir actividades activas y futuras
          const isFuture = new Date(activity.start_date) > new Date();

          return !isAlreadyEnrolled && activity.is_active && isFuture;
        })
        .sort((a, b) => {
          // Priorizar actividades de categorías en las que ya me he inscrito
          const aInPreferredCategory = enrolledCategories.includes(
            a.category_id
          )
            ? 1
            : 0;
          const bInPreferredCategory = enrolledCategories.includes(
            b.category_id
          )
            ? 1
            : 0;

          if (aInPreferredCategory !== bInPreferredCategory) {
            return bInPreferredCategory - aInPreferredCategory;
          }

          // Luego por popularidad (número de inscritos)
          return (b.enrolled_count || 0) - (a.enrolled_count || 0);
        })
        .slice(0, limit);

      console.log(
        `✅ EnrollmentsAPI: ${recommendedActivities.length} actividades recomendadas obtenidas`
      );
      return recommendedActivities;
    } catch (error) {
      console.error(
        "❌ EnrollmentsAPI: Error obteniendo actividades recomendadas:",
        error
      );
      return [];
    }
  }

  /**
   * Obtener resumen de participación del usuario
   */
  async getParticipationSummary() {
    try {
      const enrollments = await this.getMyEnrollments();
      const now = new Date();

      const summary = {
        total_enrollments: enrollments.length,
        active_enrollments: enrollments.filter((e) => e.status === "active")
          .length,
        completed_activities: enrollments.filter(
          (e) =>
            e.status === "active" &&
            e.activity &&
            new Date(e.activity.end_date) < now
        ).length,
        upcoming_activities: enrollments.filter(
          (e) =>
            e.status === "active" &&
            e.activity &&
            new Date(e.activity.start_date) > now
        ).length,
        categories_explored: [
          ...new Set(
            enrollments.map((e) => e.activity?.category_id).filter((id) => id)
          ),
        ].length,
        most_recent_enrollment:
          enrollments.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )[0] || null,
      };

      return summary;
    } catch (error) {
      console.error(
        "❌ EnrollmentsAPI: Error obteniendo resumen de participación:",
        error
      );
      throw error;
    }
  }
}

// Exportar la clase usando ES6 modules
export { EnrollmentsAPI };
