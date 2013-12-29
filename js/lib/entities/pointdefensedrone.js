function PointDefenseDrone (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;

  this.shadow.on = true;
  this.shadow.size = { x: 4, y: 4 };
  this.shadow.shape = 'circle';

  this.sounds = { build: 'beep', fire: 'shoot1' };
  this.game.audio.play(this.sounds.build, 0.9);

  this.alignment = 'friendly';
  this.friendlyPierceChance = 1;
  this.enemyPierceChance = 0;

  this.orbitRadius = 64;
  this.angularVelocity = 2;
  this.fireRate = 2;
  this.variance = 1;
  this.target = null;
  this.bulletDamage = 0.5;
  this.bulletLifespan = 5;
  this.bulletSpeed = 30;
}

PointDefenseDrone.prototype = new Entity();

PointDefenseDrone.prototype.constructor = PointDefenseDrone;

PointDefenseDrone.prototype.tick = function () {
  var rad = Util.deg2rad(this.age % 360) * this.angularVelocity;
  this.x = this.game.player.x + -Math.cos(rad) * this.orbitRadius;
  this.y = this.game.player.y + Math.sin(rad) * this.orbitRadius;
  this.rotation = rad;

  if (this.age % 2 === 0) {
    if (Util.isDefined(this.game.player.nearestEnemy) &&
        this.game.player.distanceToNearestEnemy < 200 &&
        !this.game.player.nearestEnemy.markedForDeletion)
      this.fireAt(this.game.player.nearestEnemy);
  }
};

PointDefenseDrone.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

PointDefenseDrone.prototype.fire = function (radians) {
  var variance = Util.randomError(this.variance);

  this.game.addEntity(
    new Bullet(this.resources, {
      x: this.x,
      y: this.y,
      direction: radians + variance,
      rotation: radians + variance,
      damage: this.bulletDamage,
      speed: this.bulletSpeed,
      source: this.game.player,
      lifespan: this.bulletLifespan
    })
  );

  if (Math.random() > 0.8) {
    this.game.audio.play(this.sounds.fire, 0.05);
  }
};

PointDefenseDrone.prototype.getImage = function () {
  return this.sprites.flash1;
};