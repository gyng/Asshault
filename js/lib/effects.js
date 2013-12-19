function BulletPing(x, y, resources, rotation) {
  Entity.call(this, x, y, resources);
  this.width = 32 + _.random(48);
  this.height = 32 + _.random(48);
  this.rotation = rotation + deg2rad(randomNegation(_.random(50)));
}

BulletPing.prototype = new Entity();

BulletPing.prototype.constructor = BulletPing;

BulletPing.prototype.tick = function () {
  if (this.age > 15)
    this.markedForDeletion = true;
};

BulletPing.prototype.getImage = function () {
  return this.sprites.bulletping1;
};



function Explosion(x, y, resources, scale) {
  Entity.call(this, x, y, resources);

  scale = scale || 1;
  this.width = 64 + 64 * Math.random() * scale;
  this.height = 64 + 64 * Math.random() * scale;
  this.game.shake.x += randomNegation(this.width / 5);
  this.game.shake.y += randomNegation(this.height / 5);
  // this.rotation = deg2rad(randomNegation(360));
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.tick = function () {
  if (this.age > 20)
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