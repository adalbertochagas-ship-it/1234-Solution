/* Consentimento de cookies, 1234 Solution.
   Uso nas páginas da raiz:  <link rel="stylesheet" href="assets/consent.css">
                             <script src="assets/consent.js" defer></script>
   Em subpastas (por exemplo, /obrigado/), use caminho absoluto e data-policy:
        <link rel="stylesheet" href="https://1234solution.com.br/assets/consent.css">
        <script src="https://1234solution.com.br/assets/consent.js" data-policy="https://1234solution.com.br/privacidade.html" defer></script>
   Contêiner do Google Tag Manager: GTM-MSD952D8 (1234solution.com.br). Ele só é carregado depois do aceite.
   Só há uma categoria opcional: análise de audiência. Publicidade fica sempre negada.
   Reabrir as escolhas: qualquer elemento com o atributo data-consent-open, ou window.SolConsent.open(). */
(function () {
  'use strict';
  var script = document.currentScript;
  var GTM = 'GTM-MSD952D8';
  var POLICY = (script && script.getAttribute('data-policy')) || 'privacidade.html';
  var KEY = 'sol_consent_v1';
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var gtmLoaded = false;
  var root = null;

  // Google Consent Mode v2: tudo negado até haver escolha.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', wait_for_update: 500
  });

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || s.v !== 1 || typeof s.ts !== 'number' || Date.now() - s.ts > MAX_AGE) return null;
      return { analytics: !!s.analytics };
    } catch (e) { return null; }
  }
  function write(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), analytics: state.analytics }));
    } catch (e) { /* sem armazenamento: a escolha vale só nesta página */ }
  }

  function loadGTM() {
    if (gtmLoaded || !GTM) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM);
    document.head.appendChild(s);
  }

  var COOKIE_NAMES = /^(_ga|_gid|_gat|_gcl_)/;
  function clearTrackingCookies() {
    var parts = location.hostname.split('.');
    var domains = [location.hostname];
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!COOKIE_NAMES.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
      });
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  function apply(state, previous) {
    gtag('consent', 'update', {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.dataLayer.push({ event: 'sol_consent_update', sol_analytics: state.analytics });
    if (state.analytics) loadGTM();
    var revoked = previous && previous.analytics && !state.analytics;
    if (revoked) {
      clearTrackingCookies();
      if (gtmLoaded) window.location.reload();
    }
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function build() {
    if (root) return root;
    var title = el('h2', { 'class': 'acc-title', id: 'acc-title', tabindex: '-1', text: 'Sua privacidade' });
    var link = el('a', { href: POLICY, text: 'Política de Privacidade' });
    var text = el('p', { 'class': 'acc-text' });
    text.appendChild(document.createTextNode('O site funciona sem cookies de análise. Com a sua permissão, usamos o Google Analytics para entender, de forma agregada, como o site é usado e melhorá-lo. Você pode aceitar ou recusar, e mudar de ideia quando quiser em "Gerenciar cookies", no rodapé. Detalhes na '));
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));

    var reject = el('button', { type: 'button', 'class': 'acc-btn acc-ghost', 'data-acc': 'reject', text: 'Recusar' });
    var accept = el('button', { type: 'button', 'class': 'acc-btn', 'data-acc': 'accept', text: 'Aceitar' });
    var actions = el('div', { 'class': 'acc-actions' }, [reject, accept]);

    root = el('div', { 'class': 'acc-root', role: 'region', 'aria-labelledby': 'acc-title', hidden: '' }, [title, text, actions]);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acc]');
      if (!b) return;
      var a = b.getAttribute('data-acc');
      if (a === 'accept') decide({ analytics: true });
      else if (a === 'reject') decide({ analytics: false });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && read()) hide();
    });
    document.body.insertBefore(root, document.body.firstChild);
    return root;
  }

  function show(focus) {
    var r = build();
    r.removeAttribute('hidden');
    r.classList.remove('acc-in');
    void r.offsetWidth;
    r.classList.add('acc-in');
    if (focus) { r.querySelector('#acc-title').focus(); }
  }
  function hide() {
    if (!root) return;
    root.setAttribute('hidden', '');
  }
  function decide(state) {
    var previous = read();
    write(state);
    hide();
    apply(state, previous);
  }

  function init() {
    var saved = read();
    if (saved) apply(saved, null); else show(false);
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-consent-open]');
      if (!t) return;
      e.preventDefault();
      show(true);
    });
  }

  window.SolConsent = { open: function () { show(true); }, get: read };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
