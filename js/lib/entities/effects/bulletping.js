function BulletPing(resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width = 32 + _.random(64) + _.random(64);
  this.height = 32 + _.random(64) + _.random(64);
  this.lifespan = 4 + _.random(32);
  this.todScale = 0;
  this.rotation += Util.deg2rad(Util.randomNegation(_.random(50)));

  this.sprite = this.sprite || this.sprites.aSparks;

  this.sounds = {
    spawn: [
      "hit_hurt",
      "hit_hurt2",
      "hit_hurt3",
      "hit_hurt4",
      "hit_hurt5",
      "hit_hurt6"
    ]
  };
  this.game.audio.play(this.sounds.spawn, 0.8);
}

BulletPing.prototype = new Entity();

BulletPing.prototype.constructor = BulletPing;

BulletPing.prototype.tick = function() {
  if (this.age > this.lifespan) {
    this.die();
  }
};

BulletPing.prototype.getImage = function() {
  if (this.sprite.length > 0) {
    var frameDuration = this.lifespan / this.sprite.length;
    var frame = Math.floor(this.age / frameDuration);
    return this.sprite[frame] || this.sprites.transparent;
  }

  return this.sprites.bulletPing;
};
