function Bullet(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = this.width || 32;
  this.height = this.height || 16;
  this.sprite = this.sprite || this.sprites.bullet;
  this.damage = this.damage || 1;
  this.speed = this.speed || 30;
  this.alignment = this.source ? this.source.alignment : "none";

  // Calculate on creation and not per tick
  this.deltaX = -Math.cos(this.direction) * this.speed;
  this.deltaY = -Math.sin(this.direction) * this.speed;

  this.shadow = {
    on: false, // True set in tick: sometimes on to 'flicker'
    offset: { x: 0, y: 0 },
    color: "rgba(255, 244, 91," + Math.random() * 0.15 + ")",
    size: { x: 28, y: 48 },
    shape: "circle",
    todScale: 0
  };

  this.additionalPierceChance = this.additionalPierceChance || 0; // Piercing modifier from upgrades
  this.lifespan = this.lifespan || Number.MAX_VALUE;

  this.animationLength = this.animationLength || 10;
  this.animationLengthVariance = this.animationLengthVariance || 0;
}

Bullet.prototype = new Entity();

Bullet.prototype.constructor = Bullet;

Bullet.prototype.tick = function() {
  this.x += this.deltaX;
  this.y += this.deltaY;

  var list = this.game.spatialHash.query(this.x, this.y);

  for (var i = 0; i < list.length; i++) {
    var ent = list[i];
    if (
      this.collidesWith(ent, Math.max(this.collisionRadius, this.speed * 0.75))
    ) {
      var pierceChance = 1;

      if (this.alignment !== "none") {
        if (
          (this.alignment === "friendly" && ent.alignment === "enemy") ||
          (this.alignment === "enemy" && ent.alignment === "friendly")
        ) {
          pierceChance = ent.enemyPierceChance;
          ent.damage(this.damage, this);

          if (typeof this.onhit === "function") {
            this.onhit();
          }
        } else if (this.alignment === ent.alignment) {
          pierceChance = ent.friendlyPierceChance;
          if (
            Math.random() > ent.friendlyPierceChance &&
            typeof this.onhit === "function"
          ) {
            this.onhit();
          }
        }
      }

      if (Math.random() - this.additionalPierceChance > pierceChance) {
        this.die();

        this.game.addEntity(
          new BulletPing(this.resources, {
            x: ent.x,
            y: ent.y,
            rotation: ent.rotation,
            sprite: this.sprites.aSparks
          })
        );
      } else if (ent.alignment === "enemy") {
        this.game.audio.play("pierce", 1.0);
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

Bullet.prototype.getImage = function() {
  if (this.sprite.length) {
    var frameDuration = Math.floor(
      (this.animationLength + Util.randomError(this.animationLengthVariance)) /
        this.sprite.length
    );
    var frame = Math.floor(this.age / frameDuration % this.sprite.length);
    return this.sprite[frame] || this.sprites.transparent;
  }

  return this.sprite;
};

Bullet.prototype.checkOutOfBounds = function() {
  if (
    this.x < -100 ||
    this.x > this.game.canvas.width + 100 ||
    this.y < -100 ||
    this.y > this.game.canvas.height + 100
  ) {
    this.markedForDeletion = true;
  }
};
