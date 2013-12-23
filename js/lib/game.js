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
    this.lowFPSCounter = 0;
    this.lowFPSCutoff = 20;
    this.lowFPSThreshold = 5;

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
    this.levels = {
      1: new BreakLevel(this),
      2: new Level(this, {
        0:  {
          f: function () {
            this.setBackground('res/bg/bggrass.png', 'res/bg/bggrassvig.png');
          }
        },
        45: {
          f: function () {
            var spawn = {};
            var minDistanceAway = 200;
            var maxAttempts = 100;
            var attempts = 0;

            do
              spawn = { x: _.random(this.canvas.width), y: _.random(this.canvas.height) };
            while (
              distanceBetween(spawn, this.player) < minDistanceAway &&
              attempts++ < maxAttempts);

            if (attempts < maxAttempts)
              this.addEntity(new Enemy(this.resources, spawn), 'enemy');
          },
          r: 45
        },
        15: { f: function (arg1) { console.log("Level 0! " + arg1); }, a: 'myarg2' },
      })
    };

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

      this.entities.forEach(function (ent) {
        ent.tock();
        ent.executeUpgrades();
        ent.tick();
      });

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
    // Update scaling only once per second.
    if (++this.fpsCounter === 1) this.ui.scaleCanvas();
    this.renderer.draw();
    requestAnimationFrame(this.draw.bind(this));
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
      "<p>" + this.player.health + " player health</p>" +
      "<p>" + this.renderer.shake.threeDee + " 3D shake " + this.lowFPSCounter + "</p>"
    );

    this.lastAge = this.age;

    // Fallback to 2D camera shake if it lags too much (not accelerated/too much stuff)
    if (this.fpsCounter < this.lowFPSCutoff)
      this.lowFPSCounter++;
    else
      this.lowFPSCounter--;


    if (this.lowFPSCounter > this.lowFPSThreshold)
      this.renderer.shake.threeDee = false;
    else
      this.renderer.shake.threeDee = true;

    this.fpsCounter = 0;
  }
};