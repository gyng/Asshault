function Game (debug) {
  this.debug = debug || false;
  this.load();
}

Game.prototype = {
  load: function () {
    var toLoad = 2; // 1 for sprite, 1 for audio
    var loaded = 0;

    var loadedCallback = function () {
      if (++loaded === toLoad) this.initialize();
    }.bind(this);

    $.getJSON('res/sprites.json', function (sprites) {
      this.spriteLoader = new Sprites(sprites);
      this.spriteLoader.preload(loadedCallback);
      this.sprites = this.spriteLoader.getSprites();
    }.bind(this));

    $.getJSON('res/sounds.json', function (sounds) {
      this.audio = new Audio(sounds);
      this.audio.preload(loadedCallback);
    }.bind(this));
  },

  initialize: function () {
    this.canvas      = $('#canvas')[0];
    this.decalCanvas = $('#persistent-canvas')[0];
    this.renderer    = new Renderer(this, this.canvas, this.decalCanvas);

    this.running    = true;
    this.tickRate   = 60;
    this.age        = 0;
    this.fpsCounter = 0;
    this.center     = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    this.resources = {
      game:    this,
      sprites: this.sprites,
      sounds:  this.sounds
    };

    this.player     = new Player(this.resources, { x: this.center.x, y: this.center.y });
    this.entities   = [this.player];
    this.friendlies = [this.player];
    this.enemies    = [];

    this.upgradeCount = {};
    this.upgrades = new Upgrades(this);

    this.levelNumber = 0;
    this.level = null;
    this.levels = new Levels(this).levels;

    this.gold = 50;

    this.dayLength = 1440;
    this.timeOfDay = 0;
    this.dayRatio = 0;

    this.ui = new UI(this);

    // Debug variables
    if (this.debug) {
      this.lastAge = this.age;
      setInterval(this.updateDebugInfo.bind(this), 1000);
    }

    setInterval(this.step.bind(this), 1000 / this.tickRate);
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
      //      so we recreate it each frame. More expensive with many bullets.
      this.spatialHash = new SpatialHash(Math.ceil(this.canvas.width / 50));
      var i;
      for (i = 0; i < this.enemies.length; i++) {
        var enemy = this.enemies[i];
        this.spatialHash.add(enemy.x, enemy.y, enemy);
      }
      for (i = 0; i < this.friendlies.length; i++) {
        var friendly = this.friendlies[i];
        this.spatialHash.add(friendly.x, friendly.y, friendly);
      }

      for (i = 0; i < this.entities.length; i++) {
        var ent = this.entities[i];

        ent.tick();
        ent.executeUpgrades();
        ent.tock();

        // Refactoring into EC system
        // Movement system
        if (Util.isDefined(ent.components.movement) && Util.isDefined(ent.components.position)) {
          ent.components.movement.tick(ent.components.position);

          // TODO: remove once render system updated
          ent.x = ent.components.position.x;
          ent.y = ent.components.position.y;
        }

        // Target system
        if (Util.isDefined(ent.components.target)) {
          // Kill all references to dead target for GC
          if (ent.components.target.isDead) {
            ent.components.target.isDead()
          }
        }

        // Script system
        if (Util.isDefined(ent.components.script)) {
          // TODO: make it an array of script components
          ent.components.script.tick();
        }
      }

      // Culling
      this.entities   = this.entities.filter(this.getMarkedForDeletion);
      this.friendlies = this.friendlies.filter(this.getMarkedForDeletion);
      this.enemies    = this.enemies.filter(this.getMarkedForDeletion);

      // Time of day
      this.timeOfDay = this.age % this.dayLength;
      this.dayRatio = 1 - this.timeOfDay / this.dayLength;

      // UI
      if (this.age % 15 === 0) this.ui.tick();
      if (this.age % 120 === 0) this.ui.scaleCanvas();

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

  // Optimisation for culling; cache function
  getMarkedForDeletion: function (ent) {
    return !ent.markedForDeletion;
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

      if (!Util.isDefined(this.upgradeCount[upgrade.name])) {
        this.upgradeCount[upgrade.name] = 1;
      } else {
        this.upgradeCount[upgrade.name]++;
      }

      if (Util.isDefined(upgrade.gameUpgradeIcon)) {
        this.ui.addGameUpgradeIcon(upgrade.gameUpgradeIcon.icon, upgrade.gameUpgradeIcon.tooltip);
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

  spawnEnemy: function (enemy) {
    var spawn = {};
    var minDistanceAway = 200;
    var maxAttempts = 100;
    var attempts = 0;

    do {
      spawn = { x: _.random(this.canvas.width), y: _.random(this.canvas.height) };
    } while (
      Util.distanceBetween(spawn, this.player) < minDistanceAway &&
      attempts++ < maxAttempts);

    if (attempts < maxAttempts) {
      enemy.x = spawn.x;
      enemy.y = spawn.y;
      this.addEntity(enemy, 'enemy');
    }
  },

  addGold: function (amount) {
    this.gold += amount;
    this.ui.updateGold();
  },

  subtractGold: function (amount) {
    this.gold -= amount;
    this.ui.updateGold();
    this.audio.play('coin');
  },

  updateDebugInfo: function () {
    $('#debug').html(
      "<p>" + this.fpsCounter + " FPS</p>" +
      "<p>" + (this.age - this.lastAge) + " ticks/s</p>" +
      "<p>" + this.entities.length + " entities</p>" +
      "<p>" + this.friendlies.length + " friendlies</p>" +
      "<p>" + this.enemies.length + " enemies</p>" +
      "<p>" + this.player.health + " player health</p>" +
      "<p>" + this.audio.compressor.reduction.value.toFixed(2) + " compressor reduction</p>"
    );

    this.lastAge = this.age;
    this.fpsCounter = 0;
  }
};