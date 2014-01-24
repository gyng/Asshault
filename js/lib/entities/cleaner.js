function Cleaner (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 42;
  this.height = 42;
  this.speed = 1 + _.random(1);
  this.variance = 4;
  this.fireRate = 80;
  // this.aoe = 75;
  this.cleanAge = 0;
  this.shadow.on = true;
  this.moveTarget = { x: this.x, y: this.y };
  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.name = _.sample(['Gallus', 'Ocellata', 'Pictus', 'Coqui', 'Lerwa', 'Perdix', 'Rollulus', 'Bonasa']);
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new ConstantMovementComponent(this.speed, 0));
  this.addComponent(new CleanerScriptComponent(this));
  this.addComponent(new RenderSpriteComponent(this.sprites.herocleaner, this.x, this.y, this.direction, 1, this.width, this.height, 0, 0));

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

  this.info.text = {
    name: { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp: { value: this.xp, postfix: 'xp' },
  };

  this.checkHeroInfo();
};

Cleaner.prototype.draw = function (context) {
  if (this.age % 60 < 10) {
    context.drawImage(this.sprites.flash1, -this.width / 2, -this.height / 2);
  }
};