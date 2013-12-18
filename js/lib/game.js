function Game() {
  this.load();
}

Game.prototype = {
  initialize: function () {
    this.canvas   = $('#canvas')[0];
    this.context  = this.canvas.getContext('2d');
    this.fps      = 60;
    this.age      = 0;
    this.mouse    = { x: 0, y: 0 }
    this.shake    = { x: 0, y: 0 }
    this.entities = [];

    // var playerSprites = {
    //   up: this.sprites.debug
    // };
    this.player = new Player(200, 200, this.sprites, this.sounds, this);
    this.entities.push(this.player);

    $('#canvas').mousemove(function (e) {
      this.mouse.x = e.pageX - this.canvas.offsetLeft;
      this.mouse.y = e.pageY - this.canvas.offsetTop;
    }.bind(this));

    setInterval(this.step.bind(this), 1000 / this.fps);
    this.draw();
  },

  load: function () {
    this.sprites = {};
    var spriteSources = [
      ['debug', './res/sprites/debug.png'],
      ['flash1', './res/sprites/flash1.png'],
      ['flash2', './res/sprites/flash2.png'],
      ['bullet', './res/sprites/bullet.png']
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
    this.entities.forEach(function (ent) {
      ent.step();
    });

    // Culling
    this.entities = this.entities.filter(function (ent) {
      return !(ent.x < -10 || ent.x > this.canvas.width + 10 ||
               ent.y < -10 || ent.y > this.canvas.height + 10);
    });
  },

  draw: function () {
    // Clear canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update camera shake
    this.shake.x *= 0.9;
    this.shake.y *= 0.9;

    this.entities.forEach(function (ent) {
      this.context.save();
        // Transformation matrix
        // [ a, c, e ]
        // [ b, d, f ]
        // setTransform(a, b, c, d, e, f)
        this.context.setTransform(
          Math.cos(ent.rotation),  Math.sin(ent.rotation),
          -Math.sin(ent.rotation), Math.cos(ent.rotation),
          ent.x + this.shake.x,    ent.y + this.shake.y
        );
        this.context.drawImage(ent.getImage(), -ent.width / 2, -ent.height / 2);
        ent.draw(this.context);
      this.context.restore();
    }.bind(this));

    requestAnimationFrame(this.draw.bind(this));
  }
};

function Entity(x, y, sprites, sounds, game) {
  this.x = x;
  this.y = y;
  this.rotation = 0;
  this.age = 0;
  this.sprites = sprites;
  this.sounds = sounds;
  this.game = game;
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
  }
};

function Player(x, y, sprites, sounds, game) {
  Entity.call(this, x, y, sprites, sounds, game);
  this.width = 32;
  this.height = 32;

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
  this.rotation = Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x)
  this.age += 1;
  if (this.firing) {
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));
  }
};
Player.prototype.getImage = function () {
  return this.sprites.debug;
};
Player.prototype.move = function (radians, distance) {};
Player.prototype.fire = function (radians) {
  variance = 4 * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180;
  // Firing rate
  if (this.age % 4 == 0) {
    this.game.entities.push(
      new Bullet(this.x, this.y, this.sprites, this.sounds, this.game, radians + variance)
    );

    var shakeDistance = 10;
    var shakeX = this.x - this.game.mouse.x;
    var shakeY = this.y - this.game.mouse.y;
    var hyp = Math.sqrt(Math.pow(shakeX, 2) + Math.pow(shakeY, 2));
    this.game.shake.x += shakeX / hyp * shakeDistance;
    this.game.shake.y += shakeY / hyp * shakeDistance;
  }
};
Player.prototype.draw = function (context) {
  if (this.firing && this.age % 4 <= 2)
    context.drawImage(this.sprites.flash1, -this.width * 2, -this.height);
  if (this.firing && this.age % 8 <= 3)
    context.drawImage(this.sprites.flash2, -this.width * 2, -this.height);
};

function Bullet(x, y, sprites, sounds, game, direction) {
  Entity.call(this, x, y, sprites, sounds, game);
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

function Enemy(x, y, sprites, sounds, game) {
  Entity.call(this, x, y, sprites, sounds, game)
}