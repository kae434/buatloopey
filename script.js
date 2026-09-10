/* ==========================================================================
   BIRTHDAY WEBSITE — script.js
   Semua logic interaktif & perpindahan scene ada di sini.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     0. UTIL: SCENE MANAGER
     Berpindah antar scene dengan transisi halus (lihat .scene di CSS)
  ------------------------------------------------------------------ */
  const scenes = Array.from(document.querySelectorAll('.scene'));

  function goToScene(id) {
    const target = document.getElementById(id);
    if (!target) return;
    scenes.forEach((s) => {
      if (s === target) return;
      s.classList.remove('active');
    });
    // beri jeda kecil supaya transisi masuk terlihat halus
    requestAnimationFrame(() => {
      target.classList.add('active');
    });
  }

  /* ------------------------------------------------------------------
     1. DEKORASI MENGAMBANG (bintang, sparkle, hati, kelopak)
     Dibuat lewat JS agar posisinya acak & ringan (tanpa gambar).
  ------------------------------------------------------------------ */
  function createFloatingDecor() {
    const container = document.getElementById('floatingDecor');
    const symbols = ['✦', '✧', '♡', '❀', '⋆'];
    const count = window.innerWidth < 600 ? 14 : 22;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'fdeco';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 100 + 'vh';
      el.style.fontSize = 0.7 + Math.random() * 1.3 + 'rem';
      el.style.animationDuration = 4 + Math.random() * 6 + 's';
      el.style.animationDelay = Math.random() * 4 + 's';
      container.appendChild(el);
    }
  }
  createFloatingDecor();

  /* ------------------------------------------------------------------
     2. MUSIK LATAR (on/off)
     Pemilik website tinggal menambahkan <source> di index.html.
  ------------------------------------------------------------------ */
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  let musicStarted = false;
  let musicPlaying = false;

  function tryStartMusic() {
    if (musicStarted) return;
    musicStarted = true;
    // Hanya diputar jika ada <source> yang ditambahkan pemilik website.
    const hasSource = bgMusic.querySelector('source');
    if (!hasSource) return;
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicToggle.classList.add('playing');
    }).catch(() => {
      // autoplay diblokir browser — tidak masalah, user bisa nyalakan manual
      musicPlaying = false;
    });
  }

  musicToggle.addEventListener('click', () => {
    const hasSource = bgMusic.querySelector('source');
    if (!hasSource) {
      musicToggle.classList.toggle('muted');
      return;
    }
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      musicToggle.classList.remove('playing');
      musicToggle.classList.add('muted');
    } else {
      bgMusic.play();
      musicPlaying = true;
      musicToggle.classList.remove('muted');
      musicToggle.classList.add('playing');
    }
  });

  /* ------------------------------------------------------------------
     3. SCENE 1 → 2 : TOMBOL "MULAI"
  ------------------------------------------------------------------ */
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', () => {
    tryStartMusic();
    goToScene('scene-envelope');
  });

  /* ------------------------------------------------------------------
     4. SCENE 2 : AMPLOP SURAT
  ------------------------------------------------------------------ */
  const envelope = document.getElementById('envelope');
  const envelopeHint = document.getElementById('envelopeHint');
  const continueFromLetter = document.getElementById('continueFromLetter');

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    envelopeHint.style.opacity = '0';
    // setelah surat keluar, biarkan sebentar lalu membesar ke depan
    setTimeout(() => {
      envelope.classList.add('expanded');
    }, 900);
  });

  continueFromLetter.addEventListener('click', (e) => {
    e.stopPropagation();
    goToScene('scene-wish');
  });

  /* ------------------------------------------------------------------
     5. SCENE 3 : MAKE A WISH
  ------------------------------------------------------------------ */
  const wishText1 = document.getElementById('wishText1');
  const wishText2 = document.getElementById('wishText2');
  const wishReadyBtn = document.getElementById('wishReadyBtn');
  const candleHint = document.getElementById('candleHint');

  wishReadyBtn.addEventListener('click', () => {
    goToScene('scene-candles');
  });

  /* ------------------------------------------------------------------
     6. SCENE 4 : TIUP LILIN
  ------------------------------------------------------------------ */
  const candles = Array.from(document.querySelectorAll('.candle'));
  const wishMadeText = document.getElementById('wishMadeText');
  const afterCandlesBtn = document.getElementById('afterCandlesBtn');

  candles.forEach((candle) => {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('blown')) return;
      candle.classList.add('blown');
      checkAllCandlesBlown();
    });
  });

  function checkAllCandlesBlown() {
    const allBlown = candles.every((c) => c.classList.contains('blown'));
    if (allBlown) {
      setTimeout(() => {
        wishMadeText.classList.add('show');
        afterCandlesBtn.classList.add('show');
      }, 500);
    }
  }

  afterCandlesBtn.addEventListener('click', () => {
    goToScene('scene-cut');
  });

  /* ------------------------------------------------------------------
     7. SCENE 5 : POTONG KUE (drag gesture — mouse & touch)
  ------------------------------------------------------------------ */
  const cutCakeWrap = document.getElementById('cutCakeWrap');
  const knifeSvg = document.getElementById('knifeSvg');
  const cutLine = document.getElementById('cutLine');
  const cutSubhint = document.getElementById('cutSubhint');

  let dragging = false;
  let startY = null;
  let dragProgress = 0; 
  let hasCut = false;

  function wrapRect() {
    return cutCakeWrap.getBoundingClientRect();
  }

  function pointerPos(e) {
    if (e.touches && e.touches.length) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function updateKnifePosition(x, y) {
    const rect = wrapRect();
    const relX = Math.min(Math.max(x - rect.left, 0), rect.width);
    const relY = Math.min(Math.max(y - rect.top, 0), rect.height);
    knifeSvg.style.left = relX + 'px';
    knifeSvg.style.top = Math.max(relY - 40, -30) + 'px';

    
    const topBound = rect.height * 0.15;
    const bottomBound = rect.height * 0.85;
    const progress = Math.min(Math.max((relY - topBound) / (bottomBound - topBound), 0), 1);
    dragProgress = Math.max(dragProgress, progress);

    const svgY = 80 + dragProgress * 140; 
    cutLine.setAttribute('y2', svgY.toFixed(1));
    cutLine.classList.add('visible');

    if (dragProgress >= 0.9 && !hasCut) {
      completeCut();
    }
  }

  function completeCut() {
    hasCut = true;
    cutCakeWrap.classList.add('cut');
    cutSubhint.textContent = 'Yeay, berhasil dipotong! 🎉';
    setTimeout(() => {
      goToScene('scene-celebration');
      startConfetti();
    }, 1100);
  }

  function onDragStart(e) {
    if (hasCut) return;
    dragging = true;
    const p = pointerPos(e);
    startY = p.y;
    updateKnifePosition(p.x, p.y);
  }

  function onDragMove(e) {
    if (!dragging || hasCut) return;
    e.preventDefault();
    const p = pointerPos(e);
    updateKnifePosition(p.x, p.y);
  }

  function onDragEnd() {
    dragging = false;
  }

  cutCakeWrap.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  cutCakeWrap.addEventListener('touchstart', onDragStart, { passive: true });
  cutCakeWrap.addEventListener('touchmove', onDragMove, { passive: false });
  cutCakeWrap.addEventListener('touchend', onDragEnd);

  /* ------------------------------------------------------------------
     8. SCENE 6 : CELEBRATION (confetti canvas)
  ------------------------------------------------------------------ */
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;
  const confettiColors = ['#ff9dc0', '#ffc2d9', '#f3c98a', '#e9dcff', '#ffffff', '#f56fa1'];

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function startConfetti() {
    confettiParticles = [];
    const count = window.innerWidth < 600 ? 90 : 160;
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * confettiCanvas.height * 0.5,
        size: 5 + Math.random() * 7,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
    // hentikan setelah beberapa detik agar tetap "tidak berlebihan"
    setTimeout(() => {
      confettiParticles = confettiParticles.filter(() => false);
    }, 4500);
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (p.y > confettiCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * confettiCanvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    confettiAnimId = requestAnimationFrame(animateConfetti);
  }

  const toFlowersBtn = document.getElementById('toFlowersBtn');
  toFlowersBtn.addEventListener('click', () => {
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    goToScene('scene-flowers');
    growFlowers();
  });

  /* ------------------------------------------------------------------
     9. SCENE 7 : BUNGA MEKAR (dibuat pakai SVG-like shapes via CSS)
  ------------------------------------------------------------------ */
  const garden = document.getElementById('garden');
  const gardenBtn = document.getElementById('toMessageBtn');
  let flowersGrown = false;

  const flowerPalette = ['#ff9dc0', '#ffc2d9', '#e9dcff', '#ffb6d0', '#f8a5c2'];

  function buildFlowers() {
    const flowerCount = window.innerWidth < 500 ? 5 : 7;
    garden.innerHTML = '';
    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement('div');
      flower.className = 'flower';
      const stemHeight = 70 + Math.random() * 40;
      flower.style.setProperty('--stem-height', stemHeight + 'px');
      flower.style.setProperty('--bloom-bottom', stemHeight - 6 + 'px');
      flower.style.setProperty('--petal-color', flowerPalette[i % flowerPalette.length]);

      const stem = document.createElement('div');
      stem.className = 'flower-stem';

      const leafL = document.createElement('div');
      leafL.className = 'flower-leaf left';
      const leafR = document.createElement('div');
      leafR.className = 'flower-leaf right';

      const bloom = document.createElement('div');
      bloom.className = 'flower-bloom';
      for (let p = 0; p < 5; p++) {
        const petal = document.createElement('div');
        petal.className = 'petal-shape';
        bloom.appendChild(petal);
      }
      const center = document.createElement('div');
      center.className = 'flower-center';
      bloom.appendChild(center);

      flower.appendChild(stem);
      flower.appendChild(leafL);
      flower.appendChild(leafR);
      flower.appendChild(bloom);
      garden.appendChild(flower);
    }
  }
  buildFlowers();

  function growFlowers() {
    if (flowersGrown) return;
    flowersGrown = true;
    const flowers = Array.from(garden.querySelectorAll('.flower'));
    flowers.forEach((f, i) => {
      setTimeout(() => {
        f.classList.add('grow');
      }, i * 260);
    });
    const totalDelay = flowers.length * 260 + 2200;
    setTimeout(() => {
      gardenBtn.classList.add('show');
    }, totalDelay);
  }

  gardenBtn.addEventListener('click', () => {
    goToScene('scene-message');
  });

})();
