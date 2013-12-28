function Sprites(sprites) {
  this.sprites = sprites || {
    relativeDir: "",
    sources: []
  };

  this.loaded = 0;
}

Sprites.prototype = {
  preload: function (callback) {
    this.callback = callback;
    this.toLoad = this.sprites.sources.length;

    this.sprites.sources.forEach(function (source) {
      this.loadSprite(source[0], this.sprites.relativeDir + source[1]);
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
      if (++this.loaded === this.toLoad) { 
        this.preloaded();
      }
    }.bind(this);
    this.sprites[key].src = url;
  },

  getSprites: function () {
    return this.sprites;
  }
};