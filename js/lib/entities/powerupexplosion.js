function PowerupExplosion(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 48;
  this.height = 48;
  this.shadow.on = true;
  this.sprite = resources.sprites.ball;
  this.health = 40;
}

PowerupExplosion.prototype = new Entity();
_.extend(PowerupExplosion.prototype, Powerup.prototype);

PowerupExplosion.prototype.constructor = PowerupExplosion;

PowerupExplosion.prototype.tick = function () {
  if (this.collidesWith(this.game.player)) {
    this.activate();
  }

  if (this.health <= 0) {
    this.activate();
  }

  if (this.age > 300) {
    this.die();
  }

  this.pulse(this.age);
};

PowerupExplosion.prototype.activate = function () {
  this.game.addEntity(new Explosion(this.resources, this.getPosition()));

  var numBullets = 32 + _.random(32);
  var stepDeg = 360 / numBullets;

  for (var i = 0; i < numBullets; i++) {
    var rad = Util.deg2rad(stepDeg * i);
    var bullet = new Bullet(this.resources, {
      x: this.x + Util.randomError(20),
      y: this.y + Util.randomError(20),
      rotation: rad,
      direction: rad,
      alignment: 'friendly',
      damage: 10,
      source: this.game.player
    });

    this.game.addEntity(bullet);
  }

  this.die();
};
