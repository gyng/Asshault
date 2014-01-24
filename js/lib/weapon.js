function Weapon (parent, overrides) {
  this.parent = parent;

  this.fireRate         = 4;
  this.cooldown         = 0;
  this.bulletSpeed      = 30;
  this.damage           = 1;
  this.pierce           = 0;
  this.spreadMultiplier = 1;
  // this.ammo = 10;
  // this.reloadTime = 10;
  this.bulletLifespan = Number.MAX_VALUE;
  // List of bullet streams. Useful for stuff like triple-machineguns.
  this.streams = [{ spread: 0, offset: 0 }];
  this.sounds = { fire: ['shoot2', 'shoot5', 'shoot7'] };

  this.recoilMultiplier = 1;
  this.recoilCameraShake = 7;
  this.recoilOffset = 5;
  this.volume = 1;

  this.applyOverrides(overrides);
  if (typeof parent !== 'undefined') this.game = parent.game;
}

Weapon.prototype = {
  fire: function () {},
  fireAt: function (target) {
    this.fire(Math.atan2(target.y - this.parent.y, target.x - this.parent.x));
  },
  tock: function () {
    if (this.cooldown > 0) this.cooldown--;
  },
  draw: function () {},
  bullet: function () {},

  applyOverrides: function (overrides) {
    overrides = overrides || {};
    _.keys(overrides).forEach(function (key) {
      this[key] = overrides[key];
    }.bind(this));
  }
};