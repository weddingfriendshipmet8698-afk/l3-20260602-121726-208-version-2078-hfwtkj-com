(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        play();
    }

    function setupFiltering() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        if (!grids.length) {
            return;
        }
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        var selects = Array.prototype.slice.call(document.querySelectorAll('.sort-select'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function currentQuery() {
            for (var i = 0; i < inputs.length; i += 1) {
                if (inputs[i].value) {
                    return normalize(inputs[i].value);
                }
            }
            return '';
        }

        function currentSort() {
            return selects.length ? selects[0].value : 'heat';
        }

        function apply() {
            var query = currentQuery();
            var sort = currentSort();
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.children);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
                });
                cards.sort(function (a, b) {
                    if (sort === 'year') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    if (sort === 'title') {
                        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                    }
                    return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get('q');
            if (keyword && !input.value) {
                input.value = keyword;
            }
        });
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.video-wrap'));
        players.forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var button = wrap.querySelector('.player-start');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-hls');
            var initialized = false;

            function start() {
                if (!source) {
                    return;
                }
                button.classList.add('is-hidden');
                if (!initialized) {
                    initialized = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                button.classList.remove('is-hidden');
                            }
                        });
                    } else {
                        video.src = source;
                    }
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
