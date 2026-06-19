import { H as Hls } from './hls.js';

export function initPlayer(videoId, buttonId, coverId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  var markReady = function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  };

  var load = function () {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          video.setAttribute('data-state', 'error');
        }
      });
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    video.setAttribute('data-state', 'error');
    return Promise.resolve();
  };

  var start = function () {
    load().then(function () {
      return video.play();
    }).then(markReady).catch(function () {
      markReady();
    });
  };

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      start();
    }
  });

  video.addEventListener('play', markReady);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
