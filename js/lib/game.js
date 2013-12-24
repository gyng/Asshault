function Game(debug) {
  this.debug = debug || false;
  this.load();
}

Game.prototype = {
  load: function () {
    // Calls initialize when resourcse have been loaded
    var toLoad = 2; // 1 for sprite, 1 for audio
    var loaded = 0;

    var loadedCallback = function () {
      if (++loaded === toLoad) { this.initialize(); }
    }.bind(this);

    this.spriteLoader = new Sprites();
    this.spriteLoader.preload(loadedCallback);
    this.sprites = this.spriteLoader.getSprites();

    this.audio = new Audio();
    this.audio.preload(loadedCallback);
  },

  initialize: function () {
    this.canvas      = $('#canvas')[0];
    this.decalCanvas = $('#persistent-canvas')[0];
    this.renderer    = new Renderer(this, this.canvas, this.decalCanvas);

    this.fps        = 60;
    this.age        = 0;
    this.mouse      = { x: 0, y: 0 };
    this.center     = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.fpsCounter = 0;
    this.cssScale   = 1;

    this.running = true;

    this.resources = {
      game:    this,
      sprites: this.sprites,
      sounds:  this.sounds
    };

    this.player     = new Player(this.resources, { x: this.center.x, y: this.center.y });
    this.entities   = [this.player];
    this.friendlies = [this.player];
    this.enemies    = [];

    $('#canvas').mousemove(function (e) {
      // Factor in CSS scaling of canvas distorting mouse pointer location comparisons
      // as canvas is not aware of external scaling.
      this.mouse.x = this.cssScale * (e.pageX-this.canvas.offsetLeft);
      this.mouse.y = this.cssScale * (e.pageY-this.canvas.offsetTop);
    }.bind(this));

    this.upgradeCount = {};
    this.upgrades = new Upgrades(this);

    this.levelNumber = 0;
    this.level = null;
    this.levels = new Levels(this).levels;

    this.ui = new UI(this);

    // Debug variables
    if (this.debug) {
      this.lastAge = this.age;
      setInterval(this.updateDebugInfo.bind(this), 1000);
    }

    $(".loading").hide();

    setInterval(this.step.bind(this), 1000 / this.fps);
    this.draw();
  },

  step: function () {
    if (this.running) {
      this.age++;

      // Do not add bullets to spatial hash. Do all checking in individual
      // bullets against enemies.
      // For performance:
      //   1. We don't want to check bullets against other bullets as they
      //      will not collide (and are usually near each other).
      //   2. Updating the spatial hash for individual objects is painful
      //      so we recreate it each frame. Expensive with many bullets.
      this.spatialHash = new SpatialHash(Math.ceil(this.canvas.width / 100));
      var i;
      for (i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        this.spatialHash.add(enemy.x, enemy.y, enemy);
      }
      for (i = 0; i < this.friendlies.length; i++) {
        var friendly = this.friendlies[i];
        this.spatialHash.add(friendly.x, friendly.y, friendly);
      }

      this.entities.forEach(function (ent) {
        ent.tick();
        ent.executeUpgrades();
        ent.tock();
      }.bind(this));

      // Culling
      var filter = function (ent) { return !ent.markedForDeletion; };
      this.entities   = this.entities.filter(filter);
      this.friendlies = this.friendlies.filter(filter);
      this.enemies    = this.enemies.filter(filter);

      // UI
      if (this.age % 15 === 0) this.ui.setAvailableUpgrades();

      // Levels
      if (!_.isObject(this.level) || this.level.over) {
        this.levelNumber++;
        this.level = this.levels[this.levelNumber];
      } else {
        this.level.tock();
        this.level.tick();
      }
    }
  },

  draw: function () {
    if (this.running) {
      // Update scaling only once per second.
      if (++this.fpsCounter === 1) this.ui.scaleCanvas();
      this.renderer.draw();
      this.animationRequestId = requestAnimationFrame(this.draw.bind(this));
    } else {
      cancelAnimationFrame(this.animationRequestId);
    }
  },

  setBackground: function (canvasbg, documentbg) {
    $('#persistent-canvas').css('background-image', 'url(' + canvasbg + ')');
    $('body').css('background-image', 'url(' + documentbg + ')');
  },

  upgrade: function (upgradeName, args) {
    var upgrade = this.upgrades.list[upgradeName];
    if (upgrade.isConstraintsMet(this)) {
      args = args || [];
      upgrade.effect.call(this, args);
      if (typeof this.upgradeCount[upgrade.name] === 'undefined') {
        this.upgradeCount[upgrade.name] = 1;
      } else {
        this.upgradeCount[upgrade.name]++;
      }
    }
  },

  addEntity: function (entity, type) {
    this.entities.push(entity);
    type = type || 'entity';
    switch (type) {
      case 'enemy':    this.enemies.push(entity);    break;
      case 'friendly': this.friendlies.push(entity); break;
    }
  },

  updateDebugInfo: function () {
    $('#debug').html(
      "<p>" + this.fpsCounter + " FPS</p>" +
      "<p>" + (this.age - this.lastAge) + " ticks/s</p>" +
      "<p>" + this.entities.length + " entities</p>" +
      "<p>" + this.friendlies.length + " friendlies</p>" +
      "<p>" + this.enemies.length + " enemies</p>" +
      "<p>" + this.player.health + " player health</p>"
    );

    this.lastAge = this.age;
    this.fpsCounter = 0;
  }
};