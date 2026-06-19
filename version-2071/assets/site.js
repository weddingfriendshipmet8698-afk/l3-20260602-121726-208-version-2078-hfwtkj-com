(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (slides.length) {
            showSlide(0);
            startHero();
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(index - 1);
                    startHero();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    startHero();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                    startHero();
                });
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });

        document.querySelectorAll("[data-filter-list]").forEach(function (list) {
            var scope = list.closest("section") || document;
            var input = scope.querySelector("[data-filter-input]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var activeValue = "";

            function applyFilter() {
                var term = normalize(input ? input.value : "");
                Array.prototype.slice.call(list.querySelectorAll("[data-filter-item]")).forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search"));
                    var chipMatch = !activeValue || haystack.indexOf(normalize(activeValue)) !== -1;
                    var termMatch = !term || haystack.indexOf(term) !== -1;
                    item.style.display = chipMatch && termMatch ? "" : "none";
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeValue = chip.getAttribute("data-filter-value") || "";
                    chips.forEach(function (other) {
                        other.classList.toggle("is-active", other === chip);
                    });
                    applyFilter();
                });
            });
        });
    });
})();
