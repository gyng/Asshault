function Sprites(sprites) {
  this.sprites = sprites || {
    relativeDir: "",
    sources: []
  };

  this.loaded = 0;
}

Sprites.prototype = {
  preload: function(callback) {
    this.callback = callback;
    this.toLoad = this.sprites.sources.length;

    this.sprites.sources.forEach(function (source) {
      if (source.length === 2) {
        this.loadSprite(source[0], this.sprites.relativeDir + source[1]);
      } else if (source.length === 4) {
        this.loadSpriteAnimation(source[0], this.sprites.relativeDir + '/' + source[1], source[2], source[3]);
      }
    }.bind(this));
  },

  preloaded: function() {
    if (this.callback && typeof this.callback === "function") {
      this.callback.call();
    }
  },

  loadSprite: function(key, url) {
    this.sprites[key] = new Image();
    this.sprites[key].onload = function() {
      if (++this.loaded === this.toLoad) {
        this.preloaded();
      }
    }.bind(this);
    this.sprites[key].src = url;
  },

  loadSpriteAnimation: function (key, url, length, format) {
    this.sprites[key] = [];
    var loadedFrames = 0;
    var frameOnLoad = function () {
      if (++loadedFrames === length) {
        this.preloaded();
      }
    }.bind(this);

    for (var i = 0; i < length; i++) {
      var sprite = new Image();
      this.sprites[key].push(sprite);
      sprite.onload = frameOnLoad.bind(this);
      this.sprites[key][i].src = url + '/' + i + '.' + format;
    }
  },

  getSprites: function () {
    return this.sprites;
  }
};
