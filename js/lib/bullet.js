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
};

Bullet.prototype.getImage = function () {
  return this.sprites.bullet;
};