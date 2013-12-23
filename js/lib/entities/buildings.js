function Tavern(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 72;
  this.height = 72;

  this.shadow.on = true;
  this.shadow.size = { x: 72, y: 72 };

  this.info.draw = true;
  // this.info.text = "Grand opening!";
  this.info.font = 'italic 16px Arial';
  this.info.lineHeight = 16;
  this.info.offset.y = -32;

  this.sounds = { build: 'build' };
  this.game.audio.play(this.sounds.build, 0.9);

  this.say('Grand opening!');
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
  this.every(2400, function () {
    this.info.text = _.sample([
      'Barkeep! Another!',
      ["Pay up!", "— You're broke?"],
      "My mead is better than your ale",
      "This one time, at Ram Boar school..."
    ]);
    this.info.dirty = true;
  }.bind(this));

  if (this.age % 2400 === 1600)
    this.info.text = [];
};

Tavern.prototype.getImage = function () {
  return this.sprites.tavern;
};