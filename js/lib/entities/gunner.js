function Gunner (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 42;
  this.height = 42;
  this.speed  = 7 + _.random(8);

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.target    = null;
  this.targetAge = 0;
  this.weapon = new MachineGun(this, { fireRate: 12, spread: 5, recoilMultiplier: 0, bulletSpeed: 15 });

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new GunnerScriptComponent(this));
  this.addComponent(new RandomTargetComponent(this.game));
  this.addComponent(new RenderSpriteComponent(this.sprites.herogunner, this.x, this.y, this.direction || 0, 1, this.width, this.height, 0, 0));

  this.shadow.on = true;
  this.name = _.sample(['Grunniens', 'Capra', 'Sus', 'Suidae', 'Bora', 'Scrofa', 'Hircus', 'Bos']);
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.sounds = {
    spawn: 'start',
    levelup: 'powerup'
  };

  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample(['Time for some hunting!', 'Everybody dies!', 'Do you want to live forever!?']));
  this.updateInfo();
}

Gunner.prototype = new Entity();

Gunner.prototype.constructor = Gunner;

Gunner.prototype.tick = function () {};

Gunner.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.info.text = {
    name:  { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp:    { value: this.xp, postfix: 'xp' },
  };

  this.checkHeroInfo();
};

// Custom fireAt instead of weapon's fireat so we can upgrade target tracking
// only for gunners and not other entities which use the same weapon
Gunner.prototype.fireAt = function (object) {
  this.weapon.fire(Math.atan2(object.y - this.y, object.x - this.x));
};

Gunner.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 100);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 100);

  if (this.firing) {
    this.weapon.draw(context);
  }
};