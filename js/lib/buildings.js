function Tavern(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 32;
  this.height = 32;

  this.applyOverrides();
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
};

Tavern.prototype.getImage = function () {
  return this.sprites.tavern;
};