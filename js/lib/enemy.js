function Enemy(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;
  this.health = 5;
  this.speed = 5;

  this.applyOverrides();
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.tick = function () {
  this.game.friendlies.forEach(function (ent) {
    if (ent.constructor === Player && ent !== this && this.collidesWith(ent)) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.resources, { x: this.x, y: this.y }));
      ent.health -= 1;
    }
  }.bind(this));

  if (this.health <= 0) {
    this.markedForDeletion = true;
    this.game.entities.push(new Explosion(this.resources, { x: this.x, y: this.y }));
  }

  this.lookAt(this.game.player);

  this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
};

Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};