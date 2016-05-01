function EnemyRunner(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 24;
  this.height = 24;
  this.health = 3;
  this.speed = 5;
  this.shadow.on = true;
  this.xpGiven = 20;
  this.goldGiven = 10;
  this.sprite = this.sprites.debug4;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes
}

EnemyRunner.prototype = new Entity();
_.extend(EnemyRunner.prototype, Enemy.prototype);

EnemyRunner.prototype.constructor = EnemyRunner;

EnemyRunner.prototype.tick = function () {
  if (this.age === 0) {
    this.say('Uraaa!', 1);
  }

  if (this.age > 120) {
    this.highlighted = true;
  }

  this.speed *= 1.01;
  Enemy.prototype.tick.bind(this)();
};

EnemyRunner.prototype.explode = function () {
  this.die();

  // Drop a bomb if killed by player
  if (this.health <= 0) {
    this.game.addPowerup(new PowerupExplosion(this.resources, this.getPosition()));
  }
};
