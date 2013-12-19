function BulletPing(x, y, resources, rotation) {
  Entity.call(this, x, y, resources);
  this.width = 32 + 48 * Math.random();
  this.height = 32 + 48 * Math.random();
  this.rotation = rotation + (Math.random() > 0.5 ? 1 : -1) * 50 * Math.PI / 180;
}

BulletPing.prototype = new Entity();

BulletPing.prototype.constructor = BulletPing;

BulletPing.prototype.step = function () {
  if (this.age++ > 15)
    this.markedForDeletion = true;
};

BulletPing.prototype.getImage = function () {
  return this.sprites.bulletping1;
};



function Explosion(x, y, resources, scale) {
  if (typeof scale === 'undefined') scale = 1;
  Entity.call(this, x, y, resources);
  this.width = 64 + 64 * Math.random() * scale;
  this.height = 64 + 64 * Math.random() * scale;
  this.game.shake.x += (Math.random() > 0.5 ? 1 : -1) * this.width / 5;
  this.game.shake.y += (Math.random() > 0.5 ? 1 : -1) * this.height / 5;
  // this.rotation = rotation + (Math.random() > 0.5 ? 1 : -1) * 50 * Math.PI / 180;
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.step = function () {
  if (this.age++ > 20)
    this.markedForDeletion = true;
};

Explosion.prototype.getImage = function () {
  if (this.age <= 5)
    return this.sprites.flash1;
  else if (this.age <= 10)
    return this.sprites.flash2;
  else if (this.age <= 15)
    return this.sprites.explosion1;
  else
    return this.sprites.explosion2;
};