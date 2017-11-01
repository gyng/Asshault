function PowerupExplosion(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 48;
  this.height = 48;
  this.shadow.on = true;
  this.sprite = resources.sprites.ball;
  this.duration = 250 + _.random(100);
  this.health = 40;
}

PowerupExplosion.prototype = new Entity();
_.extend(PowerupExplosion.prototype, Powerup.prototype);

PowerupExplosion.prototype.constructor = PowerupExplosion;

PowerupExplosion.prototype.tick = function() {
  if (this.collidesWith(this.game.player, this.collisionRadius)) {
    this.activate();
  }

  if (this.health <= 0) {
    this.activate();
  }

  if (this.duration - this.age < 80) {
    this.opacity = 0.4;
  }

  if (this.age > this.duration) {
    this.die();
  }

  this.pulse(this.age);
};

PowerupExplosion.prototype.activate = function(BulletType) {
  this.game.addEntity(new Explosion(this.resources, this.getPosition()));
  BulletType = BulletType || Bullet;

  var numBullets = 32 + _.random(32);
  var stepDeg = 360 / numBullets;

  for (var i = 0; i < numBullets; i++) {
    var rad = Util.deg2rad(stepDeg * i);
    var bullet = new BulletType(this.resources, {
      x: this.x + Util.randomError(20),
      y: this.y + Util.randomError(20),
      rotation: rad,
      direction: rad,
      alignment: "friendly",
      damage: 10,
      source: this.game.player,
      sprite: this.game.sprites.bullet
    });

    this.game.addEntity(bullet);
  }

  this.die();
};
