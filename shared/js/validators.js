/* Field validators (Spanish messages) and field error helper. */
(function (w, d) {
  'use strict';
  const P = w.Portal;

  P.validators = {
    email(v) {
      const s = String(v || '').trim();
      if (!s) return 'Ingresa tu correo.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Ingresa un correo válido.';
    },
    password: (v) => (v ? '' : 'Ingresa tu contraseña.'),
    reason: (v) => (String(v || '').length <= 200 ? '' : 'Máximo 200 caracteres.'),
  };

  /** Shows/clears the message in #<input.id>Error. Returns true when valid. */
  P.setFieldError = (input, msg) => {
    const el = d.getElementById(input.id + 'Error');
    if (el) el.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !msg;
  };
})(window, document);
