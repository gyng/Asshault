function EnemyTank (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 48;
  this.height = 48;
  this.health = 20;
  this.speed  = 1;
  this.shadow.on = true;
  this.xpGiven = 20;
  this.goldGiven = 10;
  this.sprite = this.sprites.debug3;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes

  this.applyOverrides();
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

  Enemy.prototype.explode.bind(this)();
};
