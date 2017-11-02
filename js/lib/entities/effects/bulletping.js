function BulletPing(resources, overrides) {
  Entity.call(this, resources, overrides);

  this.widthVariance =
    typeof this.widthVariance === "number" ? this.widthVariance : 64;
  this.heightVariance =
    typeof this.heightVariance === "number" ? this.heightVariance : 64;
  this.width =
    (this.width || 32) +
    _.random(this.widthVariance) +
    _.random(this.widthVariance);
  this.height =
    (this.height || 32) +
    _.random(this.heightVariance) +
    _.random(this.heightVariance);
  this.lifespanVariance =
    typeof this.lifespanVariance === "number" ? this.lifespanVariance : 32;
  this.lifespan =
    typeof this.lifespan === "number"
      ? this.lifespan + _.random(this.lifespanVariance)
      : 4 + _.random(this.lifespanVariance);
  this.todScale = 0;
  this.rotationVariance =
    typeof this.rotationVariance === "number" ? this.rotationVariance : 50;
  this.rotation += Util.deg2rad(
    Util.randomNegation(_.random(this.rotationVariance))
  );

  this.sprite = this.sprite || this.sprites.aSparks;

  this.lightRadius = Math.max(this.width, this.height) / 2;
  this.lightOffsetY = -this.height / 4;
  this.lightColor = "rgba(243, 229, 98, 0.4)";

  this.sounds = this.sounds || {
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
