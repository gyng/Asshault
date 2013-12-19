function Gunner(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
  this.speed = 7 + Math.random() * 8;
  this.target = null;
  this.targetAge = 0;
  this.variance = 4;
  this.fireRate = 12;
  // this.targetPos = { x: x, y: y };
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
  }
};

Gunner.prototype.fireAt = function (object) {
  this.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Gunner.prototype.fire = function (radians, directionalOffset) {
  directionalOffset = directionalOffset * Math.PI / 180 || 0;
  var variance = this.variance * Math.random() * (Math.random() > 0.5 ? 1 : -1) * Math.PI / 180 + directionalOffset;
  this.game.entities.push(
    new Bullet(this.x, this.y, this.resources, radians + variance)
  );
};

Gunner.prototype.getImage = function () {
  return this.sprites.herogunner;
};