function PowerupCoin(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.shadow.on = true;
  this.sprite = resources.sprites.gold;
  this.health = 40;
  this.baseAmount = 10;
  this.extraAmountMultiplier = 10;
  this.duration = 250 + _.random(100);
  this.width = (38 + this.baseAmount) * (this.extraAmountMultiplier / 10);
  this.height = (38 + this.baseAmount) * (this.extraAmountMultiplier / 10);
}

PowerupCoin.prototype = new Entity();
_.extend(PowerupCoin.prototype, Powerup.prototype);

PowerupCoin.prototype.constructor = PowerupCoin;

PowerupCoin.prototype.tick = function() {
  if (this.collidesWith(this.game.player, this.collisionRadius)) {
    this.activate();
  }

  if (this.health <= 0) {
    this.activate();
  }

  if (this.age > this.duration) {
    this.die();
  }

  this.pulse(this.age);
};

PowerupCoin.prototype.activate = function() {
  if (Math.random() < 0.01) {
    // 1% chance to explode into coins
    this.game.addEntity(new Explosion(this.resources, this.getPosition()));
    this.game.audio.play("coin", 2.0);
    this.game.audio.play("coin2", 2.0);

    for (var i = 0; i < 8; i++) {
      this.game.addPowerup(
        new PowerupCoin(
          this.resources,
          Util.jitterPosition(this.getPosition(), 64)
        )
      );
    }
  } else {
    this.game.addGold(
      this.baseAmount + _.random(0, 1) * this.extraAmountMultiplier
    );
    this.game.audio.play("coin2");
  }

  this.die();
};
