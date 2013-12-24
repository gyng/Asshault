function Audio(sources) {
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.audioSupport = true;
  } catch (e) {
    this.audioSupport = false;
    console.log(e);
  }

  this.sounds = {};
  this.soundsDir = 'res/ogg/';
  this.sources = sources || [
    ['shoot1', 'Shoot1.ogg'],
    ['shoot2', 'Shoot2.ogg'],
    ['shoot3', 'Shoot3.ogg'],
    ['shoot4', 'Shoot4.ogg'],
    ['shoot5', 'Shoot5.ogg'],
    ['shoot7', 'Shoot7.ogg'],
    ['explosion', 'Explosion.ogg'],
    ['explosion2', 'Explosion2.ogg'],
    ['explosion3', 'Explosion3.ogg'],
    ['explosion4', 'Explosion4.ogg'],
    ['explosion5', 'Explosion5.ogg'],
    ['explosion6', 'Explosion6.ogg'],
    ['explosion7', 'Explosion7.ogg'],
    ['build', 'Build.ogg'],
    ['start', 'Start.ogg'],
    ['shartshooper', 'Shartshooper.ogg'],
    ['hit_hurt', 'Hit_Hurt.ogg'],
    ['hit_hurt2', 'Hit_Hurt2.ogg'],
    ['hit_hurt3', 'Hit_Hurt3.ogg'],
    ['hit_hurt4', 'Hit_Hurt4.ogg'],
    ['hit_hurt5', 'Hit_Hurt5.ogg'],
    ['hit_hurt6', 'Hit_Hurt6.ogg'],
    ['waw', 'Waw.ogg'],
    ['beep', 'Beep.ogg'],
    ['click', 'Click.ogg'],
    ['helicopter1', 'Helicopter1.ogg'],
    ['helicopter2', 'Helicopter2.ogg'],
    ['helicopter3', 'Helicopter3.ogg'],
    ['powerup', 'Powerup.ogg'],
  ];

  this.loaded = 0;

  this.compressor = this.audioContext.createDynamicsCompressor();
  this.masterGainNode = this.audioContext.createGain();

  this.compressor.connect(this.masterGainNode);
  this.masterGainNode.connect(this.audioContext.destination);
}

Audio.prototype = {
  preload: function (callback) {
    if (!this.audioSupport) {
      callback.call();
      return;
    }

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

      if (++this.loaded === this.toLoad) { this.preloaded(); }
    }.bind(this);

    request.send();
  },

  play: function(name, volume, opts) {
    if (!this.audioSupport) return;

    if (typeof name === 'object' && name.length > 0)
      name = name[~~(Math.random() * name.length)];

    volume        = volume || 1;
    opts          = opts || {};
    var loop      = opts.loop || false;
    var loopstart = opts.loopstart || 0.0;
    var loopend   = opts.loopend || 1.0;

    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    if (typeof source.buffer === 'undefined' || source.buffer === null) return;
    source.loop = loop;
    source.loopStart = source.buffer.duration * loopstart;
    source.loopEnd = source.buffer.duration * loopend;

    var gainNode = this.audioContext.createGain();
    // Approximate volume log scale
    var adjustedVolume = (Math.pow(10, volume) - 1) / (10 - 1); // Log Base 10
    gainNode.gain.value = adjustedVolume;

    source.connect(gainNode);
    gainNode.connect(this.compressor);

    source.start(0);
  },

  loop: function(name, volume, loopstart, loopend) {
    loopstart = loopstart || 0.0;
    loopend = loopend || 1.0;
    this.play(name, volume, { loop: true, loopstart: loopstart, loopend: loopend });
  }
};