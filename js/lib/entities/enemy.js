function Enemy(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 32;
  this.height = 32;
  this.health = 5;
  this.speed  = 5;
  this.shadow.on = true;
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.tick = function () {
  this.game.friendlies.forEach(function (ent) {
    if (ent.constructor === Player && this.collidesWith(ent)) {
      ent.health -= 1;
      this.explode();
    }
  }.bind(this));

  if (this.health <= 0)
    this.explode();

  this.lookAt(this.game.player);
  this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
};

Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};

Enemy.prototype.explode = function () {
  this.die();
  this.game.addEntity(new Explosion(this.resources, this.getPosition()));

  this.game.renderer.drawDecal(
      this.sprites.bloodstain,
      this.x - this.width / 2,
      this.y - this.height / 2,
      randomRad(),
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