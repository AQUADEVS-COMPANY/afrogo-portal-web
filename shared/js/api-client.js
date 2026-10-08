/* API client: Bearer + timezone headers, timeout, blob support, centralized errors. */
(function (w) {
  'use strict';
  const P = w.Portal;
  const TIMEOUT = 20000;

  /** type: 'network' | 'timeout' | 'http' */
  class ApiError extends Error {
    constructor(type, status, data, message) {
      super(message);
      this.name = 'ApiError';
      this.type = type;
      this.status = status;
      this.data = data;
      this.errors = data && Array.isArray(data.errors) ? data.errors : [];
    }
  }

  const MESSAGES = {
    400: 'Revisa los datos ingresados.',
    401: 'Tu sesión ya no es válida.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'No encontramos lo que buscas.',
    409: 'La solicitud ya fue procesada.',
    413: 'El archivo es demasiado grande.',
    429: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    500: 'Ocurrió un problema en el servidor. Inténtalo más tarde.',
  };

  const timezone = () => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima'; } catch (_) { return 'America/Lima'; }
  };

  async function parseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return { message: text }; }
  }

  async function request(path, { method = 'GET', json, auth = true, asBlob = false, timeout = TIMEOUT } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const headers = { Accept: asBlob ? 'application/pdf, application/json' : 'application/json' };
    let body;
    if (json !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(json);
    }
    if (auth) {
      headers.Authorization = 'Bearer ' + P.session.token();
      headers['x-timezone'] = timezone();
    }
    try {
      const res = await fetch(P.config.apiBaseUrl + path, { method, headers, body, signal: ctrl.signal });
      if (res.ok) return asBlob ? await res.blob() : await parseBody(res);

      const data = await parseBody(res);
      if (res.status === 401 && auth) P.session.logout('unauthorized'); // expired/invalid token
      const serverMsg = data && typeof data.message === 'string' && res.status < 500 ? data.message : '';
      throw new ApiError('http', res.status, data, serverMsg || MESSAGES[res.status] || MESSAGES[500]);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err.name === 'AbortError') throw new ApiError('timeout', 0, null, 'La solicitud tardó demasiado. Inténtalo de nuevo.');
      throw new ApiError('network', 0, null, 'No pudimos conectarnos. Revisa tu internet.');
    } finally {
      clearTimeout(timer);
    }
  }

  P.ApiError = ApiError;
  P.api = {
    get: (path, opts) => request(path, Object.assign({ method: 'GET' }, opts)),
    post: (path, json, opts) => request(path, Object.assign({ method: 'POST', json }, opts)),
    /** Authenticated PDF download as Blob (iframe/anchor cannot send the token). */
    blob: (path) => request(path, { asBlob: true, timeout: 60000 }),
    /** { field: message } from an ApiError. */
    fieldErrors(err) {
      const out = {};
      (err.errors || []).forEach((e) => { if (e.field && !out[e.field]) out[e.field] = e.message; });
      return out;
    },
  };
})(window);
