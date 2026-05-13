/* ========================================
   MAIN.JS – JavaScript Global
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ==============================
  // MENU MOBILE
  // ==============================
  const menuToggle = document.getElementById('menuToggle');
  const menuPrincipal = document.getElementById('menuPrincipal');

  if (menuToggle && menuPrincipal) {
    menuToggle.addEventListener('click', function () {
      menuPrincipal.classList.toggle('aberto');
    });
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !menuPrincipal.contains(e.target)) {
        menuPrincipal.classList.remove('aberto');
      }
    });
  }

  // ==============================
  // HERO SLIDER
  // ==============================
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let atual = 0;
  let timer;

  function irPara(n) {
    slides[atual].classList.remove('ativo');
    if (dots[atual]) dots[atual].classList.remove('ativo');
    atual = (n + slides.length) % slides.length;
    slides[atual].classList.add('ativo');
    if (dots[atual]) dots[atual].classList.add('ativo');
  }

  function proximo() { irPara(atual + 1); }
  function anterior() { irPara(atual - 1); }
  function iniciar() { timer = setInterval(proximo, 5500); }
  function parar()   { clearInterval(timer); }

  if (slides.length > 1) {
    const btnNext = document.getElementById('heroNext');
    const btnPrev = document.getElementById('heroPrev');
    if (btnNext) btnNext.addEventListener('click', function () { parar(); proximo(); iniciar(); });
    if (btnPrev) btnPrev.addEventListener('click', function () { parar(); anterior(); iniciar(); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { parar(); irPara(i); iniciar(); });
    });
    iniciar();
  }

  // ==============================
  // CONTADORES ANIMADOS
  // ==============================
  function animarContador(el) {
    const alvo = parseInt(el.getAttribute('data-alvo'));
    const dur   = 2000;
    const t0    = performance.now();
    function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * alvo);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = alvo;
    }
    requestAnimationFrame(step);
  }

  const contadores = document.querySelectorAll('.numero-valor');
  if (contadores.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animarContador(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    contadores.forEach(function (c) { obs.observe(c); });
  }

  // ==============================
  // BARRAS DE PROGRESSO
  // ==============================
  const barras = document.querySelectorAll('.barra-fill');
  if (barras.length && 'IntersectionObserver' in window) {
    const obs2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-pct') + '%';
          obs2.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    barras.forEach(function (b) { obs2.observe(b); });
  }

  // ==============================
  // HEADER SOMBRA AO ROLAR
  // ==============================
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 40
        ? '0 4px 20px rgba(0,0,0,.18)'
        : '0 2px 12px rgba(0,0,0,.1)';
    });
  }

  // ==============================
  // FORMULÁRIO DE CONTATO
  // ==============================
  const form = document.getElementById('formContato');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = '✓ Mensagem Enviada!';
        btn.style.background = '#2d8a4e';
        form.reset();
        setTimeout(function () {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 1500);
    });
  }

});
