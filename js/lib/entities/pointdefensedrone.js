function PointDefenseDrone(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;
  this.sprite = this.sprites.flash1;

  this.shadow.on = true;
  this.shadow.size = { x: 4, y: 4 };
  this.shadow.shape = "circle";

  this.sounds = { build: "beep" };
  this.game.audio.play(this.sounds.build, 0.9);

  this.alignment = "friendly";
  this.friendlyPierceChance = 0.9;
  this.enemyPierceChance = 0;

  this.orbitRadius = 64;
  this.angularVelocity = 2;

  this.weapon = new MachineGun(this, {
    bulletLifespan: 5,
    damage: 0.5,
    fireRate: 2,
    recoilMultiplier: 0,
    volume: 0.1,
    bulletSpeedVariance: 5
  });
  this.weapon.sounds.fire = "shoot1";
  this.deferSource = this.game.player;

  this.target = null;
}

PointDefenseDrone.prototype = new Entity();

PointDefenseDrone.prototype.constructor = PointDefenseDrone;

PointDefenseDrone.prototype.tick = function() {
  this.rad += 1;
  var rad = Util.deg2rad(this.rad % 360) * this.angularVelocity;
  this.x = this.game.player.x + -Math.cos(rad) * this.orbitRadius;
  this.y = this.game.player.y + Math.sin(rad) * this.orbitRadius;
  this.rotation = rad;

  if (this.age % 2 === 0) {
    if (
      Util.isDefined(this.game.player.nearestEnemy) &&
      this.game.player.distanceToNearestEnemy < 200 &&
      !this.game.player.nearestEnemy.markedForDeletion
    ) {
      this.weapon.fireAt(this.game.player.nearestEnemy);
    }
  }
};
