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

    $('#canvas').mousemove(function (e) {
      this.mouse.x = e.pageX - this.canvas.offsetLeft;
      this.mouse.y = e.pageY - this.canvas.offsetTop;
    }.bind(this));

    this.ui = new UI(this);

    setInterval(this.step.bind(this), 1000 / this.fps);
    this.draw();
  },

  load: function () {
    this.sprites = {};
    var spriteSources = [
      ['debug', './res/sprites/debug.png'],
      ['debug2', './res/sprites/debug2.png'],
      ['flash1', './res/sprites/flash1.png'],
      ['flash2', './res/sprites/flash2.png'],
      ['bullet', './res/sprites/bullet.png'],
      ['bulletping1', './res/sprites/bulletping1.png'],
      ['explosion1', './res/sprites/explosion1.png'],
      ['explosion2', './res/sprites/explosion2.png'],
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
      this.sprites[key].src = spriteSources[i][1];
    }
  },

  step: function () {
    this.age += 1;

    this.entities.forEach(function (ent) {
      ent.executeUpgrades();
      ent.step();
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

    // Spawning
    if (this.age % 60 === 0) {
      var spawnX = Math.random() * this.canvas.width;
      var spawnY = Math.random() * this.canvas.height;
      this.entities.push(new Enemy(spawnX, spawnY, this.resources));
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

  // Few types of upgrades: run once (add/replace function or change value), passive
  upgrade: function(upgrade) {
    switch (upgrade) {
    case 'increaseBulletCount':
      this.player.upgrades.push(function () {
        if (this.firing)
          this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x), Math.random() * 5 * Math.random() > 0.5 ? -1 : 1);
      });
      break;
    case 'reduceCameraShake':
      this.shakeReduction *= 0.85;
    }
  }
};

function Entity(x, y, resources) {
  this.x = x;
  this.y = y;
  this.rotation = 0;
  this.age = 0;
  this.drawOffset = { x: 0, y: 0 };
  this.upgrades = [];
  if (typeof resources !== 'undefined') {
    this.sprites = resources.sprites;
    this.sounds = resources.sounds;
    this.game = resources.game;
    this.resources = resources;
  }
}

Entity.prototype = {
  step: function () {},
  draw: function () {},
  getImage: function () {},
  collidesWith: function(object, threshold) {
    if (typeof threshold === 'undefined') { threshold = 20; }
    return this.distanceTo(object) < threshold ? true : false;
  },
  distanceTo: function (object) {
    return Math.sqrt(Math.pow(object.x - this.x, 2) + Math.pow(object.y - this.y, 2));
  },
  faceObject: function (object) {
    this.rotation = Math.atan2(object.x - this.x, this.y - object.y);
  },
  executeUpgrades: function () {
    this.upgrades.forEach(function (upgrade) {
      upgrade.call(this);
    }.bind(this));
  }
};

function Player(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 10;

  // keypress.combo("z", function () {
  //   this.fire(Math.PI);
  // }.bind(this));

  $('#canvas').mousedown(function (e) {
    this.firing = true;
  }.bind(this));

  $('#canvas').mouseup(function (e) {
    this.firing = false;
  }.bind(this));
}
Player.prototype = new Entity();
Player.prototype.constructor = Player;
Player.prototype.step = function () {
  // this.rotation += 0.1;
  this.rotation = Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x);
  this.age += 1;
  if (this.firing) {
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));
  }
};
Player.prototype.getImage = function () {
  return this.sprites.debug;
};
Player.prototype.move = function (radians, distance) {};
Player.prototype.fire = function (radians, directionalOffset) {
  directionalOffset = directionalOffset * Math.PI / 180 || 0;
  var variance = 4 * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180 + directionalOffset;
  // Firing rate
  if (this.age % 4 === 0) {
    this.game.entities.push(
      new Bullet(this.x, this.y, this.resources, radians + variance)
    );
    this.fireShake();
  }
};
Player.prototype.fireShake = function () {
  var offsetDistance = 5;
  var shakeDistance = 7;
  var shakeX = this.x - this.game.mouse.x;
  var shakeY = this.y - this.game.mouse.y;
  var hyp = Math.sqrt(Math.pow(shakeX, 2) + Math.pow(shakeY, 2));
  this.game.shake.x += shakeX / hyp * shakeDistance;
  this.game.shake.y += shakeY / hyp * shakeDistance;
  this.drawOffset.x += shakeX / hyp * offsetDistance;
  this.drawOffset.y += shakeY / hyp * offsetDistance;
};
Player.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 30);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 30);

  if (this.firing && this.age % 4 <= 2)
    context.drawImage(this.sprites.flash1, -this.width * 2, -this.height);
  if (this.firing && this.age % 8 <= 3)
    context.drawImage(this.sprites.flash2, -this.width * 2, -this.height);
};

function Bullet(x, y, resources, direction) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 16;
  this.speed = 30;
  this.direction = direction;
  this.rotation = direction;

  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;
  this.x += this.deltaX;
  this.y += this.deltaY;
}
Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;
Bullet.prototype.step = function () {
  this.age += 1;
  this.x += this.deltaX;
  this.y += this.deltaY;
};
Bullet.prototype.getImage = function () {
  return this.sprites.bullet;
};

function Enemy(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 5;
}
Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;
Enemy.prototype.step = function () {
  this.age += 1;

  this.game.entities.forEach(function (ent) {
    if (ent.constructor === Bullet && ent !== this && this.collidesWith(ent)) {
      this.health -= 1;
      ent.markedForDeletion = true;
      this.game.entities.push(new BulletPing(ent.x, ent.y, this.resources, ent.rotation));
    }

    if (ent.constructor === Player && ent !== this && this.collidesWith(ent)) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.x, this.y, this.resources));
      ent.health -= 1;
    }

    if (this.health <= 0) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.x, this.y, this.resources));
    }

    this.faceObject(this.game.player);

    var dX = (this.game.player.x - this.x) * 0.0004 * this.health;
    var dY = (this.game.player.y - this.y) * 0.0004 * this.health;
    this.x += dX;
    this.y += dY;
  }.bind(this));
};
Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};

function BulletPing(x, y, resources, rotation) {
  Entity.call(this, x, y, resources);
  this.width = 32 + 48 * Math.random();
  this.height = 32 + 48 * Math.random();
  this.rotation = rotation + (Math.random() > 0.5 ? 1 : -1) * 50 * Math.PI / 180;
}
BulletPing.prototype = new Entity();
BulletPing.prototype.constructor = BulletPing;
BulletPing.prototype.step = function () {
  if (this.age++ > 15)
    this.markedForDeletion = true;
};
BulletPing.prototype.getImage = function () {
  return this.sprites.bulletping1;
};

function Explosion(x, y, resources, scale) {
  if (typeof scale === 'undefined') scale = 1;
  Entity.call(this, x, y, resources);
  this.width = 64 + 64 * Math.random() * scale;
  this.height = 64 + 64 * Math.random() * scale;
  this.game.shake.x += (Math.random() > 0.5 ? 1 : -1) * this.width / 5;
  this.game.shake.y += (Math.random() > 0.5 ? 1 : -1) * this.height / 5;
  // this.rotation = rotation + (Math.random() > 0.5 ? 1 : -1) * 50 * Math.PI / 180;
}
Explosion.prototype = new Entity();
Explosion.prototype.constructor = Explosion;
Explosion.prototype.step = function () {
  if (this.age++ > 20)
    this.markedForDeletion = true;
};
Explosion.prototype.getImage = function () {
  if (this.age <= 5)
    return this.sprites.flash1;
  else if (this.age <= 10)
    return this.sprites.flash2;
  else if (this.age <= 15)
    return this.sprites.explosion1;
  else
    return this.sprites.explosion2;
};

function UI(game) {
  this.game = game;
  this.setupBindings();
}

UI.prototype = {
  setupBindings: function () {
    var game = this.game;
    $('.upgrade').click(function (e) {
      game.upgrade($(this).attr('data-upgrade'));
    });
  }
};