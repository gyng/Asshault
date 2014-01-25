function Cleaner (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 42;
  this.height = 42;
  this.speed = 1 + _.random(1);
  this.variance = 4;

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.name = _.sample(['Gallus', 'Ocellata', 'Pictus', 'Coqui', 'Lerwa', 'Perdix', 'Rollulus', 'Bonasa']);

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new ConstantMovementComponent(this.speed, 0));
  this.addComponent(new CleanerScriptComponent(this));
  this.addComponent(new RenderSpriteComponent(this.sprites.herocleaner, this.x, this.y, this.direction, 1, this.width, this.height, 0, 0));
  this.addComponent(new RenderShadowComponent(42, 42));
  this.addComponent(new RenderInfoComponent({ addToHeroList: true }));

  this.addEffect(new SpriteBlinkEffectComponent(this.components.position, this.sprites.flash1, 32, 32, 120, 20));

  this.sounds = {
    spawn: 'waw',
    target: 'beep',
    levelup: 'powerup'
  };
  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample([
    'Yuck!',
    'Stop killing!',
    'Things die when they are killed!',
    'Disgusting.',
  ]));
  this.updateInfo();
}

Cleaner.prototype = new Entity();

Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.components.renderInfo.info.text = {
    name: { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp: { value: this.xp, postfix: 'xp' },
  };

  this.components.renderInfo.checkInfo();
};

Cleaner.prototype.draw = function (context) {};