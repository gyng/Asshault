function Bullet(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 16;
  this.damage = this.damage || 1;
  this.speed = this.speed || 30;

  // Calculate on creation and not per tick
  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;

  this.shadow = {
    on: false, // True set in tick: sometimes on to 'flicker'
    offset: { x: 0, y: 0 },
    color: "rgba(255, 244, 91," + Math.random() * 0.15 + ")",
    size: { x: 28, y: 48 },
    shape: 'circle',
    todScale: 0
  };
}

Bullet.prototype = new Entity();

Bullet.prototype.constructor = Bullet;

Bullet.prototype.tick = function () {
  this.x += this.deltaX;
  this.y += this.deltaY;

  var randomness = 5 + _.random(10);
  this.shadow.on = (this.age % randomness > 0 && this.age % randomness < 4);

  this.game.enemies.forEach(function (ent) {
    if (this.collidesWith(ent, this.speed * 0.75)) {
      ent.health -= this.damage;
      this.die();

      this.game.addEntity(
        new BulletPing(this.resources, {
          x: ent.x,
          y: ent.y,
          rotation: ent.rotation
        })
      );
    }
  }.bind(this));

  this.every(10, function () {
    this.checkOutOfBounds();
  });
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