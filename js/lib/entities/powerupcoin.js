function PowerupCoin (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 48;
  this.height = 48;
  this.shadow.on = true;
  this.sprite = resources.sprites.gold;
  this.health = 40;
}

PowerupCoin.prototype = new Entity();
_.extend(PowerupCoin.prototype, Powerup.prototype);

PowerupCoin.prototype.constructor = PowerupCoin;

PowerupCoin.prototype.tick = function () {
  if (this.collidesWith(this.game.player)) {
    this.activate();
  }

  if (this.health <= 0) {
    this.activate();
  }

  if (this.age > 300) {
    this.die();
  }

  this.pulse(this.age);
};

PowerupCoin.prototype.getImage = function () {
  return this.sprite;
};

PowerupCoin.prototype.activate = function () {
  if (Math.random() < 0.01) {
    // 1% chance to explode into coins
    this.game.addEntity(new Explosion(this.resources, this.getPosition()));
    this.game.audio.play('coin', 2.0);
    this.game.audio.play('coin2', 2.0);

    for (var i = 0; i < 8; i++) {
      this.game.addPowerup(new PowerupCoin(
        this.resources,
        Util.jitterPosition(this.getPosition(), 64))
      );
    }
  } else {
    this.game.addGold(10 + _.random(0, 1) * 10);
    this.game.audio.play('coin2');
  }

  this.die();
};
