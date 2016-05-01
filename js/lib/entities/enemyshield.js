function EnemyShield(resources, overrides) {
  Entity.call(this, resources, overrides);

  // Big Boss!
  this.sizeVariance = _.random(24);
  this.width = 84 + this.sizeVariance;
  this.height = 84 + this.sizeVariance;
  this.sprite = this.sprites.enemyshield;
  this.speed = 1.2 - Util.clamp(this.sizeVariance / 24, 0.0, 0.1);
  this.health = 30 + this.sizeVariance;

  this.shadow.on = true;
  this.xpGiven = 40;
  this.goldGiven = 20;

  this.rotation = Math.PI * 2;
  this.collisionRadius = 32;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes

  this.sounds = {
    spawn: 'warning',
    ping: 'ping'
  };

  this.game.audio.play(this.sounds.spawn);
  Entity.prototype.lookAt.bind(this)(this.game.player);
  this.rotation += Math.PI;
}

EnemyShield.prototype = new Entity();
_.extend(EnemyShield.prototype, Enemy.prototype);

EnemyShield.prototype.constructor = EnemyShield;

EnemyShield.prototype.tick = function () {
  this.returnToMap();
  Enemy.prototype.tick.bind(this)();

  var ratio = this.health / this.startingHealth;
  this.width = (84 + this.sizeVariance) * Util.clamp(ratio, 0.2, 1.0);
  this.height = (84 + this.sizeVariance) * Util.clamp(ratio, 0.2, 1.0);
};

EnemyShield.prototype.damage = function (damage, by) {
  var rot = 2 * Math.PI;
  var diff = ((rot + this.rotation) - (rot + by.direction)) % rot;

  if (Math.abs(diff) > Math.PI) {
    Entity.prototype.damage.bind(this)(damage, by);
  } else {
    Entity.prototype.damage.bind(this)(damage / 10, by);
    by.pierceChange = -0.5;
    this.game.audio.play(this.sounds.ping);
  }
};

EnemyShield.prototype.lookAt = function (object) {
  var rot = 2 * Math.PI;
  this.rotation = rot + ((this.rotation - rot) - (0.004 * (this.rotation - rot - Math.atan2(object.x - this.x, this.y - object.y))));
};

EnemyShield.prototype.explode = function () {
  var position = this.getPosition();
  var minExtraExplosions = 3;
  var maxExtraExplosions = 8;

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
    PowerupExplosion.prototype.activate.bind(this)();
  }

  Enemy.prototype.explode.bind(this)();
};
