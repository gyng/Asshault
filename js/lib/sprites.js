function Sprites(sources) {
  this.sprites = {};
  this.spritesDir = 'res/sprites/';
  this.sources = sources || [
    ['debug',       'debug.png'],
    ['debug2',      'debug2.png'],
    ['flash1',      'flash1.png'],
    ['flash2',      'flash2.png'],
    ['bullet',      'bullet.png'],
    ['bulletping1', 'bulletping1.png'],
    ['explosion1',  'explosion1.png'],
    ['explosion2',  'explosion2.png'],
    ['tavern',      'tavern.png'],
    ['herogunner',  'herogunner.png'],
    ['herosniper',  'herosniper.png'],
    ['herocleaner',  'herocleaner.png'],
    ['bloodstain',  'bloodstain.png'],
    ['bloodspray',  'bloodspray.png'],
  ];

  this.loaded = 0;
}

Sprites.prototype = {
  preload: function (callback) {
    this.callback = callback;
    this.toLoad = this.sources.length;

    this.sources.forEach(function (source) {
      this.loadSprite(source[0], this.spritesDir + source[1]);
    }.bind(this));
  },

  preloaded: function () {
    if (this.callback && typeof this.callback === 'function') {
      this.callback.call();
    }
  },

  loadSprite: function (key, url) {
    this.sprites[key] = new Image();
    this.sprites[key].onload = function() {
      if (++this.loaded === this.toLoad) { this.preloaded(); }
    }.bind(this);
    this.sprites[key].src = url;
  },

  getSprites: function () {
    return this.sprites;
  }
};