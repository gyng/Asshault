function MachineGun (parent, overrides) {
  Weapon.call(this, parent, overrides);
  this.streams = [{ spread: 5, offset: 0 }];
}

MachineGun.prototype = new Weapon();

MachineGun.prototype.constructor = MachineGun;

MachineGun.prototype.fire = function (radians) {
  if (this.cooldown <= 0) {
    for (var i = 0; i < this.streams.length; i++) {
      var stream = this.streams[i];
      var offset = Util.deg2rad(Util.randomError(stream.spread * this.spreadMultiplier) + Util.randomNegation(stream.offset));
      this.game.addEntity(this.bullet(radians, offset));
    }

    this.fireSound();
    if (this.recoil) this.shake(this.streams.length);
    this.cooldown = this.fireRate;
  }
};

MachineGun.prototype.bullet = function (radians, offset) {
  return new Bullet(this.parent.resources, {
    x: this.parent.x,
    y: this.parent.y,
    direction: radians + offset,
    rotation: radians + offset,
    damage: this.damage,
    speed: this.bulletSpeed,
    source: (this.parent.deferSource || this.parent),
    additionalPierceChance: this.pierce + (this.parent.additionalWeaponPierce || 0),
    lifespan: this.bulletLifespan
  });
};

MachineGun.prototype.shake = function (multiplier) {
  var offsetDistance = this.recoilOffset * multiplier;
  var shakeDistance = this.recoilCameraShake * multiplier;
  var normalized = Util.normalize({
    x: this.parent.x - this.game.ui.mouse.x,
    y: this.parent.y - this.game.ui.mouse.y
  });
  this.game.renderer.shake.x += normalized.x * shakeDistance;
  this.game.renderer.shake.y += normalized.y * shakeDistance;
  this.parent.drawOffset.x += normalized.x * offsetDistance;
  this.parent.drawOffset.y += normalized.y * offsetDistance;
};

MachineGun.prototype.fireSound = function () {
  this.game.audio.play(this.sounds.fire, Util.clamp(this.streams.length * 0.2 * this.volume, 0.2, 1));
};

MachineGun.prototype.draw = function (context) {
  var flashPos = { x: -this.parent.width / 2, y: -this.parent.height * 1.5 };

  if (this.cooldown <= this.fireRate / 2) {
    context.drawImage(this.game.sprites.flash1, flashPos.x, flashPos.y);
  }

  if (this.cooldown * 2 <= this.fireRate / 8 * 3) {
    context.drawImage(this.game.sprites.flash2, flashPos.x, flashPos.y);
  }
};