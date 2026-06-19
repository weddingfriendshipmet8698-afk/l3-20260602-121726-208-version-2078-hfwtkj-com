(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function attachPlayer(root) {
        var video = root.querySelector("video");
        var button = root.querySelector(".play-overlay");
        var source = root.getAttribute("data-stream");
        var started = false;
        var hls = null;

        if (!video || !button || !source) {
            return;
        }

        function start() {
            if (started) {
                playVideo(video);
                return;
            }
            started = true;
            button.classList.add("is-hidden");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                playVideo(video);
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo(video);
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }

            video.src = source;
            video.load();
            playVideo(video);
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(attachPlayer);
    });
})();
