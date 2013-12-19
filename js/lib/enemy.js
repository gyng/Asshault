function Enemy(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 5;
  this.speed = 5;
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.tick = function () {
  this.game.entities.forEach(function (ent) {
    if (ent.constructor === Bullet && ent !== this && this.collidesWith(ent, ent.speed * 0.75)) {
      this.health -= ent.damage;
      ent.markedForDeletion = true;
      this.game.entities.push(new BulletPing(ent.x, ent.y, this.resources, ent.rotation));
    }

    if (ent.constructor === Player && ent !== this && this.collidesWith(ent)) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.x, this.y, this.resources));
      ent.health -= 1;
    }
  }.bind(this));

  if (this.health <= 0) {
    this.markedForDeletion = true;
    this.game.entities.push(new Explosion(this.x, this.y, this.resources));
  }

  this.lookAt(this.game.player);

  this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
};

Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};