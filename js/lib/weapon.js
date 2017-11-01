function Weapon(parent, overrides) {
  this.parent = parent;

  this.fireRate = 4;
  this.cooldown = 0;
  this.bulletSpeed = 30;
  this.bulletSpeedVariance = 0;
  this.damage = 1;
  this.pierce = 0;
  this.offsetMultiplier = 1;
  this.spreadMultiplier = 1;
  // this.ammo = 10;
  // this.reloadTime = 10;
  this.bulletLifespan = Number.MAX_VALUE;
  this.bulletLifespanVariance = 0;
  this.streamsPerLevel = 1;
  // List of bullet streams. Useful for stuff like triple-machineguns.
  this.streams = [{ spread: 0, offset: 0 }];
  this.hasMagazine = false;
  this.bullets = Number.MAX_VALUE;
  this.bulletMagazineSize = Number.MAX_VALUE;
  this.bulletSizeWobbleVariance = 0;
  this.bulletSizeVariance = 0;
  this.bulletPingSprite = null;
  this.flashSprite = null;
  this.reloadTime = 0;
  this.sounds = {
    fire: ["shoot2", "shoot5", "shoot7"],
    reload: "reload",
    empty: "empty"
  };

  this.recoilMultiplier = 1;
  this.recoilCameraShake = 7;
  this.recoilOffset = 5;
  this.volume = 1;
  this.volumeModifier = 1;

  this.applyOverrides(overrides);
  if (typeof parent !== "undefined") this.game = parent.game;
}

Weapon.prototype = {
  beforeFire: function() {},
  afterFire: function() {},
  fire: function() {
    this.beforeFire();
    this.afterFire();
  },
  fireAt: function(target) {
    this.fire(Math.atan2(this.parent.y - target.y, this.parent.x - target.x));
  },
  tock: function() {
    if (this.cooldown > 0) this.cooldown--;
  },
  draw: function() {},
  bullet: function() {
    this.bullets = this.bulletMagazineSize;
    this.cooldown += this.reloadTime;

    if (this.sounds && this.sounds.reload) {
      this.game.audio.play(this.sounds.reload, 1.0 * this.volumeModifier);
    }
  },
  reload: function() {
    this.cooldown += this.reloadTime;
    this.bullets = this.bulletMagazineSize;
    this.game.audio.play(this.sounds.reload);
  },
  applyOverrides: function(overrides) {
    overrides = overrides || {};
    _.keys(overrides).forEach(
      function(key) {
        this[key] = overrides[key];
      }.bind(this)
    );
  }
};
