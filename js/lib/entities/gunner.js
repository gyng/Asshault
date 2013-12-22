function Gunner(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 42;
  this.height = 42;
  this.speed = 7 + _.random(8);
  this.target = null;
  this.targetAge = 0;
  this.spread = 5;
  this.fireRate = 12;
  this.firing = false;

  this.applyOverrides();

  this.hasShadow = true;

  this.sounds = {
    spawn: 'start',
    fire: ['shoot2', 'shoot5', 'shoot7']
  };

  this.game.audio.play(this.sounds.spawn);
}

Gunner.prototype = new Entity();

Gunner.prototype.constructor = Gunner;

Gunner.prototype.tick = function () {
  this.targetAge++;

  if (!isDefined(this.target) || this.target.markedForDeletion || this.target.constructor !== Enemy) {
    this.target = _.sample(this.game.enemies);
    this.targetAge = 0;
  }

  if (isDefined(this.target)) {
    if (this.age % this.fireRate === 0) {
      this.fireAt(this.target);
    }

    if (this.targetAge < 10) {
      this.moveTo(this.target.x, this.target.y, this.speed, this.distanceTo(this.target) / 500);
    }

    this.lookAt(this.target);
    this.firing = true;
  } else {
    this.firing = false;
  }
};

Gunner.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Gunner.prototype.fire = function (radians, offsetDegrees) {
  offsetDegrees = offsetDegrees || 0;
  var offset = deg2rad(randomError(this.spread) + offsetDegrees);
  this.game.audio.play(_.sample(this.sounds.fire), 0.2);
  this.game.entities.push(
    new Bullet(this.resources, {
      x: this.x,
      y: this.y,
      direction: radians + offset,
      rotation: radians + offset,
      damage: 1,
      speed: 30
    })
  );

  this.drawOffset.x += _.random(5);
  this.drawOffset.y += _.random(5);
};

Gunner.prototype.getImage = function () {
  return this.sprites.herogunner;
};

Gunner.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 15);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 15);

  if (this.firing) {
    if (this.age % (this.fireRate / 2) <= 2)
      context.drawImage(this.sprites.flash1, -this.width, -this.height * 2);
    if (this.age % (this.fireRate) <= 3)
      context.drawImage(this.sprites.flash2, -this.width, -this.height * 2);
  }
};