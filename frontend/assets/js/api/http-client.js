/**
 * Cliente HTTP - Comunicación con Laravel API
 * Maneja todas las peticiones HTTP con el backend
 */

export class HttpClient {
  constructor(baseURL = "http://localhost:8000/api") {
    this.baseURL = baseURL;
    this.token = null;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  /**
   * Configurar token de autorización
   */
  setAuthToken(token) {
    this.token = token;
  }

  /**
   * Remover token de autorización
   */
  removeAuthToken() {
    this.token = null;
  }

  /**
   * Obtener headers para la petición
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Construir URL completa
   */
  buildURL(endpoint) {
    // Remover slash inicial si existe
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Manejar respuesta HTTP
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP Error: ${response.status}`);
      error.status = response.status;
      error.response = data;
      error.errors = data.errors || null;
      throw error;
    }

    return data;
  }

  /**
   * Realizar petición HTTP genérica
   */
  async request(method, endpoint, options = {}) {
    const {
      data = null,
      headers = {},
      timeout = 10000,
      signal = null,
    } = options;

    try {
      console.log(`🌐 HttpClient: ${method} ${endpoint}`);

      // Configurar opciones de fetch
      const fetchOptions = {
        method: method.toUpperCase(),
        headers: this.getHeaders(headers),
        signal: signal || AbortSignal.timeout(timeout),
      };

      // Agregar body si hay datos
      if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
        if (data instanceof FormData) {
          // Para FormData, no establecer Content-Type (se hace automáticamente)
          delete fetchOptions.headers["Content-Type"];
          fetchOptions.body = data;
        } else {
          fetchOptions.body = JSON.stringify(data);
        }
      }

      // Realizar petición
      const response = await fetch(this.buildURL(endpoint), fetchOptions);
      const result = await this.handleResponse(response);

      console.log(`✅ HttpClient: ${method} ${endpoint} - Success`);
      return result;
    } catch (error) {
      console.error(`❌ HttpClient: ${method} ${endpoint} - Error:`, error);

      // Manejar diferentes tipos de errores
      if (error.name === "AbortError") {
        throw new Error("Tiempo de espera agotado");
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Error de conexión. Verifica tu internet.");
      }

      throw error;
    }
  }

  /**
   * Realizar petición GET
   */
  async get(endpoint, options = {}) {
    return this.request("GET", endpoint, options);
  }

  /**
   * Realizar petición POST
   */
  async post(endpoint, data = null, options = {}) {
    return this.request("POST", endpoint, { ...options, data });
  }

  /**
   * Realizar petición PUT
   */
  async put(endpoint, data = null, options = {}) {
    return this.request("PUT", endpoint, { ...options, data });
  }

  /**
   * Realizar petición PATCH
   */
  async patch(endpoint, data = null, options = {}) {
    return this.request("PATCH", endpoint, { ...options, data });
  }

  /**
   * Realizar petición DELETE
   */
  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, options);
  }

  /**
   * Subir archivo
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Agregar datos adicionales
    for (const [key, value] of Object.entries(additionalData)) {
      formData.append(key, value);
    }

    return this.post(endpoint, formData);
  }

  /**
   * Realizar múltiples peticiones en paralelo
   */
  async parallel(requests) {
    const promises = requests.map(({ method, endpoint, data, options }) =>
      this.request(method, endpoint, { ...options, data })
    );

    return Promise.allSettled(promises);
  }

  /**
   * Petición con reintentos
   */
  async requestWithRetry(method, endpoint, options = {}, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request(method, endpoint, options);
      } catch (error) {
        lastError = error;

        // No reintentar en ciertos errores
        if (
          error.status === 401 ||
          error.status === 403 ||
          error.status === 422
        ) {
          throw error;
        }

        if (attempt < maxRetries) {
          console.log(
            `🔄 HttpClient: Reintento ${attempt}/${maxRetries} para ${method} ${endpoint}`
          );
          // Esperar antes del siguiente intento (backoff exponencial)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Verificar conectividad
   */
  async ping() {
    try {
      await this.get("/ping", { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de la API
   */
  async getApiInfo() {
    return this.get("/info");
  }

  /**
   * Configurar interceptores de petición
   */
  setRequestInterceptor(interceptor) {
    this.requestInterceptor = interceptor;
  }

  /**
   * Configurar interceptores de respuesta
   */
  setResponseInterceptor(interceptor) {
    this.responseInterceptor = interceptor;
  }

  /**
   * Limpiar cache si es necesario
   */
  clearCache() {
    // Implementar cache clearing si se agrega cache en el futuro
    console.log("🧹 HttpClient: Cache limpiado");
  }
}

export default HttpClient;
