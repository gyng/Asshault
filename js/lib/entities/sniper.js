function Sniper (resources, overrides) {
  Entity.call(this, resources, overrides);

  this.width  = 42;
  this.height = 42;
  this.sprite = this.sprites.herosniper;
  this.speed  = 7 + _.random(8);
  this.shadow.on = true;

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.target    = null;
  this.targetAge = 0;
  this.firing    = false;
  this.moveTarget = { x: this.game.player.x, y: this.game.player.y };

  this.weapon = new MachineGun(this, { fireRate: 70, spread: 4, bulletSpeed: 60, bulletSpeedVariance: 30, damage: 5, volume: 5 });
  this.weapon.sounds.fire = ['shoot1', 'shoot4', 'shoot3'];

  this.name = _.sample(['Athene', 'Bubo', 'Otus', 'Surnia', 'Asio', 'Nesasio', 'Strix', 'Ninox']);
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;
  this.salary = 5;

  this.sounds = {
    spawn: 'shartshooper',
    levelup: 'powerup'
  };

  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample([
    'Shartest shooper in all the lands.',
    '100% stopping power.',
    'Precision.',
  ]));
  this.updateInfo();
}

Sniper.prototype = new Entity();

Sniper.prototype.constructor = Sniper;

Sniper.prototype.tick = function () {
  this.targetAge++;

  if (!Util.isDefined(this.target) || this.target.markedForDeletion) {
    this.target = _.sample(this.game.enemies);
    // Target switching penalty, but we still want the sniper to get a shot in sometimes
    this.targetAge = this.targetAge * 0.4 + 5;
  }

  if (Util.isDefined(this.target)) {
    if (this.targetAge >= this.weapon.fireRate) {
      this.fireAt(this.target);
      this.targetAge = 0;

      // Set new moveTarget position after firing
      this.moveTarget = {
        x: this.game.player.x + Util.randomNegation(_.random(64, 128)),
        y: this.game.player.y + Util.randomNegation(_.random(64, 128))
      };
    }

    // Actually move to moveTarget after firing (0.25-0.5 of cooldown)
    if (this.weapon.cooldown > this.weapon.fireRate * 0.25 &&
        this.weapon.cooldown < this.weapon.fireRate * 0.5) {
      this.moveToTarget(this.speed, this.distanceTo(this.moveTarget) / 150);
    }

    this.lookAt(this.target);
  }
};

Sniper.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.info.text = {
    name: { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp: { value: this.xp, postfix: 'xp' },
    gold: { value: this.gold, postfix: 'G' }
  };

  this.checkHeroInfo();
};

// Same reason as Gunner why we have a custom fireAt instead of using the weapon's fireAt:
// so we can upgrade the tracking easily later on
Sniper.prototype.fireAt = function (object) {
  this.weapon.fire(Math.atan2(this.y - object.y, this.x - object.x));
};

Sniper.prototype.levelUp = function () {
  if (this.level % 5 === 0 || this.level === 1) {
    this.weapon.streams.push({ offset: _.random(20), spread: 16 });
    this.addUpgrade({ icon: this.game.sprites.debug4, tooltip: 'Levelled up! An extra bullet with every shot.' });
    this.say(_.sample([
      'Quick reload!',
      'They don\'t call me ' + this.weapon.streams.length + '-shot for nothing.'
    ]), 1);
  } else {
    this.say(_.sample([
      'My power grows.',
      'I\'m getting good.'
    ]), 1);
  }
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
