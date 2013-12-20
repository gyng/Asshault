function Bullet(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 16;
  this.damage = 1;
  this.speed = 30;

  // Apply overrides
  this.applyOverrides();

  // Calculate on creation and not per tick
  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;
  this.x += this.deltaX;
  this.y += this.deltaY;

  // this.hasShadow = true;
  this.shadowOffset = { x: 0, y: 0 };
  this.shadowColor = "rgba(255, 244, 91," + Math.random() * 0.14 + ")";
  this.shadowSize = { x: 28, y: 48 };
  this.shadowShape = 'circle';
}

Bullet.prototype = new Entity();

Bullet.prototype.constructor = Bullet;

Bullet.prototype.tick = function () {
  this.x += this.deltaX;
  this.y += this.deltaY;

  var randomness = 5 + _.random(10);
  this.hasShadow = (this.age % randomness > 0 && this.age % randomness < 4);

  this.game.enemies.forEach(function (ent) {
    if (this.collidesWith(ent, this.speed * 0.75)) {
      ent.health -= this.damage;
      this.markedForDeletion = true;
      this.game.entities.push(
        new BulletPing(this.resources, {
          x: ent.x,
          y: ent.y,
          rotation: ent.rotation
        })
      );
    }
  }.bind(this));

  if (this.age % 10 === 0) {
    this.checkOutOfBounds();
  }
};

Bullet.prototype.checkOutOfBounds = function () {
  if (this.x < -10 || this.x > this.game.canvas.width + 10 ||
      this.y < -10 || this.y > this.game.canvas.height + 10) {
    this.markedForDeletion = true;
  }
};

Bullet.prototype.getImage = function () {
  return this.sprites.bullet;
};