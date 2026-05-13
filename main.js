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
  const dots = document.querySelectorAll('.hero-dot');
  let slideAtual = 0;
  let autoSlide;

  function irParaSlide(n) {
    slides[slideAtual].classList.remove('ativo');
    if (dots[slideAtual]) dots[slideAtual].classList.remove('ativo');
    slideAtual = (n + slides.length) % slides.length;
    slides[slideAtual].classList.add('ativo');
    if (dots[slideAtual]) dots[slideAtual].classList.add('ativo');
  }

  function proximoSlide() { irParaSlide(slideAtual + 1); }
  function slideAnterior() { irParaSlide(slideAtual - 1); }

  function iniciarAuto() {
    autoSlide = setInterval(proximoSlide, 5500);
  }

  function pararAuto() {
    clearInterval(autoSlide);
  }

  if (slides.length > 1) {
    const btnNext = document.getElementById('heroNext');
    const btnPrev = document.getElementById('heroPrev');

    if (btnNext) btnNext.addEventListener('click', function () {
      pararAuto(); proximoSlide(); iniciarAuto();
    });
    if (btnPrev) btnPrev.addEventListener('click', function () {
      pararAuto(); slideAnterior(); iniciarAuto();
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        pararAuto(); irParaSlide(i); iniciarAuto();
      });
    });

    iniciarAuto();
  }

  // ==============================
  // CONTADORES ANIMADOS
  // ==============================
  function animarContador(el) {
    const alvo = parseInt(el.getAttribute('data-alvo'));
    const duracao = 2000;
    const inicio = performance.now();

    function atualizar(tempo) {
      const progresso = Math.min((tempo - inicio) / duracao, 1);
      const ease = 1 - Math.pow(1 - progresso, 3);
      el.textContent = Math.floor(ease * alvo);
      if (progresso < 1) requestAnimationFrame(atualizar);
      else el.textContent = alvo;
    }

    requestAnimationFrame(atualizar);
  }

  const contadores = document.querySelectorAll('.numero-valor');
  if (contadores.length > 0 && 'IntersectionObserver' in window) {
    const obsContador = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animarContador(entry.target);
          obsContador.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    contadores.forEach(function (c) { obsContador.observe(c); });
  }

  // ==============================
  // BARRAS DE PROGRESSO
  // ==============================
  const barras = document.querySelectorAll('.barra-fill');
  if (barras.length > 0 && 'IntersectionObserver' in window) {
    const obsBarra = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const pct = entry.target.getAttribute('data-pct');
          entry.target.style.width = pct + '%';
          obsBarra.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    barras.forEach(function (b) { obsBarra.observe(b); });
  }

  // ==============================
  // FADE-IN AO ROLAR
  // ==============================
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const obsFade = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visivel');
          obsFade.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) { obsFade.observe(el); });
  }

  // ==============================
  // HEADER SOMBRA AO ROLAR
  // ==============================
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)';
      } else {
        header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
      }
    });
  }

  // ==============================
  // BOTÃO VOLTAR AO TOPO
  // ==============================
  const btnTopo = document.getElementById('btnTopo');
  if (btnTopo) {
    window.addEventListener('scroll', function () {
      btnTopo.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    btnTopo.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==============================
  // FORMULÁRIO DE CONTATO
  // ==============================
  const formContato = document.getElementById('formContato');
  if (formContato) {
    formContato.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = formContato.querySelector('button[type="submit"]');
      const textoOriginal = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = '✓ Mensagem Enviada!';
        btn.style.background = '#2d8a4e';
        formContato.reset();
        setTimeout(function () {
          btn.textContent = textoOriginal;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 1500);
    });
  }

});
