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

  /* ---------- Hero: brick by brick ---------- */
  (function () {
    var top = $('#top'), wall = $('#bricks'), cv = $('#embers'), h1 = $('#hero-title');
    if (!top || !wall || !cv || !h1) return;
    var wide = window.innerWidth >= 900;
    var cx = wide ? 0.72 : 0.5;
    var cols = window.innerWidth < 700 ? 9 : 16, rows = 7, bricks = [];
    // split headline into letters
    var idx = 0;
    $$('.ln', h1).forEach(function (line) {
      var text = line.textContent; line.textContent = '';
      text.split(' ').forEach(function (word, wi, arr) {
        var w = document.createElement('span'); w.className = 'w';
        word.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'l'; s.textContent = ch; s.style.setProperty('--i', idx++); w.appendChild(s); });
        line.appendChild(w);
        if (wi < arr.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    h1.setAttribute('aria-label', 'We build trust. Lined for extreme heat.');
    wall.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    wall.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
      var b = document.createElement('div'); b.className = 'bk';
      b.style.setProperty('--d', ((rows - 1 - r) * 170 + Math.random() * 260) + 'ms');
      b.style.setProperty('--r', ((Math.random() - 0.5) * 40) + 'deg');
      b._x = (k + 0.5) / cols; b._y = (r + 0.5) / rows; wall.appendChild(b); bricks.push(b);
    }
    function heatUp() {
      bricks.forEach(function (b) {
        var dx = (b._x - cx) * 1.6, dy = b._y - 0.66, dist = Math.sqrt(dx * dx + dy * dy);
        var a = Math.max(0, 1 - dist * 1.8) * 0.78;
        b.style.backgroundColor = 'rgba(255,' + Math.round(90 + 90 * a) + ',26,' + (a * 0.9).toFixed(2) + ')';
        b.style.boxShadow = a > 0.3 ? '0 0 ' + Math.round(22 * a) + 'px rgba(255,107,26,' + (a * 0.7).toFixed(2) + ')' : 'none';
      });
    }
    if (reduce) { top.classList.add('static'); heatUp(); return; }
    top.classList.add('anim');
    setTimeout(heatUp, 2500);
    // embers
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], t0 = performance.now(), visible = true;
    function size() { var r = top.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(top);
    function spawn(n) {
      for (var i = 0; i < n; i++) {
        var spark = Math.random() < 0.12;
        parts.push({ x: W * (cx - 0.2 + Math.random() * 0.4), y: H + 8, vx: (Math.random() - 0.5) * (spark ? 2.4 : 0.7), vy: -(spark ? 3 + Math.random() * 3 : 0.7 + Math.random() * 1.6) * 1.1, life: 1, dec: (spark ? 0.012 : 0.004) + Math.random() * 0.004, s: spark ? 1 + Math.random() : 1.2 + Math.random() * 2.6, spark: spark, ph: Math.random() * 6.28 });
      }
    }
    function loop(ts) {
      if (!visible) return;
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      if (ts - t0 > 2700 && parts.length < 450) { var rate = 1.6, n = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0); spawn(n); }
      ctx.globalCompositeOperation = 'lighter';
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.life -= p.dec;
        if (p.life <= 0 || p.y < -10) { parts.splice(i, 1); continue; }
        p.ph += 0.05; p.x += p.vx + (p.spark ? 0 : Math.sin(p.ph) * 0.35); p.y += p.vy; if (p.spark) p.vy += 0.02;
        var a = Math.max(0, p.life);
        if (p.spark) { ctx.strokeStyle = 'rgba(255,' + Math.round(170 + 80 * a) + ',90,' + a + ')'; ctx.lineWidth = p.s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(255,' + Math.round(80 + 130 * a) + ',' + Math.round(20 + 40 * a) + ',' + (a * 0.85).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.6 + a * 0.6), 0, 6.283); ctx.fill(); }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(loop);
  })();
})();
