function Game(debug) {
  this.debug = debug || false;
  this.load();
}

Game.prototype = {
  load: function() {
    var toLoad = 2; // 1 for sprite, 1 for audio
    var loaded = 0;

    var loadedCallback = function() {
      if (++loaded === toLoad) this.initialize();
    }.bind(this);

    $.getJSON(
      "res/sprites.json",
      function(sprites) {
        this.spriteLoader = new Sprites(sprites);
        this.spriteLoader.preload(loadedCallback);
        this.sprites = this.spriteLoader.getSprites();
      }.bind(this)
    );

    $.getJSON(
      "res/sounds.json",
      function(sounds) {
        this.audio = new Audio(sounds);
        this.audio.preload(loadedCallback);
      }.bind(this)
    );
  },

  initialize: function() {
    this.canvas = $("#canvas")[0];
    this.decalCanvas = $("#persistent-canvas")[0];
    this.fadeCanvas = $("#fade-canvas")[0];
    this.lightingCanvas = $("#lighting-canvas")[0];
    this.renderer = new Renderer(
      this,
      this.canvas,
      this.decalCanvas,
      this.fadeCanvas,
      this.lightingCanvas
    );

    this.running = true;
    this.gameOver = false;
    this.tickRate = 60;
    this.age = 0;
    this.fpsCounter = 0;
    this.fps = 60;
    this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    this.resources = {
      game: this,
      sprites: this.sprites,
      sounds: this.sounds
    };

    this.player = new Player(this.resources, {
      x: this.center.x,
      y: this.center.y
    });
    this.entities = [this.player];
    this.friendlies = [this.player];
    this.enemies = [];

    this.upgradeCount = {};
    this.upgrades = new Upgrades(this);

    this.levelNumber = 0;
    this.level = null;
    this.levels = new Levels(this).levels;

    this.gold = 60;

    this.dayLength = 100;
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

  step: function() {
    if (this.running && !this.gameOver) {
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
        this.entities[i].tick();
        this.entities[i].executeUpgrades();
        this.entities[i].tock();
      }

      // Culling
      this.entities = this.entities.filter(this.getMarkedForDeletion);
      this.friendlies = this.friendlies.filter(this.getMarkedForDeletion);
      this.enemies = this.enemies.filter(this.getMarkedForDeletion);

      // Time of day
      this.timeOfDay = this.age % this.dayLength;
      this.dayRatio = 1 - this.timeOfDay / this.dayLength;

      // UI
      if (this.age % 30 === 0) this.ui.tick();
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
  getMarkedForDeletion: function(ent) {
    return !ent.markedForDeletion;
  },

  draw: function() {
    if (this.running) {
      // Update scaling only once per second.
      if (++this.fpsCounter === 1) this.ui.scaleCanvas();
      this.renderer.draw();
      this.animationRequestId = requestAnimationFrame(this.draw.bind(this));
    } else {
      cancelAnimationFrame(this.animationRequestId);
    }
  },

  setBackground: function(canvasbg, documentbg, containerbgColor) {
    $("#persistent-canvas").css("background-image", "url(" + canvasbg + ")");
    $("body").css("background-image", "url(" + documentbg + ")");
    $(".container").css("background-color", containerbgColor || "transparent");
  },

  upgrade: function(upgradeName, args) {
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
        this.ui.addGameUpgradeIcon(
          upgrade.gameUpgradeIcon.icon,
          upgrade.gameUpgradeIcon.tooltip
        );
      }
    }
  },

  addEntity: function(entity, type) {
    this.entities.push(entity);
    type = type || "entity";
    switch (type) {
      case "enemy":
        this.enemies.push(entity);
        break;
      case "friendly":
        this.friendlies.push(entity);
        break;
      default:
        /* noop */ break;
    }
  },

  addPowerup: function(entity) {
    entity.alignment = "enemy";
    this.addEntity(entity, "enemy");
  },

  spawnEnemy: function(enemy, x, y) {
    var spawn = {};
    var minDistanceAway = 300;
    var maxAttempts = 100;
    var attempts = 0;
    var margin = 400;

    do {
      spawn = {
        x: x || _.random(this.canvas.width + margin * 2) - margin,
        y: y || _.random(this.canvas.height + margin * 2) - margin
      };
    } while (
      typeof x === "undefined" &&
      typeof y === "undefined" &&
      Util.distanceBetween(spawn, this.player) < minDistanceAway &&
      attempts++ < maxAttempts
    );

    if (attempts < maxAttempts) {
      enemy.x = spawn.x;
      enemy.y = spawn.y;
      this.addEntity(enemy, "enemy");
    }
  },

  addGold: function(amount) {
    this.gold += amount;
    this.ui.updateGold();
  },

  subtractGold: function(amount) {
    this.gold -= amount;
    this.ui.updateGold();
    this.audio.play("coin");
  },

  updateDebugInfo: function() {
    var reduction = this.audio.compressor.reduction;
    var reductionLevel =
      reduction && parseFloat(reduction) ? reduction : reduction.value;

    $("#debug").html(
      "<p>" +
        this.fpsCounter +
        " FPS</p>" +
        "<p>" +
        (this.age - this.lastAge) +
        " ticks/s</p>" +
        "<p>" +
        this.entities.length +
        " entities</p>" +
        "<p>" +
        this.friendlies.length +
        " friendlies</p>" +
        "<p>" +
        this.enemies.length +
        " enemies</p>" +
        "<p>" +
        this.player.health +
        " player health</p>" +
        "<p>" +
        (reductionLevel ? reductionLevel.toFixed(2) : "?") +
        " compressor reduction</p>" +
        "<p>" +
        this.renderer.effectsUpdateRate +
        " special effects update frequency</p>" +
        "<p>"
    );

    this.lastAge = this.age;
    this.fps = this.fpsCounter;
    this.fpsCounter = 0;
  }
};
