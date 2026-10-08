/* Login: validation, 400/401/429 handling, session save and redirect. */
(function (w) {
  'use strict';
  const P = w.Portal;

  const REASONS = {
    expired: ['Tu sesión venció. Inicia sesión nuevamente.', 'info'],
    inactive: ['Cerramos tu sesión por inactividad.', 'info'],
    unauthorized: ['Tu sesión ya no es válida. Inicia sesión nuevamente.', 'info'],
    logout: ['Cerraste sesión correctamente.', 'success'],
  };

  P.ready(() => {
    const form = P.$('#loginForm');
    const email = P.$('#email');
    const pass = P.$('#password');
    const btn = P.$('#loginBtn');
    const box = P.$('#loginAlert');
    const caps = P.$('#capsHint');
    const toggle = P.$('#togglePassword');
    const card = P.$('#loginCard');
    const fields = [[email, P.validators.email], [pass, P.validators.password]];

    const showAlert = (text, type = 'error') => {
      box.className = 'alert alert--' + type;
      box.setAttribute('role', type === 'error' ? 'alert' : 'status');
      box.replaceChildren(P.icon(type === 'error' ? 'alert' : type === 'success' ? 'check' : 'info'), P.h('span', {}, text));
      box.hidden = false;
    };
    const hideAlert = () => { box.hidden = true; };
    const shake = () => {
      card.classList.remove('shake');
      void card.offsetWidth; // restart animation
      card.classList.add('shake');
    };

    const reason = REASONS[P.params.get('reason')];
    if (reason) showAlert(reason[0], reason[1]);

    fields.forEach(([input, fn]) => {
      input.addEventListener('blur', () => P.setFieldError(input, fn(input.value)));
      input.addEventListener('input', () => {
        if (input.hasAttribute('aria-invalid')) P.setFieldError(input, fn(input.value));
      });
    });

    toggle.addEventListener('click', () => {
      const show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      toggle.replaceChildren(P.icon(show ? 'eye-off' : 'eye'));
    });

    pass.addEventListener('keyup', (e) => { caps.hidden = !(e.getModifierState && e.getModifierState('CapsLock')); });
    pass.addEventListener('blur', () => { caps.hidden = true; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();
      const results = fields.map(([input, fn]) => P.setFieldError(input, fn(input.value)));
      if (results.includes(false)) {
        (fields.find(([i]) => i.hasAttribute('aria-invalid')) || [])[0].focus();
        shake();
        return;
      }

      P.setLoading(btn, true);
      try {
        const res = await P.api.post('/api/auth/login', { email: email.value.trim(), password: pass.value }, { auth: false });
        P.session.save(res.data);
        showAlert('¡Bienvenido! Entrando al portal…', 'success');
        w.location.replace(P.path('dashboard/'));
      } catch (err) {
        P.setLoading(btn, false);
        if (err.status === 400) {
          const map = P.api.fieldErrors(err);
          if (map.email) P.setFieldError(email, map.email);
          if (map.password) P.setFieldError(pass, map.password);
          if (!map.email && !map.password) showAlert(err.message);
        } else {
          showAlert(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message);
          if (err.status === 401) { pass.value = ''; pass.focus(); }
        }
        shake();
      }
    });
  });
})(window);
