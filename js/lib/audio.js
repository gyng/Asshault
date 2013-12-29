function Audio (sounds) {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.audioSupport = true;
  } catch (e) {
    this.audioSupport = false;
    console.log(e);
  }

  this.sounds = sounds || {
    relativeDir: "",
    sources: []
  };

  this.loaded = 0;

  this.masterGainNode = this.audioContext.createGain();
  this.compressor = this.audioContext.createDynamicsCompressor();

  this.masterGainNode.connect(this.compressor);
  this.compressor.connect(this.audioContext.destination);
}

Audio.prototype = {
  preload: function (callback) {
    if (!this.audioSupport) {
      callback.call();
      return;
    }

    this.callback = callback;
    this.toLoad = this.sounds.sources.length;

    this.sounds.sources.forEach(function (source) {
      this.loadAudio(source[0], this.sounds.relativeDir + source[1]);
    }.bind(this));
  },

  preloaded: function () {
    if (this.callback && typeof this.callback === 'function') {
      this.callback.call();
    }
  },

  setMasterVolume: function(volume) {
    var adjustedVolume = (Math.pow(10, volume) - 1) / (10 - 1); // Log Base 10
    this.masterGainNode.gain.value = adjustedVolume;
  },

  loadAudio: function (key, url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      this.audioContext.decodeAudioData(request.response, function (buffer) {
        this.sounds[key] = buffer;
      }.bind(this));

      if (++this.loaded >= this.toLoad) this.preloaded();
    }.bind(this);

    request.send();
  },

  play: function(name, volume, opts) {
    if (!this.audioSupport) {
      return;
    }

    if (typeof name === 'object' && name.length > 0) {
      name = name[Math.floor(Math.random() * name.length)];
    }

    volume          = volume || 1;
    opts            = opts || {};
    var sourceStart = opts.sourceStart || 0;
    var loop        = opts.loop || false;
    var loopstart   = opts.loopstart || 0.0;
    var loopend     = opts.loopend || 1.0;

    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];

    if (typeof source.buffer === 'undefined' || source.buffer === null) {
      return;
    } else {
      source.loop = loop;
      source.loopStart = source.buffer.duration * loopstart;
      source.loopEnd = source.buffer.duration * loopend;

      var gainNode = this.audioContext.createGain();
      // Approximate volume log scale
      var adjustedVolume = (Math.pow(10, volume) - 1) / (10 - 1); // Log Base 10
      gainNode.gain.value = adjustedVolume;

      source.connect(gainNode);
      gainNode.connect(this.compressor);

      source.start(sourceStart);
    }
  },

  loop: function(name, volume, loopstart, loopend) {
    loopstart = loopstart || 0.0;
    loopend = loopend || 1.0;
    this.play(name, volume, { loop: true, loopstart: loopstart, loopend: loopend });
  }
};