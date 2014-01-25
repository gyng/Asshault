function Tavern (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 72;
  this.height = 72;

  this.info.draw = true;
  // this.info.text = "Grand opening!";
  this.info.font = 'italic 16px Arial';
  this.info.lineHeight = 16;
  this.info.offset.y = -32;

  this.sounds = { build: 'build' };
  this.game.audio.play(this.sounds.build, 0.9);

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.85;
  this.enemyPierceChance = 0.3;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new RenderSpriteComponent(this.sprites.tavern, this.x, this.y, 0, 1, this.width, this.height, 0, 0));
  this.addComponent(new RenderShadowComponent(72, 72));

  this.say('Grand opening!');
}

Tavern.prototype = new Entity();

Tavern.prototype.constructor = Tavern;

Tavern.prototype.tick = function () {
  if (this.age % 2400 === 0) {
    this.info.text.flavour = {
      value: _.sample([
        'Barkeep! Another!',
        ["Pay up!", "— You're broke?"],
        "My mead is better than your ale",
        "This one time, at Ram Boar school..."
      ]),
      draw: true
    };
    this.info.dirty = true;
    this.checkHeroInfo();
  }

  if (this.age % 2400 === 1600) {
    this.info.text = [];
  }
};