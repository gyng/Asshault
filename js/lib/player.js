function Player(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 48;
  this.height = 48;
  this.health = 10;
  this.spread = 5;
  this.firingRate = 4;
  this.speed = 0;

  $('#canvas').mousedown(function (e) {
    this.firing = true;
  }.bind(this));

  $('#canvas').mouseup(function (e) {
    this.firing = false;
  }.bind(this));

  this.applyOverrides();

  this.hasShadow = true;
}

Player.prototype = new Entity();

Player.prototype.constructor = Player;

Player.prototype.tick = function () {
  this.lookAt({ x: this.game.mouse.x, y: this.game.mouse.y });

  this.returnToMap();

  if (this.firing) {
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));
  }
};

Player.prototype.returnToMap = function () {
  var returnSpeed = 0.05;
  var margin = 50;

  if (this.x > this.game.canvas.width - margin) {
    this.x -= (this.x - (this.game.canvas.width - margin)) * returnSpeed;
  } else if (this.x < margin) {
    this.x += (margin - this.x) * returnSpeed;
  }

  if (this.y > this.game.canvas.height - margin) {
    this.y -= (this.y - (this.game.canvas.height - margin)) * returnSpeed;
  } else if (this.y < margin) {
    this.y += (margin - this.y) * returnSpeed;
  }
};

Player.prototype.getImage = function () {
  return this.sprites.debug;
};

Player.prototype.fire = function (radians, offsetDegrees) {
  var offset = deg2rad(randomError(this.spread) + randomNegation(offsetDegrees || 0));

  if (this.age % this.firingRate === 0) {
    this.game.entities.push(
      new Bullet(this.resources, {
        x: this.x,
        y: this.y,
        direction: radians + offset,
        rotation: radians + offset,
        damage: 1,
        speed: 30
      })
    );

    this.fireShake();
  }
};

Player.prototype.fireShake = function () {
  var offsetDistance = 5;
  var shakeDistance = 7;
  var normalized = normalize({ x: this.x - this.game.mouse.x, y: this.y - this.game.mouse.y });
  this.game.shake.x += normalized.x * shakeDistance;
  this.game.shake.y += normalized.y * shakeDistance;
  this.drawOffset.x += normalized.x * offsetDistance;
  this.drawOffset.y += normalized.y * offsetDistance;
};

Player.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 15);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 15);

  if (this.firing) {
    var flashPos = { x: -this.width / 2, y: -this.height * 1.5 };

    if (this.age % this.firingRate <= this.firingRate / 2)
      context.drawImage(this.sprites.flash1, flashPos.x, flashPos.y);

    if (this.age % this.firingRate * 2 <= this.firingRate / 8 * 3)
      context.drawImage(this.sprites.flash2, flashPos.x, flashPos.y);
  }
};