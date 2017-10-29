function EnemyCamper(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 24;
  this.height = 24;
  this.health = 10;
  this.speed = 0;
  this.shadow.on = true;
  this.xpGiven = 20;
  this.goldGiven = 10;
  this.sprite = this.sprites.debug5;

  this.alignment = "enemy";
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes

  this.triggered = false;
  this.sounds = {
    warn: "moan",
    attack: "blare"
  };
}

EnemyCamper.prototype = new Entity();
_.extend(EnemyCamper.prototype, Enemy.prototype);

EnemyCamper.prototype.constructor = EnemyCamper;

EnemyCamper.prototype.tick = function() {
  var distanceToPlayer = this.distanceTo(this.game.player);
  var warningDistance = 300;
  var attackDistance = 200;

  this.highlighted = distanceToPlayer < warningDistance;

  if (distanceToPlayer < warningDistance && distanceToPlayer > attackDistance) {
    var volumeModifier =
      0.5 * (1.0 - (distanceToPlayer - attackDistance) / attackDistance);
    this.game.audio.play(this.sounds.warn, volumeModifier);
  }

  if (distanceToPlayer < attackDistance && !this.triggered) {
    this.highlightColor = "rgba(250, 37, 37, 0.5)";
    this.triggered = true;
    this.game.audio.play(this.sounds.attack);
    this.speed = 1;
  }

  this.speed *= 1.05;
  Enemy.prototype.tick.bind(this)();

  if (!this.triggered) {
    this.returnToMap();
  }
};

EnemyCamper.prototype.explode = function() {
  this.die();

  Enemy.prototype.explode.bind(this)();

  // Drop a bomb if killed by player
  if (this.health <= 0 && Math.random() < 0.2) {
    this.game.addPowerup(
      new PowerupExplosion(this.resources, this.getPosition())
    );
  }
};
