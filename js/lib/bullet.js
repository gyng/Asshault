function Bullet(x, y, resources, direction) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 16;
  this.speed = 30;
  this.direction = direction;
  this.rotation = direction;

  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;
  this.x += this.deltaX;
  this.y += this.deltaY;
}
Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;
Bullet.prototype.step = function () {
  this.age += 1;
  this.x += this.deltaX;
  this.y += this.deltaY;
};
Bullet.prototype.getImage = function () {
  return this.sprites.bullet;
};