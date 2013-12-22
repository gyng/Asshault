function Sniper(resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width  = 42;
  this.height = 42;
  this.speed  = 7 + _.random(8);
  this.shadow.on = true;

  this.target    = null;
  this.targetAge = 0;
  this.fireAge   = 0;
  this.variance  = 4;
  this.fireRate  = 80;
  this.firing    = false;
  this.moveTarget = { x: this.game.player.x, y: this.game.player.y };

  this.name = _.sample(['Athene', 'Bubo', 'Otus', 'Surnia', 'Asio', 'Nesasio', 'Strix', 'Ninox']);
  this.info.text.push(this.name);
  this.info.draw = true;

  this.sounds = {
    spawn: 'shartshooper',
    fire: ['shoot1', 'shoot4', 'shoot3']
  };

  this.game.audio.play(this.sounds.spawn);
}

Sniper.prototype = new Entity();

Sniper.prototype.constructor = Sniper;

Sniper.prototype.tick = function () {
  this.targetAge++;
  this.fireAge++;

  if (!isDefined(this.target) ||
      this.target.markedForDeletion) {
    this.target = _.sample(this.game.enemies);
    this.targetAge = 0;
  }

  if (isDefined(this.target)) {
    this.every(this.fireRate, function () {
      this.fireAt(this.target);
      this.fireAge = 0;

      // Set new moveTarget position after firing
      this.moveTarget = {
        x: this.game.player.x + randomNegation(_.random(64, 128)),
        y: this.game.player.y + randomNegation(_.random(64, 128))
      };
    });

    // Actually move to moveTarget after firing (0.25-0.5 of cooldown)
    if (this.fireAge > this.fireRate * 0.25 && this.fireAge < this.fireRate * 0.5) {
      this.moveToTarget(this.speed, this.distanceTo(this.moveTarget) / 150);
    }

    this.lookAt(this.target);
  }
};

Sniper.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Sniper.prototype.fire = function (radians, offsetDegrees) {
  offsetDegrees = deg2rad(offsetDegrees) || 0;
  var variance = _.random(this.variance) * offsetDegrees;

  this.game.addEntity(
    new Bullet(this.resources, {
      x: this.x,
      y: this.y,
      direction: radians + variance,
      rotation: radians + variance,
      damage: 5,
      speed: 80
    })
  );

  this.game.audio.play(this.sounds.fire, 1);
  this.fireShake();
};

Sniper.prototype.fireShake = function () {
  var offsetDistance = 50;
  var normalized = normalize({ x: this.x - this.target.x, y: this.y - this.target.y });
  this.drawOffset.x += normalized.x * offsetDistance;
  this.drawOffset.y += normalized.y * offsetDistance;
};

Sniper.prototype.getImage = function () {
  return this.sprites.herosniper;
};

Sniper.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 100);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 100);

  if (this.fireAge <= 5)
    context.drawImage(this.sprites.flash1, -this.width, -this.height * 2);
  else if (this.fireAge <= 15)
    context.drawImage(this.sprites.flash2, -this.width, -this.height * 2);
};