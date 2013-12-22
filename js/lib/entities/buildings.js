function Tavern(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 72;
  this.height = 72;

  this.applyOverrides();

  this.hasShadow = true;
  this.shadowSize = { x: 72, y: 72 };

  this.game.audio.play('build');
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
};

Tavern.prototype.getImage = function () {
  return this.sprites.tavern;
};