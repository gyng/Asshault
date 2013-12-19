function Gunner(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.speed = 7 + Math.random() * 8;
  this.target = null;
  this.targetAge = 0;
  this.variance = 4;
  this.fireRate = 12;
  this.firing = false;
}

Gunner.prototype = new Entity();

Gunner.prototype.constructor = Gunner;

Gunner.prototype.step = function () {
  this.age += 1;
  this.targetAge += 1;

  if (this.target === null || typeof this.target === 'undefined' || this.target.markedForDeletion || this.target.constructor !== Enemy) {
    this.target = this.game.enemies[~~(Math.random() * this.game.enemies.length)];
    this.targetAge = 0;
  }

  if (this.target !== null && typeof this.target !== 'undefined') {
    if (this.age % this.fireRate === 0) {
      this.fireAt(this.target);
    }

    if (this.targetAge < 10) {
      this.moveTo(this.target.x, this.target.y, this.speed, this.distanceTo(this.target) / 500);
    }

    this.faceObject(this.target);
    this.firing = true;
  } else {
    this.firing = false;
  }
};

Gunner.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Gunner.prototype.fire = function (radians, directionalOffset) {
  directionalOffset = directionalOffset * Math.PI / 180 || 0;
  var variance = this.variance * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180 + directionalOffset;
  this.game.entities.push(
    new Bullet(this.x, this.y, this.resources, radians + variance, 1, 30)
  );
  this.drawOffset.x += Math.random() * 5;
  this.drawOffset.y += Math.random() * 5;
};

Gunner.prototype.getImage = function () {
  return this.sprites.herogunner;
};

// Gunner.prototype.draw = Player.prototype.draw;

Gunner.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 15);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 15);

  if (this.firing && this.age % (this.fireRate / 2) <= 2)
    context.drawImage(this.sprites.flash1, -this.width, -this.height * 2);
  if (this.firing && this.age % 8 <= 3)
    context.drawImage(this.sprites.flash2, -this.width, -this.height * 2);
};