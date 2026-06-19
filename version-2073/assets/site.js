(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-movie-search]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-type]'));
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  let activeType = '全部';

  const applyFilters = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach((card) => {
      const haystack = (card.dataset.search || '').toLowerCase();
      const type = card.dataset.type || '';
      const matchText = !keyword || haystack.includes(keyword);
      const matchType = activeType === '全部' || type.includes(activeType) || haystack.includes(activeType.toLowerCase());
      card.classList.toggle('hidden-by-search', !(matchText && matchType));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeType = button.dataset.filterType || '全部';
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      applyFilters();
    });
  });

  const initPlayer = (box) => {
    const video = box.querySelector('video');
    const trigger = box.querySelector('.play-trigger');
    if (!video) {
      return;
    }
    const src = video.dataset.stream;
    if (!src) {
      return;
    }
    const start = () => {
      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        video.dataset.ready = '1';
        video.setAttribute('controls', 'controls');
      }
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };
    if (trigger) {
      trigger.addEventListener('click', start);
    }
    video.addEventListener('click', () => {
      if (!video.dataset.ready || video.paused) {
        start();
      }
    });
  };

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
