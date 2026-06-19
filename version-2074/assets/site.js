(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    if (typeof MOVIE_SEARCH_INDEX !== 'undefined') {
        initSearchPage();
    }
})();

function setupPlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !overlay || !source) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function playVideo() {
        loadVideo();
        overlay.classList.add('is-hidden');
        var request = video.play();

        if (request && typeof request.catch === 'function') {
            request.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

function initSearchPage() {
    var input = document.getElementById('searchInput');
    var regionFilter = document.getElementById('regionFilter');
    var yearFilter = document.getElementById('yearFilter');
    var results = document.getElementById('searchResults');

    if (!input || !regionFilter || !yearFilter || !results) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    var regions = uniqueValues(MOVIE_SEARCH_INDEX.map(function (item) {
        return item.region;
    })).sort();

    var years = uniqueValues(MOVIE_SEARCH_INDEX.map(function (item) {
        return item.year;
    })).sort(function (a, b) {
        return Number(b) - Number(a);
    });

    regions.forEach(function (region) {
        var option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });

    years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    function render() {
        var keyword = input.value.trim().toLowerCase();
        var region = regionFilter.value;
        var year = yearFilter.value;
        var filtered = MOVIE_SEARCH_INDEX.filter(function (item) {
            var target = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.tags
            ].join(' ').toLowerCase();

            if (keyword && target.indexOf(keyword) === -1) {
                return false;
            }

            if (region && item.region !== region) {
                return false;
            }

            if (year && String(item.year) !== year) {
                return false;
            }

            return true;
        }).slice(0, 120);

        results.innerHTML = filtered.map(renderSearchCard).join('');
    }

    input.addEventListener('input', render);
    regionFilter.addEventListener('change', render);
    yearFilter.addEventListener('change', render);

    render();
}

function uniqueValues(values) {
    var seen = {};
    var output = [];

    values.forEach(function (value) {
        if (value && !seen[value]) {
            seen[value] = true;
            output.push(value);
        }
    });

    return output;
}

function renderSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
        '<article class="movie-card">',
        '    <a class="poster-frame" href="./' + escapeHtml(item.url) + '">',
        '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '        <span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '    </a>',
        '    <div class="movie-card-body">',
        '        <h2><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
        '        <p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
        '        <p class="movie-summary">' + escapeHtml(item.oneLine) + '</p>',
        '        <div class="tag-list">' + tags + '</div>',
        '    </div>',
        '</article>'
    ].join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
