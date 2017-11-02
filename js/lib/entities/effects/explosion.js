function Explosion(resources, overrides) {
  Entity.call(this, resources, overrides);

  var scale = 1;
  this.width = 192 + 64 * Math.random() * scale;
  this.height = 192 + 64 * Math.random() * scale;
  this.rotation = Math.random() * 2 * Math.PI;
  this.game.renderer.shake.x += Util.randomNegation(this.width / 6.5);
  this.game.renderer.shake.y += Util.randomNegation(this.height / 6.5);

  this.shadowOpacity = 0.7;
  this.shadow = {
    on: true,
    offset: { x: 0, y: -30 },
    color: "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")",
    size: { x: 120 + _.random(40), y: 120 },
    shape: "circle",
    todScale: 0
  };

  this.lightRadius = this.width;

  this.sounds = {
    spawn: ["explosion", "explosion2", "explosion3", "explosion4", "explosion5"]
  };

  this.applyOverrides();
}

Explosion.prototype = new Entity();

Explosion.prototype.constructor = Explosion;

Explosion.prototype.tick = function() {
  if (this.age < 0) {
    // For delay, set age to a negative value
    this.shadow.color = "rgba(0, 0, 0, 0)";
  } else if (this.age === 0) {
    this.shadowOpacity = 1;
    this.game.audio.play(this.sounds.spawn, 0.8);
  }

  if (this.age >= 0) {
    this.shadow.size.x *= 1.03;
    this.shadowOpacity *= 0.4;
    this.shadow.color =
      "rgba(255, 244, 91," + Math.random() * this.shadowOpacity + ")";

    this.width /= 1 + Math.random() * 0.02;
    this.height /= 1 + Math.random() * 0.02;
    this.lightRadius = this.width;
  }

  if (this.age > 30) {
    this.markedForDeletion = true;
  }
};

Explosion.prototype.getImage = function() {
  var frames = 8;
  var length = 30;
  var frameDuration = length / frames;

  if (this.age <= 0) {
    return this.sprites.transparent;
  }

  var frame = Math.floor(this.age / frameDuration);
  var sprite = this.sprites.aExplosion[frame];
  return sprite || this.sprites.transparent;
};
