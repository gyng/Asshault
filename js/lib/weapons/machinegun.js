function MachineGun(parent, overrides) {
  Weapon.call(this, parent, overrides);
  this.streams = [{ spread: 5, offset: 0 }];
}

MachineGun.prototype = new Weapon();

MachineGun.prototype.constructor = MachineGun;

MachineGun.prototype.fire = function(radians) {
  if (this.cooldown <= 0) {
    if (!this.hasMagazine || (this.hasMagazine && this.bullets > 0)) {
      for (var i = 0; i < this.streams.length; i++) {
        var stream = this.streams[i];
        var offset = Util.deg2rad(
          Util.randomError(stream.spread * this.spreadMultiplier) +
            Util.randomNegation(stream.offset * this.offsetMultiplier)
        );
        this.game.addEntity(this.bullet(radians, offset));
      }

      this.fireSound();
      this.shake(this.streams.length);

      if (this.hasMagazine) {
        this.bullets--;
      }
      this.cooldown = this.fireRate;
    }
  }
};

MachineGun.prototype.bullet = function(radians, offset) {
  return new Bullet(this.parent.resources, {
    x: this.parent.x,
    y: this.parent.y,
    direction: radians + offset,
    rotation: radians + offset,
    damage: this.damage,
    speed: this.bulletSpeed + _.random(this.bulletSpeedVariance),
    source: this.parent.deferSource || this.parent,
    additionalPierceChance:
      this.pierce + (this.parent.additionalWeaponPierce || 0),
    lifespan: this.bulletLifespan + _.random(this.bulletLifespanVariance),
    sprite: this.bulletSprite,
    animationLength: this.bulletAnimationLength || 10,
    animationLengthVariance: this.bulletAnimationLengthVariance || 0,
    width: this.bulletWidth,
    height: this.bulletHeight,
    drawFade: this.bulletFade
  });
};

MachineGun.prototype.shake = function(strengthMultiplier) {
  var offsetDistance = this.recoilOffset * Math.log(strengthMultiplier + 1) * 2;
  var shakeDistance =
    _.random(this.recoilCameraShake / 2) +
    this.recoilCameraShake * Math.log(strengthMultiplier + 1) * 2;
  var normalized = Util.normalize({
    x: this.parent.x - this.game.ui.mouse.x,
    y: this.parent.y - this.game.ui.mouse.y
  });
  this.game.renderer.shake.x +=
    normalized.x * shakeDistance * this.recoilMultiplier;
  this.game.renderer.shake.y +=
    normalized.y * shakeDistance * this.recoilMultiplier;
  this.parent.drawOffset.x +=
    normalized.x * offsetDistance * this.recoilMultiplier;
  this.parent.drawOffset.y +=
    normalized.y * offsetDistance * this.recoilMultiplier;
};

MachineGun.prototype.fireSound = function() {
  this.game.audio.play(
    this.sounds.fire,
    Util.clamp(this.streams.length * 0.2 * this.volume, 0.2, 1) *
      this.volumeModifier
  );
};

MachineGun.prototype.draw = function(context) {
  var flashPos = { x: -this.parent.width / 2, y: -this.parent.height * 1.5 };

  if (this.cooldown <= this.fireRate / 2) {
    context.drawImage(this.game.sprites.flash1, flashPos.x, flashPos.y);
  }

  if (this.cooldown * 2 <= this.fireRate / 8 * 3) {
    context.drawImage(this.game.sprites.flash2, flashPos.x, flashPos.y);
  }
};
