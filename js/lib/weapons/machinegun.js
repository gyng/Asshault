function MachineGun(parent, overrides) {
  Weapon.call(this, parent, overrides);
  this.streams = [{ spread: 5, offset: 0 }];
  this.bulletScale = this.bulletScale || 1;
  this.bulletPingSprite = this.bulletPingSprite || this.game.sprites.aSparks;
  this.flashSprite = this.flashSprite || this.game.sprites.aFlash0;
  this.flashVariance =
    typeof this.flashVariance === "undefined" ? 0 : this.flashVariance;
  this.flashFade =
    typeof this.flashFade === "undefined" ? false : this.flashFade;
  this.flashOpacity =
    typeof this.flashOpacity === "undefined" ? 1 : this.flashOpacity;
  this.flashWidth =
    typeof this.flashWidth === "undefined" ? 96 : this.flashWidth;
  this.flashHeight =
    typeof this.flashHeight === "undefined" ? 96 : this.flashHeight;
  this.sprite = this.sprite || this.game.sprites.gun;
}

MachineGun.prototype = new Weapon();

MachineGun.prototype.constructor = MachineGun;

MachineGun.prototype.fire = function(radians) {
  this.beforeFire();

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

      if (this.flashSprite) {
        var flashOffset = 70;
        var flashPos = Util.aheadPosition(
          this.parent.x,
          this.parent.y,
          this.parent.rotation,
          flashOffset
        );

        this.game.addEntity(
          new BulletPing(this.parent.resources, {
            x: flashPos.x,
            y: flashPos.y,
            sounds: {},
            rotation: this.parent.rotation,
            rotationVariance: 0,
            heightVariance: 64,
            widthVariance: 48,
            height: this.flashHeight,
            width: this.flashWidth,
            drawFade: this.flashFade,
            lifespanVariance: this.flashVariance,
            scale: this.flashScale || 1,
            sprite: this.flashSprite,
            opacity: this.flashOpacity
          })
        );
      }

      if (this.hasMagazine) {
        this.bullets--;
      }
      this.cooldown = this.fireRate;
    }
  }

  this.afterFire();
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
    scale: this.bulletScale,
    drawFade: this.bulletFade,
    bulletPingSprite: this.bulletPingSprite,
    bulletPingSounds: this.bulletPingSounds,
    flashSprite: this.flashSprite,
    sizeWobbleVariance: this.bulletSizeWobbleVariance
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
  if (this.sprite) {
    context.drawImage(
      this.sprite,
      this.parent.width / 2 - 1.5 * this.sprite.width,
      -this.parent.height / 2 -
        0.5 * this.sprite.height +
        Util.clamp(
          (this.parent.drawOffset.y || 0) * 10,
          0,
          this.sprite.height * 2
        )
    );
  }
};
