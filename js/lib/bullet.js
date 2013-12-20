function Bullet(x, y, resources, direction, damage, speed) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 16;
  this.direction = direction;
  this.rotation = direction;
  this.damage = damage || 1;
  this.speed = speed || 30;

  // Calculate on creation and not per tick
  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;
  this.x += this.deltaX;
  this.y += this.deltaY;
}

Bullet.prototype = new Entity();

Bullet.prototype.constructor = Bullet;

Bullet.prototype.tick = function () {
  this.x += this.deltaX;
  this.y += this.deltaY;

  this.game.enemies.forEach(function (ent) {
    if (this.collidesWith(ent, this.speed * 0.75)) {
      ent.health -= this.damage;
      this.markedForDeletion = true;
      this.game.entities.push(new BulletPing(ent.x, ent.y, this.resources, ent.rotation));
    }
  }.bind(this));

  if (this.age % 10 === 0) {
    this.checkOutOfBounds();
  }
};

Bullet.prototype.checkOutOfBounds = function () {
  if (this.x < -10 || this.x > this.game.canvas.width + 10 ||
      this.y < -10 || this.y > this.game.canvas.height + 10) {
    this.markedForDeletion = true;
  }
};

Bullet.prototype.getImage = function () {
  return this.sprites.bullet;
};