/* Léman Studio · interactions */
(function () {
  "use strict";
  var doc = document.documentElement;
  var motion = doc.classList.contains("js-motion");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Défilement doux */
  var lenis = null;
  if (motion && window.Lenis && !matchMedia("(pointer: coarse)").matches) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -90 }); }
      });
    });
  }

  /* En-tête : solide après le héros, masqué en descendant */
  var hdr = $(".hdr");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) {
      hdr.classList.toggle("is-solid", y > 40);
      var hide = y > 480 && y > lastY + 4 && !doc.classList.contains("menu-open") && !$(".nav__drop.is-open");
      if (y < lastY - 4 || y < 480) hdr.classList.remove("is-hidden");
      else if (hide) hdr.classList.add("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = doc.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (lenis) open ? lenis.stop() : lenis.start();
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mnav a").forEach(function (a) { a.addEventListener("click", function () { doc.classList.remove("menu-open"); document.body.style.overflow = ""; if (lenis) lenis.start(); }); });
  }

  /* Méga-menu */
  $$(".nav__drop").forEach(function (d) {
    var b = $("button", d);
    var t;
    var set = function (o) { d.classList.toggle("is-open", o); b.setAttribute("aria-expanded", o ? "true" : "false"); };
    b.addEventListener("click", function (e) { e.stopPropagation(); set(!d.classList.contains("is-open")); });
    if (matchMedia("(hover: hover)").matches) {
      d.addEventListener("mouseenter", function () { clearTimeout(t); set(true); });
      d.addEventListener("mouseleave", function () { t = setTimeout(function () { set(false); }, 180); });
    }
    document.addEventListener("click", function (e) { if (!d.contains(e.target)) set(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      $$(".nav__drop.is-open").forEach(function (d) { d.classList.remove("is-open"); $("button", d).focus(); });
      if (doc.classList.contains("menu-open") && burger) burger.click();
    }
  });

  /* Apparitions */
  var rv = $$(".rv");
  if (rv.length && "IntersectionObserver" in window && motion) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("is-in"); });

  /* Iframes de démos mises à l'échelle */
  var frames = $$(".work__frame");
  function scaleFrames() {
    frames.forEach(function (f) {
      var ifr = $("iframe", f);
      if (ifr) ifr.style.transform = "scale(" + (f.clientWidth / 1440) + ")";
    });
  }
  if (frames.length) {
    scaleFrames();
    if ("ResizeObserver" in window) { var ro = new ResizeObserver(scaleFrames); frames.forEach(function (f) { ro.observe(f); }); }
    window.addEventListener("resize", scaleFrames);
    window.addEventListener("load", scaleFrames);
  }

  /* Sommaire actif (articles) */
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          toc.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[e.target.id]; if (a) a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) tio.observe(h); });
  }

  /* Blog : filtres + recherche */
  var grid = $("[data-posts]");
  if (grid) {
    var cards = $$("[data-cat]", grid);
    var chips = $$("[data-filter]");
    var q = $("#q");
    var empty = $(".empty");
    var feat = $(".card--feature", grid);
    var cat = "all";
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var apply = function () {
      var term = norm(q ? q.value : "");
      var n = 0;
      cards.forEach(function (c) {
        var ok = (cat === "all" || c.getAttribute("data-cat") === cat) && (!term || norm(c.textContent).indexOf(term) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      if (feat) feat.classList.toggle("card--feature", cat === "all" && !term);
      if (empty) empty.style.display = n ? "none" : "block";
    };
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        cat = ch.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === ch ? "true" : "false"); });
        apply();
      });
    });
    if (q) q.addEventListener("input", apply);
    var hash = decodeURIComponent(location.hash.slice(1));
    chips.forEach(function (ch) { if (ch.getAttribute("data-slug") === hash) ch.click(); });
  }

  /* Formulaire (Formspree, envoi sans rechargement) */
  var form = $("form[data-ajax]");
  if (form) {
    var status = $(".form__status", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $("button[type=submit]", form);
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Envoi en cours";
      status.className = "form__status";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("http");
          form.reset();
          status.textContent = "Message envoyé. Vous recevez une réponse sous 24 h ouvrées, en général bien avant.";
          status.className = "form__status ok";
          btn.textContent = "Message envoyé";
          if (window.gtag) window.gtag("event", "generate_lead");
        })
        .catch(function () {
          status.innerHTML = 'L\'envoi n\'a pas abouti. Écrivez-nous directement à <a href="mailto:contact@lemanstudio.ch">contact@lemanstudio.ch</a>, votre message nous parviendra.';
          status.className = "form__status err";
          btn.disabled = false; btn.textContent = label;
        });
    });
  }

  /* Méthode : étape active */
  var steps = $$(".step");
  var num = $(".process__num");
  var bar = $(".process__bar i");
  if (steps.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = steps.indexOf(e.target);
        steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
        if (num) num.textContent = String(i + 1).padStart(2, "0");
        if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { sio.observe(s); });
  }

  /* Manifeste : mots révélés selon la progression dans la section fixe */
  var man = $(".manifesto");
  if (man) {
    var words = $$(".w", man);
    if (!motion) words.forEach(function (w) { w.classList.add("is-on"); });
    else {
      var tick = function () {
        var r = man.getBoundingClientRect();
        var total = man.offsetHeight - window.innerHeight;
        var p = Math.min(1, Math.max(0, -r.top / (total * 0.82)));
        var k = Math.round(p * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle("is-on", i < k);
      };
      window.addEventListener("scroll", tick, { passive: true });
      tick();
    }
  }

  /* Le lac : lignes d'eau, jet d'eau, crêtes des Alpes */
  var cv = $("canvas[data-lake]");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, dpr = 1, t0 = performance.now(), running = true, visible = true;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!motion) draw(0);
    };
    var ridge = function (x) {
      var u = x / W;
      return Math.sin(u * 7.1 + 1.3) * 0.32 + Math.sin(u * 17.3 + 0.4) * 0.16 + Math.sin(u * 41 + 2) * 0.05 + Math.max(0, 1 - Math.abs(u - 0.78) * 7) * 0.9;
    };
    var draw = function (time) {
      var s = time / 1000;
      ctx.clearRect(0, 0, W, H);
      var mobile = W < 700;
      var horizon = H * (mobile ? 0.46 : 0.42);
      var jetX = W * (mobile ? 0.9 : 0.74);
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      /* crête lointaine */
      ctx.beginPath();
      for (var x = 0; x <= W; x += 8) {
        var yy = horizon - 14 - ridge(x) * H * 0.045;
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = "rgba(230,236,234,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* jet d'eau */
      var jh = H * (mobile ? 0.26 : 0.34) * (1 + Math.sin(s * 1.3) * 0.015 + Math.sin(s * 3.7) * 0.008);
      var g = ctx.createLinearGradient(0, horizon, 0, horizon - jh);
      g.addColorStop(0, "rgba(245,197,24,0.95)");
      g.addColorStop(0.75, "rgba(245,197,24,0.55)");
      g.addColorStop(1, "rgba(245,197,24,0)");
      ctx.fillStyle = g;
      ctx.fillRect(jetX - 1.25, horizon - jh, 2.5, jh);
      var glow = ctx.createRadialGradient(jetX, horizon - jh * 0.9, 0, jetX, horizon - jh * 0.9, 60);
      glow.addColorStop(0, "rgba(245,197,24,0.14)");
      glow.addColorStop(1, "rgba(245,197,24,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(jetX - 60, horizon - jh * 0.9 - 60, 120, 120);

      /* surface */
      var N = mobile ? 30 : 44;
      var step = mobile ? 10 : 8;
      for (var i = 0; i < N; i++) {
        var tt = i / (N - 1);
        var y0 = horizon + (H - horizon) * Math.pow(tt, 1.75);
        var amp = 0.6 + tt * 9;
        var alpha = 0.07 + tt * 0.2;
        ctx.beginPath();
        for (var px = -10; px <= W + 10; px += step) {
          var y = y0
            + Math.sin(px * 0.006 + s * 0.55 + i * 0.75) * amp * 0.5
            + Math.sin(px * 0.017 - s * 0.9 + i * 1.9) * amp * 0.22;
          var dx = px - mouse.x, dy = y0 - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy * 4);
          if (d < 260) y += Math.exp(-(d * d) / 9000) * Math.sin(d * 0.06 - s * 5) * (4 + tt * 10);
          if (px === -10) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.strokeStyle = "rgba(230,236,234," + alpha.toFixed(3) + ")";
        ctx.lineWidth = 0.7 + tt * 0.7;
        ctx.stroke();

        /* reflet du jet */
        var rw = 6 + tt * 34 * (0.7 + 0.3 * Math.sin(s * 2 + i));
        var off = Math.sin(s * 1.7 + i * 2.3) * tt * 10;
        ctx.beginPath();
        ctx.moveTo(jetX - rw + off, y0 + Math.sin(jetX * 0.006 + s * 0.55 + i * 0.75) * amp * 0.5);
        ctx.lineTo(jetX + rw + off, y0 + Math.sin((jetX + rw) * 0.006 + s * 0.55 + i * 0.75) * amp * 0.5);
        ctx.strokeStyle = "rgba(245,197,24," + ((1 - tt) * 0.55 + 0.05).toFixed(3) + ")";
        ctx.lineWidth = 0.9 + tt;
        ctx.stroke();
      }
    };
    var loop = function (now) {
      if (running && visible) draw(now - t0);
      requestAnimationFrame(loop);
    };
    resize();
    window.addEventListener("resize", resize);
    if (motion) {
      requestAnimationFrame(loop);
      cv.parentElement.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      });
      cv.parentElement.addEventListener("pointerleave", function () { mouse.tx = -9999; mouse.ty = -9999; });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
      document.addEventListener("visibilitychange", function () { running = !document.hidden; });
    } else draw(0);
  }

  /* GSAP : entrée du héros, panneaux empilés, défilement horizontal */
  if (motion && window.gsap && window.ScrollTrigger) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    var lines = $$(".hero__title .ln > span");
    if (lines.length) {
      gsap.fromTo(lines, { yPercent: 108, fontStretch: "80%" }, { yPercent: 0, fontStretch: "125%", duration: 1.5, ease: "expo.out", stagger: 0.12, delay: 0.15 });
      gsap.fromTo(".hero__kw, .hero__foot > *", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.75 });
    }
    var panels = $$(".panel");
    panels.forEach(function (p, i) {
      var next = panels[i + 1];
      if (!next) return;
      gsap.to(p, {
        scale: 0.94, ease: "none",
        scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true }
      });
    });
    var mm = gsap.matchMedia();
    mm.add("(min-width: 761px)", function () {
      var track = $(".hs__track");
      var vp = $(".hs__viewport");
      if (!track || !vp) return;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: vp, start: "center center", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
      });
    });
    window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
  } else {
    var tr = $(".hs__track"); if (tr) tr.classList.add("is-static");
  }
})();
