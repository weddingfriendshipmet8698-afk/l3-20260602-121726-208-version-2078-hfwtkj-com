(function () {
    var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    var hlsLoadingPromise = null;
    var instances = new WeakMap();

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoadingPromise) {
            return hlsLoadingPromise;
        }
        hlsLoadingPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = HLS_CDN;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS library is not available.'));
                }
            };
            script.onerror = function () {
                reject(new Error('HLS library failed to load.'));
            };
            document.head.appendChild(script);
        });
        return hlsLoadingPromise;
    }

    function canPlayNative(video) {
        return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
    }

    function setStatus(shell, message) {
        var status = shell.querySelector('[data-player-status]');
        if (status) {
            status.textContent = message || '';
        }
    }

    function attachSource(video, shell) {
        var source = video.getAttribute('data-src');
        if (!source) {
            setStatus(shell, '播放源不可用');
            return Promise.reject(new Error('Missing video source.'));
        }
        if (instances.has(video) || video.src) {
            return Promise.resolve();
        }
        setStatus(shell, '正在加载播放源');
        if (canPlayNative(video)) {
            video.src = source;
            setStatus(shell, '');
            return Promise.resolve();
        }
        return loadHlsLibrary().then(function (Hls) {
            if (!Hls.isSupported()) {
                setStatus(shell, '当前浏览器暂不支持 HLS 播放');
                throw new Error('HLS is not supported.');
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            instances.set(video, hls);
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus(shell, '');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(shell, '视频加载失败，请刷新后重试');
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            });
        }).catch(function (error) {
            if (!canPlayNative(video)) {
                setStatus(shell, '当前浏览器暂不支持 HLS 播放');
            }
            throw error;
        });
    }

    function playVideo(video, shell) {
        attachSource(video, shell).then(function () {
            return video.play();
        }).catch(function () {
            setStatus(shell, '点击视频控件可继续尝试播放');
        });
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-player-action="play"]');
        if (!video) {
            return;
        }

        attachSource(video, shell).catch(function () {});

        if (button) {
            button.addEventListener('click', function () {
                playVideo(video, shell);
            });
        }

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            setStatus(shell, '');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo(video, shell);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(setupPlayer);
    });
})();
