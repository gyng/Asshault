function PointDefenseDrone (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;

  this.sounds = { build: 'beep' };
  this.game.audio.play(this.sounds.build, 0.9);

  this.alignment = 'friendly';
  this.friendlyPierceChance = 1;
  this.enemyPierceChance = 0;

  this.orbitRadius = 64;
  this.angularVelocity = 2;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new OrbitAroundEntityComponent(this.angularVelocity, this.orbitRadius, this.game.player));
  this.addComponent(new RenderSpriteComponent(this.sprites.flash1, this.x, this.y, this.direction || 0, 1, this.width, this.height, 0, 0));
  this.addComponent(new RenderShadowComponent(4, 4, null, 'circle'));

  this.components.renderShadow.offsetY = 10;

  this.weapon = new MachineGun(this, { bulletLifespan: 5, damage: 0.5, fireRate: 2, recoilMultiplier: 0, volume: 0.1 });
  this.weapon.sounds.fire = 'shoot1';
  this.deferSource = this.game.player;

  this.target = null;
}

PointDefenseDrone.prototype = new Entity();

PointDefenseDrone.prototype.constructor = PointDefenseDrone;

PointDefenseDrone.prototype.tick = function () {
  if (this.age % 2 === 0) {
    if (Util.isDefined(this.game.player.nearestEnemy) &&
        this.game.player.distanceToNearestEnemy < 200 &&
        !this.game.player.nearestEnemy.markedForDeletion)
      this.weapon.fireAt(this.game.player.nearestEnemy);
  }
};