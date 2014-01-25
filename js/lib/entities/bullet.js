function Bullet (resources, overrides) {

  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 16;
  this.damage = this.damage || 1;
  this.speed = this.speed || 30;
  this.alignment = this.source ? this.source.alignment : 'none';

  this.addComponent(new PositionComponent(overrides.x, overrides.y, overrides.direction));
  this.addComponent(new ConstantMovementComponent(overrides.speed, overrides.direction));
  this.addComponent(new RenderSpriteComponent(this.sprites.bullet, overrides.x, overrides.y, this.direction, 1, this.width, this.height, 0, 0));

  this.additionalPierceChance = this.additionalPierceChance || 0; // Piercing modifier from upgrades
  this.lifespan = this.lifespan || Number.MAX_VALUE;
}

Bullet.prototype = new Entity();

Bullet.prototype.constructor = Bullet;

Bullet.prototype.tick = function () {
  var list = this.game.spatialHash.query(this.x, this.y);

  for (var i = 0; i < list.length; i++) {
    var ent = list[i];
    if (this.collidesWith(ent, Math.max(16, this.speed * 0.75))) {

      var pierceChance;
      if (this.alignment !== 'none') {
        if ((this.alignment === 'friendly' && ent.alignment === 'enemy') ||
            (this.alignment === 'enemy' && ent.alignment === 'friendly')) {
          ent.damage(this.damage, this);
          pierceChance = ent.enemyPierceChance;
        } else if (this.alignment === ent.alignment) {
          pierceChance = ent.friendlyPierceChance;
        }
      } else {
        pierceChance = 1;
      }

      if (Math.random() - this.additionalPierceChance > pierceChance) {
        this.die();

        this.game.addEntity(
          new BulletPing(this.resources, {
            x: ent.x,
            y: ent.y,
            rotation: ent.rotation
          })
        );
      }
    }
  }

  if (this.age % 10 === 0) {
    this.checkOutOfBounds();
  }

  if (this.age > this.lifespan) {
    this.die();
  }
};

Bullet.prototype.checkOutOfBounds = function () {
  if (this.x < -10 || this.x > this.game.canvas.width + 10 ||
      this.y < -10 || this.y > this.game.canvas.height + 10) {
    this.markedForDeletion = true;
  }
};