function Enemy(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.health = 5;
  this.speed = 1;
}

Enemy.prototype = new Entity();

Enemy.prototype.constructor = Enemy;

Enemy.prototype.step = function () {
  this.age += 1;

  this.game.entities.forEach(function (ent) {
    if (ent.constructor === Bullet && ent !== this && this.collidesWith(ent)) {
      this.health -= 1;
      ent.markedForDeletion = true;
      this.game.entities.push(new BulletPing(ent.x, ent.y, this.resources, ent.rotation));
    }

    if (ent.constructor === Player && ent !== this && this.collidesWith(ent)) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.x, this.y, this.resources));
      ent.health -= 1;
    }

    if (this.health <= 0) {
      this.markedForDeletion = true;
      this.game.entities.push(new Explosion(this.x, this.y, this.resources));
    }

    this.faceObject(this.game.player);

    this.moveTo(this.game.player.x, this.game.player.y, this.speed, this.health / 10);
  }.bind(this));
};

Enemy.prototype.getImage = function () {
  return this.sprites.debug2;
};