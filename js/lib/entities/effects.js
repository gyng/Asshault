function BulletPing(resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width     = 48 + _.random(64);
  this.height    = 48 + _.random(64);
  this.lifespan  = 13 + _.random(4);
  this.todScale  = 0;
  this.rotation += deg2rad(randomNegation(_.random(50)));

  this.sounds = {
    spawn: ['hit_hurt', 'hit_hurt2', 'hit_hurt3', 'hit_hurt4', 'hit_hurt5', 'hit_hurt6']
  };
  this.game.audio.play(this.sounds.spawn, 0.8);
}

BulletPing.prototype = new Entity();

BulletPing.prototype.constructor = BulletPing;

BulletPing.prototype.tick = function () {
  if (this.age > this.lifespan)
    this.die();
};

BulletPing.prototype.getImage = function () {
  return this.sprites.bulletping1;
};



function Explosion(resources, overrides) {
  Entity.call(this, resources, overrides);

  scale = 1;
  this.width  = 128 + 128 * Math.random() * scale;
  this.height = 128 + 128 * Math.random() * scale;
  this.game.renderer.shake.x += randomNegation(this.width / 6);
  this.game.renderer.shake.y += randomNegation(this.height / 6);

  this.shadowOpacity = 0.7;
  this.shadow = {
    on: true,
    offset: { x: 0, y: -30 },
    color: "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")",
    size: { x: 120 + _.random(40), y: 120 },
    shape: 'circle',
    todScale: 0
  };

  this.sounds = {
    spawn: ['explosion', 'explosion2', 'explosion3', 'explosion4', 'explosion5']
  };
  this.game.audio.play(this.sounds.spawn, 0.8);
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.tick = function () {
  this.shadow.size.x *= 1.07;
  this.shadowOpacity *= 0.80;
  this.shadow.color = "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")";

  this.width  /= 1.05;
  this.height /= 1.05;

  if (this.age > 18)
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