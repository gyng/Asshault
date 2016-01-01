function Enemy (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 32;
  this.height = 32;
  this.health = 5;
  this.speed  = 5;
  this.shadow.on = true;
  this.xpGiven = 10;
  this.goldGiven = 5;
  this.sprite = resources.sprites.debug2;

  this.alignment = 'enemy';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes

  this.applyOverrides();
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.tick = function () {
  this.game.friendlies.forEach(function (ent) {
    if (ent.constructor === Player && this.collidesWith(ent)) {
      ent.health -= 1;
      if (ent === this.game.player) {
        this.game.renderer.flash("#canvas", "danger");
      }
      this.explode();
    }
  }.bind(this));

  if (this.health <= 0) {
    this.lastHitBy.source.addXP(this.xpGiven, 1);
    this.lastHitBy.source.updateInfo();
    this.game.addGold(this.goldGiven);
    this.explode();
  }

  if (this.age % (10 + (5 - this.health) + _.random(3))) {
    this.drawOffset.y += Util.randomError(2);
  }

  this.drawOffset.y *= 0.9;
  this.lookAt(this.game.player);
  this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
};

Enemy.prototype.getImage = function () {
  return this.sprite;
};

Enemy.prototype.explode = function () {
  this.die();
  this.game.addEntity(new Explosion(this.resources, this.getPosition()));

  this.game.renderer.drawDecal(
      this.sprites.bloodstain,
      this.x - this.width / 2,
      this.y - this.height / 2,
      Util.randomRad(),
      64 + _.random(32),
      64 + _.random(32));

  this.game.renderer.drawDecal(
    this.sprites.bloodspray,
    this.x,
    this.y,
    this.rotation,
    52 + _.random(16),
    128 + _.random(386),
    true);
};
