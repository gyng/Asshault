function Gunner (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 42;
  this.height = 42;
  this.sprite = this.sprites.herogunner;
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

Gunner.prototype.tick = function () {
  this.targetAge++;

  if (Util.isDefined(this.target) && !this.target.markedForDeletion) {
    this.fireAt(this.target);

    this.drawOffset.scaleX += (1 - this.drawOffset.scaleX) * 0.1;
    this.drawOffset.scaleY += (1 - this.drawOffset.scaleY) * 0.1;

    if (this.targetAge < 10) {
      this.moveTo(this.target.x, this.target.y, this.speed, this.distanceTo(this.target) / 500);
      if (this.age % 5 === 0) {
        this.drawOffset.y += 7 + _.random(3);
        this.drawOffset.scaleX = 1.6;
        this.drawOffset.scaleY = 1.1;
        this.game.audio.play('walk' + (_.random(2) + 1), 0.5);
      }

      if (this.targetAge === 1) {
        this.game.audio.play('yell' + (_.random(3) + 1), 0.3 + Math.random() * 0.5);
      }
    }

    this.lookAt(this.target);
    this.firing = true;
  } else {
    this.target = _.sample(this.game.enemies);
    this.targetAge = 0;
    this.firing = false;
  }
};

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
  this.weapon.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Gunner.prototype.levelUp = function () {
  if (this.level % 5 === 0 || this.level === 1) {
    this.weapon.streams.push({ offset: _.random(20), spread: 10 });
    this.addUpgrade({ icon: this.game.sprites.debug4, tooltip: 'Levelled up! More bullets.' });
    this.say(_.sample([
      'MORE BULLETS!',
      'CAN\'T STOP ME NOW!'
    ]), 1);
  } else {
    this.say(_.sample([
      this.name.toUpperCase() + ' GROWS STRONGER!',
      'JUST YOU WAIT!'
    ]), 1);
  }
};

Gunner.prototype.draw = function (context) {
  this.drawOffset.x = Math.min(this.drawOffset.x * 0.9, 100);
  this.drawOffset.y = Math.min(this.drawOffset.y * 0.9, 100);

  if (this.firing) {
    this.weapon.draw(context);
  }
};
