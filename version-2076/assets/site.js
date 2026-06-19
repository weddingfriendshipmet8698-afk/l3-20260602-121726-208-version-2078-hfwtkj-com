(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (next) {
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === next);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === next);
      });
      current = next;
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5600);
    }
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
  scopes.forEach(function (scope) {
    var panel = scope.parentElement ? scope.parentElement.querySelector('.filter-panel') : null;
    if (!panel) {
      return;
    }
    var input = panel.querySelector('.js-search');
    var yearSelect = panel.querySelector('.js-year-filter');
    var typeSelect = panel.querySelector('.js-type-filter');
    var empty = scope.parentElement.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var filter = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || (year === 'older' ? Number(cardYear) < 2022 : cardYear === year);
        var matchType = !type || cardType.indexOf(type) !== -1;
        var shouldShow = matchQuery && matchYear && matchType;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };
    if (input) {
      input.addEventListener('input', filter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', filter);
    }
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');
    var hlsInstance = null;
    var prepared = false;
    var prepare = function () {
      if (prepared || !video || !streamUrl) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    };
    var start = function () {
      prepare();
      if (video && video.play) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
      player.classList.add('is-playing');
    };
    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', prepare);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
