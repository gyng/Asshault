function BulletPing(resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width = 32 + _.random(64) + _.random(64);
  this.height = 32 + _.random(64) + _.random(64);
  this.lifespan = 10 + _.random(24);
  this.todScale = 0;
  this.rotation += Util.deg2rad(Util.randomNegation(_.random(50)));

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
  var frameDuration = this.lifespan / this.sprites.aSparks.length;
  var frame = Math.floor(this.age / frameDuration);
  var sprite = this.sprites.aSparks[frame];

  return sprite || this.sprites.transparent;
};
