/* Consentimento de cookies, Adalberto Chagas Academy.
   Uso: <link rel="stylesheet" href="assets/consent.css">
        <script src="assets/consent.js" defer></script>
   Em outras páginas (por exemplo, /diagnostico/), use o caminho absoluto e data-policy:
        <script src="https://adalbertochagas.com.br/assets/consent.js" data-policy="https://adalbertochagas.com.br/privacidade.html" defer></script>
   ID DO GOOGLE TAG MANAGER: preencha só a linha GTM_ID abaixo, depois de criar o contêiner.
   Enquanto GTM_ID estiver vazio, nenhuma ferramenta de terceiros é carregada, mesmo com aceite.
   Reabrir as escolhas: qualquer elemento com o atributo data-consent-open, ou window.ACConsent.open(). */
(function () {
  'use strict';
  var script = document.currentScript;
  var GTM_ID = 'GTM-MXRBCXCV'; // contêiner adalbertochagas.com.br
  var GTM = (GTM_ID || (script && script.getAttribute('data-gtm')) || '').trim();
  var POLICY = (script && script.getAttribute('data-policy')) || 'privacidade.html';
  var KEY = 'ac_consent_v1';
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
      return { analytics: !!s.analytics, ads: !!s.ads };
    } catch (e) { return null; }
  }
  function write(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), analytics: state.analytics, ads: state.ads }));
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

  var COOKIE_NAMES = /^(_ga|_gid|_gat|_gcl_|_fbp|_fbc|li_fat_id|_gac_)/;
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
      ad_storage: state.ads ? 'granted' : 'denied',
      ad_user_data: state.ads ? 'granted' : 'denied',
      ad_personalization: state.ads ? 'granted' : 'denied'
    });
    window.dataLayer.push({ event: 'ac_consent_update', ac_analytics: state.analytics, ac_ads: state.ads });
    if (state.analytics || state.ads) loadGTM();
    var revoked = previous && ((previous.analytics && !state.analytics) || (previous.ads && !state.ads));
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
  function row(id, title, desc, checked) {
    var input = el('input', { type: 'checkbox', id: id, role: 'switch', 'aria-describedby': id + '-d' });
    input.checked = !!checked;
    return el('div', { 'class': 'acc-row' }, [
      el('div', {}, [el('h3', { text: title }), el('p', { id: id + '-d', text: desc })]),
      el('label', { 'class': 'acc-switch', 'aria-label': title }, [input, el('span', { 'class': 'acc-track', 'aria-hidden': 'true' })])
    ]);
  }

  function build() {
    if (root) return root;
    var title = el('h2', { 'class': 'acc-title', id: 'acc-title', tabindex: '-1', text: 'Sua privacidade' });
    var link = el('a', { href: POLICY, text: 'Política de Privacidade' });
    var text = el('p', { 'class': 'acc-text' });
    text.appendChild(document.createTextNode('O site funciona sem cookies de análise ou de publicidade. Com a sua permissão, usamos cookies de análise, para entender como o site é usado, e de publicidade, para medir e melhorar os nossos anúncios. Você pode aceitar, recusar ou escolher. Detalhes na '));
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));

    var reject = el('button', { type: 'button', 'class': 'acc-btn', 'data-acc': 'reject', text: 'Recusar tudo' });
    var custom = el('button', { type: 'button', 'class': 'acc-btn acc-ghost', 'data-acc': 'custom', 'aria-expanded': 'false', 'aria-controls': 'acc-panel', text: 'Personalizar' });
    var accept = el('button', { type: 'button', 'class': 'acc-btn', 'data-acc': 'accept', text: 'Aceitar tudo' });
    var actions = el('div', { 'class': 'acc-actions' }, [reject, custom, accept]);

    var fixed = el('div', { 'class': 'acc-row' }, [
      el('div', {}, [el('h3', { text: 'Necessários' }), el('p', { text: 'Guardam apenas a sua escolha sobre cookies, para não perguntar de novo.' })]),
      el('span', { 'class': 'acc-fixed', text: 'Sempre ativos' })
    ]);
    var save = el('button', { type: 'button', 'class': 'acc-btn', 'data-acc': 'save', text: 'Salvar escolhas' });
    var panel = el('div', { 'class': 'acc-panel', id: 'acc-panel', hidden: '' }, [
      fixed,
      row('acc-analytics', 'Análise de audiência', 'Google Analytics, por meio do Google Tag Manager. Mostram, de forma agregada, como o site é usado.', false),
      row('acc-ads', 'Publicidade', 'Google Ads, Meta (Facebook e Instagram) e LinkedIn. Medem os resultados dos anúncios e permitem mostrar anúncios relevantes.', false),
      el('div', { 'class': 'acc-actions' }, [save])
    ]);

    root = el('div', { 'class': 'acc-root', role: 'region', 'aria-labelledby': 'acc-title', hidden: '' }, [title, text, actions, panel]);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acc]');
      if (!b) return;
      var a = b.getAttribute('data-acc');
      if (a === 'custom') {
        var open = panel.hasAttribute('hidden');
        if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
        custom.setAttribute('aria-expanded', open ? 'true' : 'false');
      } else if (a === 'accept') decide({ analytics: true, ads: true });
      else if (a === 'reject') decide({ analytics: false, ads: false });
      else if (a === 'save') decide({ analytics: root.querySelector('#acc-analytics').checked, ads: root.querySelector('#acc-ads').checked });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && read()) hide();
    });
    document.body.insertBefore(root, document.body.firstChild);
    return root;
  }

  function show(focus) {
    var r = build();
    var cur = read() || { analytics: false, ads: false };
    r.querySelector('#acc-analytics').checked = cur.analytics;
    r.querySelector('#acc-ads').checked = cur.ads;
    r.removeAttribute('hidden');
    r.classList.remove('acc-in');
    void r.offsetWidth;
    r.classList.add('acc-in');
    if (focus) { r.querySelector('#acc-title').focus(); }
  }
  function hide() {
    if (!root) return;
    root.setAttribute('hidden', '');
    var p = root.querySelector('#acc-panel');
    p.setAttribute('hidden', '');
    root.querySelector('[data-acc="custom"]').setAttribute('aria-expanded', 'false');
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
      var p = root.querySelector('#acc-panel');
      p.removeAttribute('hidden');
      root.querySelector('[data-acc="custom"]').setAttribute('aria-expanded', 'true');
    });
  }

  window.ACConsent = { open: function () { show(true); }, get: read };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
