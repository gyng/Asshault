function Game() {
  this.load();
}

Game.prototype = {
  initialize: function () {
    this.canvas   = $('#canvas')[0];
    this.context  = this.canvas.getContext('2d');
    this.fps      = 60;
    this.age      = 0;
    this.mouse    = { x: 0, y: 0 };
    this.shake    = { x: 0, y: 0 };
    this.shakeReduction = 0.95;

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;

    this.resources = {
      game:    this,
      sprites: this.sprites,
      sounds:  this.sounds
    };
    this.player   = new Player(200, 200, this.resources);
    this.entities = [this.player];
    this.friendlies = [this.player];
    this.enemies = [];

    $('#canvas').mousemove(function (e) {
      this.mouse.x = e.pageX - this.canvas.offsetLeft;
      this.mouse.y = e.pageY - this.canvas.offsetTop;
    }.bind(this));

    this.ui = new UI(this);
    this.upgradeCount = {};
    this.upgrades = new Upgrades(this);

    setInterval(this.step.bind(this), 1000 / this.fps);
    this.draw();
  },

  load: function () {
    this.sprites = {};
    var spritesDir = './res/sprites/';
    var spriteSources = [
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
      ['herosniper',  'herosniper.png']
    ];

    this.sounds = {};

    // Loader
    var loadedSprites = 0;
    var loadedCallback = function () {
      loadedSprites++;
      if (loadedSprites === spriteSources.length) { this.initialize(); }
    }.bind(this);

    for (var i = 0; i < spriteSources.length; i++) {
      key = spriteSources[i][0];
      this.sprites[key] = new Image();
      this.sprites[key].onload = loadedCallback;
      this.sprites[key].src = spritesDir + spriteSources[i][1];
    }
  },

  step: function () {
    this.age += 1;

    this.entities.forEach(function (ent) {
      ent.tock();
      ent.executeUpgrades();
      ent.tick();
    });

    // Out of map
    this.entities = this.entities.map(function (ent) {
      if (ent.x < -10 || ent.x > this.canvas.width + 10 ||
          ent.y < -10 || ent.y > this.canvas.height + 10) {
        ent.markedForDeletion = true;
      }

      return ent;
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
    if (this.age % 30 === 0) {
      this.ui.setAvailableUpgrades();
    }

    // Spawning
    if (this.age % 45 === 0) {
      var spawnX = _.random(this.canvas.width);
      var spawnY = _.random(this.canvas.height);
      var enemy = new Enemy(spawnX, spawnY, this.resources);
      this.entities.push(enemy);
      this.enemies.push(enemy);
    }
  },

  draw: function () {
    // Clear canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update camera shake
    this.shake.x *= this.shakeReduction;
    this.shake.y *= this.shakeReduction;

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

    requestAnimationFrame(this.draw.bind(this));
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
  }
};