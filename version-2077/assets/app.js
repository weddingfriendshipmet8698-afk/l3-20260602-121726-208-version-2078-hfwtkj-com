(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-group]')).forEach(function (group) {
    var scope = group.parentElement;
    var input = group.querySelector('[data-search-input]');
    var yearFilter = group.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var noResult = scope.querySelector('[data-no-result]');

    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = yearFilter ? yearFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var year = Number(card.getAttribute('data-year') || '0');
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var yearMatch = yearValue === 'all' || String(year) === yearValue || (yearValue === 'older' && year < 2021);
        var shouldShow = keywordMatch && yearMatch;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle('is-show', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
  });
})();
