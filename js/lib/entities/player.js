function Player(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 48;
  this.height = 48;
  this.health = 10;
  this.spread = 5;
  this.firingRate = 4;
  this.speed = 0;
  this.shadow.on = true;

  this.xp = 0;
  this.kills = 0;

  this.info.draw = true;

  this.sounds = {
    fire: ['shoot2', 'shoot5', 'shoot7']
  };

  $('#canvas').mousedown(function (e) {
    this.firing = true;
  }.bind(this));

  $(document).mouseup(function (e) {
    this.firing = false;
  }.bind(this));
}

Player.prototype = new Entity();

Player.prototype.constructor = Player;

Player.prototype.tick = function () {
  if (this.firing)
    this.fire(Math.atan2(this.y - this.game.mouse.y, this.x - this.game.mouse.x));

  this.lookAt({ x: this.game.mouse.x, y: this.game.mouse.y });
  this.returnToMap();

  this.every(15, function () {
    this.info.text = [
      this.xp + 'xp',
      this.health + 'hp'
    ];
  }.bind(this));
};

Player.prototype.returnToMap = function () {
  var returnScale = 0.05;
  var margin = 50;

  if (this.x > this.game.canvas.width - margin)
    this.x -= returnScale * (this.x - (this.game.canvas.width - margin));
  else if (this.x < margin)
    this.x += returnScale * (margin - this.x);

  if (this.y > this.game.canvas.height - margin)
    this.y -= returnScale * (this.y - (this.game.canvas.height - margin));
  else if (this.y < margin)
    this.y += returnScale * (margin - this.y);
};

Player.prototype.getImage = function () {
  return this.sprites.debug;
};

Player.prototype.fire = function (radians, offsetDegrees) {
  var offset = deg2rad(randomError(this.spread) + randomNegation(offsetDegrees || 0));

  this.every(this.firingRate, function () {
    this.game.addEntity(
      new Bullet(this.resources, {
        x: this.x,
        y: this.y,
        direction: radians + offset,
        rotation: radians + offset,
        damage: 1,
        speed: 30,
        source: this
      })
    );

    this.fireShake();
    this.game.audio.play(this.sounds.fire, 0.3);
  });
};

Player.prototype.fireShake = function () {
  var offsetDistance = 5;
  var shakeDistance = 7;
  var normalized = normalize({ x: this.x - this.game.mouse.x, y: this.y - this.game.mouse.y });
  this.game.renderer.shake.x += normalized.x * shakeDistance;
  this.game.renderer.shake.y += normalized.y * shakeDistance;
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