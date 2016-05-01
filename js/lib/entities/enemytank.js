function EnemyTank(resources, overrides) {
  Entity.call(this, resources, overrides);

  // Big Boss!
  var sizeVariance = _.random(24);
  this.width = 48 + sizeVariance;
  this.height = 48 + sizeVariance;
  this.sprite = this.sprites.debug3;
  this.speed = 0.9 - Math.min(0.7, sizeVariance / 48);
  this.health = 10 + sizeVariance;

  this.shadow.on = true;
  this.xpGiven = 20;
  this.goldGiven = 10;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes
}

EnemyTank.prototype = new Entity();
_.extend(EnemyTank.prototype, Enemy.prototype);

EnemyTank.prototype.constructor = EnemyTank;

EnemyTank.prototype.explode = function () {
  var position = this.getPosition();
  var minExtraExplosions = 1;
  var maxExtraExplosions = 4;

  var explosionOverrides = function () {
    var maxOffset = 64;
    var maxDelay = 72;

    return {
      x: position.x + _.random(maxOffset),
      y: position.y + _.random(maxOffset),
      age: -(_.random(maxDelay))
    };
  };

  // Spawn an explosion immediately
  for (var i = 0; i < _.random(minExtraExplosions, maxExtraExplosions); i++) {
    this.game.addEntity(new Explosion(this.resources, explosionOverrides()));
  }

  // Drop a coin if killed by player
  if (this.health <= 0) {
    this.game.addPowerup(new PowerupCoin(this.resources, this.getPosition()));
  }

  Enemy.prototype.explode.bind(this)();
};
