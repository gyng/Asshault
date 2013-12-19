function Player(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 10;
  this.spread = 5;
  this.firingRate = 4;

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

Player.prototype.tick = function () {
  this.lookAt({ x: this.game.mouse.x, y: this.game.mouse.y });

  if (this.firing) {
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));
  }
};

Player.prototype.getImage = function () {
  return this.sprites.debug;
};

Player.prototype.fire = function (radians, offsetDegrees) {
  var offset = deg2rad(randomError(this.spread) + randomNegation(offsetDegrees || 0));

  if (this.age % this.firingRate === 0) {
    this.game.entities.push(new Bullet(this.x, this.y, this.resources, radians + offset, 1, 30));
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
    var flashPos = { x: -this.width, y: -this.height * 2 };

    if (this.age % this.firingRate <= this.firingRate / 2)
      context.drawImage(this.sprites.flash1, flashPos.x, flashPos.y);

    if (this.age % this.firingRate * 2 <= this.firingRate / 8 * 3)
      context.drawImage(this.sprites.flash2, flashPos.x, flashPos.y);
  }
};