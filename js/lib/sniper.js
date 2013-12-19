function Sniper(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.speed = 7 + Math.random() * 8;
  this.target = null;
  this.targetAge = 0;
  this.fireAge = 0;
  this.variance = 4;
  this.fireRate = 80;
  this.firing = false;
}

Sniper.prototype = new Entity();

Sniper.prototype.constructor = Sniper;

Sniper.prototype.step = function () {
  this.age += 1;
  this.targetAge += 1;
  this.fireAge += 1;

  if (this.target === null || typeof this.target === 'undefined' || this.target.markedForDeletion || this.target.constructor !== Enemy) {
    this.target = this.game.enemies[~~(Math.random() * this.game.enemies.length)];
    this.targetAge = 0;
  }

  if (this.target !== null && typeof this.target !== 'undefined') {
    if (this.age % this.fireRate === 0) {
      this.fireAt(this.target);
      this.fireAge = 0;
    }

    if (this.targetAge === 0) {
      this.moveTarget = {
        x: this.game.player.x + (Math.random() > 0.5 ? -1 : 1) * (64 + Math.random() * 120),
        y: this.game.player.y + (Math.random() > 0.5 ? -1 : 1) * (64 + Math.random() * 120)
      };
    }

    if (this.targetAge < 10) {
      this.moveToTarget(this.speed, this.distanceTo(this.moveTarget) / 150);
    }

    this.faceObject(this.target);

  }
};

Sniper.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Sniper.prototype.fire = function (radians, directionalOffset) {
  directionalOffset = directionalOffset * Math.PI / 180 || 0;
  var variance = this.variance * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180 + directionalOffset;
  this.game.entities.push(
    new Bullet(this.x, this.y, this.resources, radians + variance, 5, 80)
  );
  this.drawOffset.x += Math.random() * 25;
  this.drawOffset.y += Math.random() * 25;
};

Sniper.prototype.getImage = function () {
  return this.sprites.herosniper;
};

// Sniper.prototype.draw = Player.prototype.draw;

Sniper.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 50);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 50);

  if (this.fireAge <= 5)
    context.drawImage(this.sprites.flash1, -this.width, -this.height * 2);
  else if (this.fireAge <= 15)
    context.drawImage(this.sprites.flash2, -this.width, -this.height * 2);
};