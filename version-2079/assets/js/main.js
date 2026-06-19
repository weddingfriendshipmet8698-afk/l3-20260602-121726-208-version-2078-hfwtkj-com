(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("is-menu-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.setAttribute("aria-pressed", i === index ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setSlide(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        if (!scopes.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var genre = scope.querySelector("[data-filter-genre]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            if (q && input) {
                input.value = q;
            }

            function valueOf(el) {
                return el ? el.value.trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = valueOf(input);
                var yearValue = valueOf(year);
                var regionValue = valueOf(region);
                var genreValue = valueOf(genre);
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
                        ok = false;
                    }
                    if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
                        ok = false;
                    }
                    if (genreValue && (card.getAttribute("data-genre") || "").toLowerCase().indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }

            [input, year, region, genre].forEach(function (el) {
                if (!el) {
                    return;
                }
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            });
            apply();
        });
    }

    function initPlayer() {
        var holder = document.querySelector("[data-player]");
        if (!holder) {
            return;
        }
        var video = holder.querySelector("video");
        var overlay = holder.querySelector("[data-play-overlay]");
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute("data-hls");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !stream) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferLength: 32
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
