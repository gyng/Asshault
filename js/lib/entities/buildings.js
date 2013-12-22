function Tavern(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 72;
  this.height = 72;

  this.shadow.on = true;
  this.shadow.size = { x: 72, y: 72 };

  this.sounds = { build: 'build' };
  this.game.audio.play(this.sounds.build, 0.9);
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
};

Tavern.prototype.getImage = function () {
  return this.sprites.tavern;
};