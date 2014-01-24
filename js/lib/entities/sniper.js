function Sniper (resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width  = 42;
  this.height = 42;
  this.speed  = 7 + _.random(8);
  this.shadow.on = true;

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.target    = null;
  this.targetAge = 0;
  this.firing    = false;
  this.moveTarget = { x: this.game.player.x, y: this.game.player.y };

  this.weapon = new MachineGun(this, { fireRate: 70, spread: 4, bulletSpeed: 80, damage: 5, volume: 5 });
  this.weapon.sounds.fire = ['shoot1', 'shoot4', 'shoot3'];

  this.name = _.sample(['Athene', 'Bubo', 'Otus', 'Surnia', 'Asio', 'Nesasio', 'Strix', 'Ninox']);
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new RandomTargetComponent(this.game));
  this.addComponent(new SniperScriptComponent(this));
  this.addComponent(new RenderSpriteComponent(this.sprites.herosniper, this.x, this.y, this.direction || 0, 1, this.width, this.height, 0, 0));

  this.sounds = {
    spawn: 'shartshooper',
    levelup: 'powerup'
  };

  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample([
    'Shartest shooper in all the lands.',
    '100% stopping power.',
    'Grab the penetration upgrade, will ya?',
    'Precision.',
  ]));
  this.updateInfo();
}

Sniper.prototype = new Entity();

Sniper.prototype.constructor = Sniper;

Sniper.prototype.tick = function () {};

Sniper.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.info.text = {
    name: { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp: { value: this.xp, postfix: 'xp' },
  };

  this.checkHeroInfo();
};

// Same reason as Gunner why we have a custom fireAt instead of using the weapon's fireAt:
// so we can upgrade the tracking easily later on
Sniper.prototype.fireAt = function (object) {
  this.weapon.fire(Math.atan2(object.y - this.y, object.x - this.x));
};

Sniper.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 100);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 100);

  if (this.weapon.fireRate - this.weapon.cooldown <= 5) {
    context.drawImage(this.sprites.flash1, -this.width, -this.height * 2);
  } else if (this.weapon.fireRate - this.fireAge <= 15) {
    context.drawImage(this.sprites.flash2, -this.width, -this.height * 2);
  }

  if (this.targetAge >= 50 && Util.isDefined(this.target)) {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, -this.distanceTo(this.target));
    context.strokeStyle = 'red';
    context.strokeWidth = 2;
    context.stroke();
  }
};