function Powerup (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 32;
  this.height = 32;
  this.shadow.on = true;
  this.xpGiven = 0;
  this.goldGiven = 0;
  this.sprite = resources.sprites.debug4;
  this.health = 1000;

  this.alignment = 'none';
  this.friendlyPierceChance = 0; // Alignment is relative
  this.enemyPierceChance = 0; // Pierce chance for bullets from player+heroes
}

Powerup.prototype = new Entity();

Powerup.prototype.constructor = Powerup;

Powerup.prototype.tick = function () {
  // noop, to be replaced
};

Powerup.prototype.pulse = function (age) {
  // Map to [-1, 1]
  this.drawOffset.scaleX = ((age % 10) / 5) - 1;
};

Powerup.prototype.getImage = function () {
  return this.sprite;
};

Powerup.prototype.activate = function () {
  // noop, to be replaced
};
