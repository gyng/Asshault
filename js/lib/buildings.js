function Tavern(x, y, resources) {
  Entity.call(this, x, y, resources);
  this.width = 32;
  this.height = 32;
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
};

Tavern.prototype.getImage = function () {
  return this.sprites.tavern;
};