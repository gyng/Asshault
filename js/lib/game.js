function Game() {
  this.load();
}

Game.prototype = {
  initialize: function () {
    $(".loading").hide();
    this.canvas   = $('#canvas')[0];
    this.context  = this.canvas.getContext('2d');

    // The persistent canvas is for persistent effects such as dead bodies and bullet shells
    // It is not redrawn for speed
    this.persistentCanvas = $('#persistent-canvas')[0];
    this.persistentContext = this.persistentCanvas.getContext('2d');

    this.fps      = 60;
    this.age      = 0;
    this.mouse    = { x: 0, y: 0 };
    this.shake    = { x: 0, y: 0 };
    this.center   = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.shakeReduction = 0.95;
    this.debugFpsCounter = 0;
    this.scaleRatio = 1;

    // Debug variables
    this.debug = true;
    if (this.debug) {
      this.lastAge = this.age;
      window.setInterval(this.debugInfo.bind(this), 1000);
    }

    // Canvas optimisations
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;

    this.resources = {
      game:    this,
      sprites: this.sprites,
      sounds:  this.sounds
    };
    this.player   = new Player(this.resources, { x: this.center.x, y: this.center.y });
    this.entities = [this.player];
    this.friendlies = [this.player];
    this.enemies = [];

    $('#canvas').mousemove(function (e) {
      // Factor in CSS scaling of canvas distorting mouse pointer location comparisons
      // as canvas is not aware of external scaling.
      this.mouse.x = (e.pageX - this.canvas.offsetLeft) * this.scaleRatio;
      this.mouse.y = (e.pageY - this.canvas.offsetTop) * this.scaleRatio;
    }.bind(this));

    this.upgradeCount = {};
    this.upgrades = new Upgrades(this);

    this.levelNumber = 0;
    this.level = null;
    this.levels = {
      1: new BreakLevel(this),
      2: new Level(this, {
        0:  {
          f: function (arg1) {
            // $('.container').css('background-image', 'url(' + url + ')');
            $('body').css('background-image', 'url(res/bg/bggrassvig.png)');
            $('#persistent-canvas').css('background-image', 'url(res/bg/bggrass.png)');
          },
          a: 'myarg'
        },
        10: {
          f: function () {
            console.log('omgspawning');
            var spawnX = this.player.x;
            var spawnY = this.player.y;
            var minDistanceAway = 100;
            var maxAttempts = 1000;
            var attempts = 0;
            var enemy = null;

            while (distanceBetween(spawnX, spawnY, this.player.x, this.player.y) < minDistanceAway &&
              attempts++ < maxAttempts) {
              spawnX = _.random(this.canvas.width);
              spawnY = _.random(this.canvas.height);
            }

            if (attempts < maxAttempts) {
              enemy = new Enemy(this.resources, { x: spawnX, y: spawnY });
              this.entities.push(enemy);
              this.enemies.push(enemy);
            }
          },
          r: 45
        },
        15: { f: function (arg1) { console.log("Level 0! " + arg1); }, a: 'myarg2' },
      })
    };

    this.ui = new UI(this);

    setInterval(this.step.bind(this), 1000 / this.fps);
    this.draw();
  },

  load: function () {
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

  step: function () {
    this.age += 1;

    this.entities.forEach(function (ent) {
      ent.tock();
      ent.executeUpgrades();
      ent.tick();
    });

    // Culling
    this.entities = this.entities.filter(function (ent) {
      return ent.markedForDeletion !== true;
    });

    this.friendlies = this.friendlies.filter(function (ent) {
      return ent.markedForDeletion !== true;
    });

    this.enemies = this.enemies.filter(function (ent) {
      return ent.markedForDeletion !== true;
    });

    // UI
    if (this.age % 15 === 0) {
      this.ui.setAvailableUpgrades();
    }

    // Levels
    if (!_.isObject(this.level) || this.level.over) {
      this.levelNumber++;
      this.level = this.levels[this.levelNumber];
    } else {
      this.level.tock();
      this.level.tick();
    }
  },

  draw: function () {
    this.debugFpsCounter++;

    if (this.debugFpsCounter === 1) {
      this.ui.scaleCanvas();
    }

    // Clear canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update camera shake
    this.shake.x *= this.shakeReduction;
    this.shake.y *= this.shakeReduction;

    // Time of day shadow calculations
    // Shadow distortion (vector)
    // Imagine this is a semicircle, okay?
    //
    //     ________
    //    /\        \
    // y |  \ r      |  radius = offsetLength
    //   |__(>_______|
    //     (angle)
    //
    //   --- time --->
    var offsetLength = 30;
    var dayLength = 1440;
    var timeOfDay = this.age % dayLength;
    var dayRatio = timeOfDay / dayLength;
    var radians = dayRatio * Math.PI;
    var todXOffset = Math.cos(radians);
    var todYOffset = Math.sin(radians);

    // Shadow pass
    this.entities.forEach(function (ent) {
      if (ent.hasShadow) {
        this.context.save();
          // Move to shadow position
          this.context.setTransform(
            Math.cos(ent.rotation + radians) * (Math.max(0.2, (Math.abs(dayRatio-0.5))) * 2) * 4,
            Math.sin(ent.rotation + radians),
            -Math.sin(ent.rotation + radians) * (Math.max(0.2, (Math.abs(dayRatio-0.5))) * 2) * 4,
            Math.cos(ent.rotation + radians),
            ent.x + ent.drawOffset.x + this.shake.x + ent.shadowOffset.x + todXOffset * offsetLength * ((Math.abs(dayRatio-0.5)) * 2) * 3,
            ent.y + ent.drawOffset.y + this.shake.y + ent.shadowOffset.y + todYOffset * offsetLength * (1 - dayRatio)
          );

          this.context.fillStyle = ent.shadowColor;

          if (ent.shadowShape === 'square') {
            this.context.fillRect(
              -ent.width / 2,
              -ent.height / 2,
              ent.shadowSize.x,
              ent.shadowSize.y
            );
          } else {
            this.context.beginPath();
            this.context.arc(0, 0, ent.shadowSize.x, 0, 2 * Math.PI);
            this.context.fill();
          }
        this.context.restore();
      }
    }.bind(this));

    // Sprite pass
    this.entities.forEach(function (ent) {
      this.context.save();
        // Transformation matrix
        // [ a, c, e ]
        // [ b, d, f ]
        // setTransform(a, b, c, d, e, f)
        this.context.setTransform(
          Math.cos(ent.rotation),
          Math.sin(ent.rotation),
          -Math.sin(ent.rotation),
          Math.cos(ent.rotation),
          ent.x + ent.drawOffset.x + this.shake.x,
          ent.y + ent.drawOffset.y + this.shake.y
        );

        this.context.drawImage(ent.getImage(), -ent.width / 2, -ent.height / 2, ent.width, ent.height);
        ent.draw(this.context);
      this.context.restore();
    }.bind(this));

    if (isDefined(this.level)) {
      this.level.draw();
    }

    // Camera shake decal layer as well
    // TODO: Check if 3d transform camera shake is faster than shake for regular canvas

    var transformation = "translate3d(" +
      (this.shake.x / this.scaleRatio) + "px," +
      (this.shake.y / this.scaleRatio) + "px, 0)";

    this.persistentCanvas.style.transform = transformation;
    this.persistentCanvas.style["-webkit-transform"] = transformation;

    requestAnimationFrame(this.draw.bind(this));
  },

  drawDecal: function (image, x, y, rotation, w, h, startFromBotLeft) {
    this.persistentContext.save();
      w = w || image.naturalWidth;
      h = h || image.naturalHeight;

      this.persistentContext.setTransform(
        Math.cos(rotation),
        Math.sin(rotation),
        -Math.sin(rotation),
        Math.cos(rotation),
        x,
        y
      );

      var xOff = 0;
      var yOff = 0;
      if (!isDefined(startFromBotLeft)) {
        xOff -= w / 2;
        yOff -= h / 2;
      }

      this.persistentContext.drawImage(image, xOff, yOff, w, h);
    this.persistentContext.restore();
  },

  setBackground: function(image) {

  },

  upgrade: function(upgradeName, args) {
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

  debugInfo: function() {
    $('#debug').html(
      "<p>" + this.debugFpsCounter + " FPS</p>" +
      "<p>" + (this.age - this.lastAge) + " ticks/s</p>" +
      "<p>" + this.entities.length + " entities</p>" +
      "<p>" + this.friendlies.length + " friendlies</p>" +
      "<p>" + this.enemies.length + " enemies</p>" +
      "<p>" + this.player.health + " player health </p>"
    );

    this.lastAge = this.age;
    this.debugFpsCounter = 0;
  }
};