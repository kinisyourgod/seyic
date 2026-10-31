(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu drawer ---------- */
  var drawer = $('#drawer');
  function setMenu(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Stats count-up ---------- */
  var stats = $('#stats');
  if (stats && !reduce && 'IntersectionObserver' in window) {
    var counters = $$('[data-count]', stats);
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      if (done || !entries.some(function (en) { return en.isIntersecting; })) return;
      done = true;
      io.disconnect();
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / 1600);
        var e = 1 - Math.pow(1 - p, 3);
        counters.forEach(function (c) {
          var to = +c.getAttribute('data-count');
          var from = +c.getAttribute('data-from') || 0;
          c.textContent = Math.round(from + (to - from) * e) + (c.getAttribute('data-suffix') || '');
        });
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.3 });
    io.observe(stats);
  }

  /* ---------- Swipeable galleries ---------- */
  $$('[data-gallery]').forEach(function (g) {
    var track = $('[data-track]', g);
    var n = track.children.length;
    var counter = $('[data-counter]', g);
    var dots = $$('[data-dot]', g);
    var cur = 0;
    function show(i) {
      cur = (i + n) % n;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      if (counter) counter.textContent = (cur + 1) + ' / ' + n;
      dots.forEach(function (d, k) { d.firstChild.style.background = k === cur ? '#FF6B1A' : '#3a4046'; });
    }
    var prev = $('[data-prev]', g), next = $('[data-next]', g);
    if (prev) prev.addEventListener('click', function () { show(cur - 1); });
    if (next) next.addEventListener('click', function () { show(cur + 1); });
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.getAttribute('data-dot')); }); });
    var area = $('[data-swipe]', g), sx = null;
    function start(e) { sx = (e.touches && e.touches[0] ? e.touches[0] : e).clientX; }
    function end(e) {
      if (sx === null) return;
      var x = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e).clientX;
      var d = x - sx; sx = null;
      if (Math.abs(d) > 40) show(cur + (d < 0 ? 1 : -1));
    }
    area.addEventListener('touchstart', start, { passive: true });
    area.addEventListener('touchend', end);
    area.addEventListener('mousedown', start);
    area.addEventListener('mouseup', end);
    area.addEventListener('mouseleave', function () { sx = null; });
  });

  /* ---------- Contact form validation ---------- */
  var form = $('#enquiry');
  if (form) {
    var F = {
      name: $('#n'), email: $('#e'), phone: $('#ph'), message: $('#m')
    };
    var errEl = { name: $('#n-err'), email: $('#e-err'), phone: $('#ph-err'), message: $('#m-err') };
    function validate() {
      var e = {};
      var name = F.name.value.trim(), email = F.email.value.trim(), phone = F.phone.value.trim(), msg = F.message.value.trim();
      if (!name) e.name = 'Please enter your name.';
      else if (name.length < 2) e.name = 'Your name looks too short.';
      if (!email) e.email = 'Please enter your email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Enter a valid email, like name@company.com.';
      if (phone) {
        var digits = phone.replace(/\D/g, '');
        if (!/^[+\d\s()-]+$/.test(phone) || digits.length < 7 || digits.length > 15) e.phone = 'Enter a valid phone number, like +234 803 000 0000.';
      }
      if (!msg) e.message = 'Please tell us about your project.';
      else if (msg.length < 10) e.message = 'Please write at least 10 characters.';
      return e;
    }
    function paint(errs) {
      Object.keys(F).forEach(function (k) {
        var has = !!errs[k];
        errEl[k].hidden = !has;
        errEl[k].textContent = errs[k] || '';
        F[k].style.borderColor = has ? '#FF6B6B' : '#3a4046';
        F[k].setAttribute('aria-invalid', has ? 'true' : 'false');
      });
    }
    var touched = false;
    Object.keys(F).forEach(function (k) {
      F[k].addEventListener('input', function () { if (touched) paint(validate()); });
    });
    var status = $('#form-status'), success = $('#form-success');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      touched = true;
      var errs = validate();
      paint(errs);
      if (Object.keys(errs).length) {
        var first = Object.keys(errs)[0];
        F[first].focus();
        return;
      }
      status.hidden = true;
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        status.hidden = false;
        status.style.color = '#FF6B6B';
        status.textContent = 'This form is not connected yet. Add your Formspree form ID to the form (see README).';
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('bad');
          form.hidden = true;
          success.hidden = false;
          form.reset();
          touched = false;
          paint({});
        })
        .catch(function () {
          status.hidden = false;
          status.style.color = '#FF6B6B';
          status.textContent = 'Sorry, your message could not be sent. Please try again or use WhatsApp.';
        })
        .then(function () { btn.disabled = false; });
    });
    var again = $('#form-again');
    if (again) again.addEventListener('click', function () { success.hidden = true; form.hidden = false; });
  }
})();
