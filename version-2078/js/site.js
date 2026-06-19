(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    if (slides.length < 2) {
      return;
    }

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
    }

    function next() {
      show(index + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        next();
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    var hero = document.querySelector('.hero-shell');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-jump-search]'));

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        var query = input ? input.value.trim() : '';
        var url = './categories.html';

        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }

        window.location.href = url;
      });
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var regionSelect = panel.querySelector('[data-region-filter]');
      var grid = panel.parentElement.querySelector('[data-card-grid]');
      var empty = panel.parentElement.querySelector('[data-empty-state]');

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function update() {
        var query = normalize(input ? input.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', update);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', update);
      }

      if (regionSelect) {
        regionSelect.addEventListener('change', update);
      }

      update();
    });
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-player]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    var source = window.playerSource;
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startPlayback() {
      attachSource();
      video.controls = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playback = video.play();

      if (playback && playback.catch) {
        playback.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initSearchForms();
    initFilters();
    initPlayer();
  });
})();
