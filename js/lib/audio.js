function Audio(sources) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new AudioContext();

  this.sounds = {};
  this.soundsDir = 'res/ogg/';
  this.sources = sources || [
    ['shoot1', 'Shoot1.ogg'],
    ['shoot2', 'Shoot2.ogg'],
    ['shoot3', 'Shoot3.ogg'],
    ['shoot4', 'Shoot4.ogg'],
    ['shoot5', 'Shoot5.ogg'],
    ['shoot7', 'Shoot7.ogg'],
  ];

  this.loaded = 0;
  this.masterVolume = 1;
}

Audio.prototype = {
  preload: function (callback) {
    this.callback = callback;
    this.toLoad = this.sources.length;

    this.sources.forEach(function (source) {
      this.loadAudio(source[0], this.soundsDir + source[1]);
    }.bind(this));
  },

  preloaded: function () {
    if (this.callback && typeof this.callback === 'function') {
      this.callback.call();
    }
  },

  loadAudio: function (key, url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      this.audioContext.decodeAudioData(request.response, function (buffer) {
        this.sounds[key] = buffer;
      }.bind(this));

      if (++this.loaded === this.toLoad) { this.preloaded(); }
    }.bind(this);

    request.send();
  },

  play: function(name, volume) {
    volume = volume || 1;

    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];

    var gainNode = this.audioContext.createGain();
    // Approximate volume log scale
    var adjustedVolume = (Math.pow(10, volume) - 1) / (10 - 1); // Log Base 10
    gainNode.gain.value = adjustedVolume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }
};