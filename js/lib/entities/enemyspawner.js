function EnemySpawner(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.speed = 0;
  this.shadow.on = true;
  this.sprite = this.sprites.enemyspawner;
  this.frequencyMultiplierBase = 1 + Math.random();
  this.frequencyMultiplier = this.frequencyMultiplierBase;
  this.cooldownBase =  200 / this.frequencyMultiplier;
  this.cooldown = this.cooldownBase;
  this.width = 64 * this.frequencyMultiplier;
  this.height = 64 * this.frequencyMultiplier;
  this.xpGiven = Math.ceil(20 * this.frequencyMultiplier);
  this.goldGiven = Math.ceil(20 * this.frequencyMultiplier);
  this.baseHealth = Math.ceil(80 * this.frequencyMultiplier);
  this.health = this.baseHealth;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes

  this.triggered = false;
  this.sounds = {
    spawn: 'moan'
  };
}

EnemySpawner.prototype = new Entity();
_.extend(EnemySpawner.prototype, Enemy.prototype);

EnemySpawner.prototype.constructor = EnemySpawner;

EnemySpawner.prototype.tick = function () {
  Enemy.prototype.tick.bind(this)();
  this.returnToMap();
  this.cooldown--;
  this.rotation += Math.PI * 2 * this.cooldown / this.cooldownBase;

  var ratio = this.health / this.baseHealth;
  this.width = (64 * this.frequencyMultiplier) * Util.clamp(ratio, 0.5, 1.0);
  this.height = (64 * this.frequencyMultiplier) * Util.clamp(ratio, 0.5, 1.0);
  this.cooldownBase = 200 / Util.clamp(ratio, 0.3, 1.0) / this.frequencyMultiplierBase;

  this.highlighted = this.cooldown <= 3;

  if (this.cooldown <= 0) {
    var enemy = new Enemy(this.game.resources, {
      drawFade: true,
      shadow: false,
      xpGiven: 0,
      goldGiven: 0,
      health: 2
    });
    this.game.spawnEnemy(enemy, this.x, this.y);
    this.game.audio.play(this.sounds.spawn, 0.5);
    this.cooldown = this.cooldownBase;
  }
};

EnemySpawner.prototype.explode = function () {
  this.die();

  Enemy.prototype.explode.bind(this)();

  // Drop a bomb if killed by player
  if (this.health <= 0 && Math.random() < 0.8) {
    this.game.addPowerup(new PowerupExplosion(this.resources, this.getPosition()));
  }
};
