function BulletRicochet(resources, overrides) {
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
    on: true, // True set in tick: sometimes on to 'flicker'
    offset: { x: 0, y: 0 },
    color: "rgba(255, 190, 91," + Math.random() * 0.15 + ")",
    size: { x: 28, y: 48 },
    shape: "circle",
    todScale: 0
  };

  this.additionalPierceChance = this.additionalPierceChance || 0; // Piercing modifier from upgrades
  this.lifespan = this.lifespan || Number.MAX_VALUE;
  this.numRicochets = 3;
}

BulletRicochet.prototype = new Entity();
_.extend(BulletRicochet.prototype, Bullet.prototype);

BulletRicochet.prototype.constructor = BulletRicochet;

BulletRicochet.prototype.onhit = function() {
  if (this.damage > 1) {
    for (var i = 0; i < this.numRicochets; i++) {
      var rad = Util.randomFloat(Util.twoPi);

      var bullet = new BulletRicochet(this.resources, {
        x: this.x + Util.randomError(30),
        y: this.y + Util.randomError(30),
        width: this.width / 1.2,
        height: this.height / 1.2,
        rotation: rad,
        direction: rad,
        lifespan: 25 + Util.randomError(10),
        speed: Math.max(this.speed / 2 + Util.randomError(5), 1),
        alignment: "friendly",
        damage: this.damage / 4,
        source: this.game.player,
        sprite: this.game.sprites.bullet,
        drawFade: true
      });

      this.game.addEntity(bullet);
    }
  }
};
