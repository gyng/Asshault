function BulletPing(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 48 + _.random(64);
  this.height = 48 + _.random(64);

  this.applyOverrides();

  this.rotation += deg2rad(randomNegation(_.random(50)));
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



function Explosion(resources, overrides) {
  Entity.call(this, resources, overrides);

  scale = 1;
  this.width = 128 + 128 * Math.random() * scale;
  this.height = 128 + 128 * Math.random() * scale;
  this.game.shake.x += randomNegation(this.width / 5);
  this.game.shake.y += randomNegation(this.height / 5);

  this.applyOverrides();

  this.hasShadow = true;
  this.shadowOffset = { x: 0, y: -30 };
  this.shadowOpacity = 0.7;
  this.shadowColor = "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")";
  this.shadowSize = { x: 120 + _.random(40), y: 120 };
  this.shadowShape = 'circle'
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.tick = function () {
  this.shadowSize.x *= 1.07;
  this.shadowOpacity *= 0.8;
  this.shadowColor = "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")";
  this.width /= 1.05;
  this.height /= 1.05;

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