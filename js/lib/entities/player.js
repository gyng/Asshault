function Player (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 48;
  this.height = 48;
  this.health = 10;
  this.spread = 5;
  this.firingRate = 4;
  this.bulletDamage = 1;
  this.speed = 0;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;
  this.additionalBulletPierceChance = 0;
  this.nearestEnemy = null;

  this.shadow.on = true;

  this.name = 'You!';
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.sounds = {
    fire: ['shoot2', 'shoot5', 'shoot7'],
    levelup: 'powerup',
    beam: ['zap']
  };

  $('#canvas').mousedown(function (e) {
    this.firing = true;
  }.bind(this));

  $(document).mouseup(function (e) {
    this.firing = false;
  }.bind(this));

  this.uiElem = null;
  this.updateInfo();
}

Player.prototype = new Entity();

Player.prototype.constructor = Player;

Player.prototype.tick = function () {
  if (this.firing) {
    this.fireAt = Math.atan2(this.y - this.game.ui.mouse.y, this.x - this.game.ui.mouse.x);
    this.fire(this.fireAt);
  }

  if (this.firing && this.age % this.firingRate === 0) {
    this.fireSound();
  }

  this.lookAt({ x: this.game.ui.mouse.x, y: this.game.ui.mouse.y });
  this.returnToMap();

  if (this.age % 30 === 0) {
    this.nearestEnemy = Util.nearestPoint(this.game.enemies, { x: this.x, y: this.y });

    if (!Util.isDefined(this.nearestEnemy) ||
        this.nearestEnemy.markedForDeletion) {
      this.nearestEnemy = null;
      this.distanceToNearestEnemy = null;
    } else {
      this.distanceToNearestEnemy = this.distanceTo(this.nearestEnemy);
    }
  }
};

Player.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.info.text = {
    name:  { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp:    { value: this.xp, postfix: 'xp' },
  };

  this.checkHeroInfo();
};

Player.prototype.returnToMap = function () {
  var returnScale = 0.05;
  var margin = 50;

  if (this.x > this.game.canvas.width - margin) {
      this.x -= returnScale * (this.x - (this.game.canvas.width - margin));
  } else if (this.x < margin) {
    this.x += returnScale * (margin - this.x);
  }

  if (this.y > this.game.canvas.height - margin) {
    this.y -= returnScale * (this.y - (this.game.canvas.height - margin));
  } else if (this.y < margin) {
    this.y += returnScale * (margin - this.y);
  }
};

Player.prototype.getImage = function () {
  return this.sprites.debug;
};

Player.prototype.fire = function (radians, offsetDegrees) {
  var offset = Util.deg2rad(Util.randomError(this.spread) + Util.randomNegation(offsetDegrees || 0));

  if (this.age % this.firingRate === 0) {
    this.game.addEntity(
      new Bullet(this.resources, {
        x: this.x,
        y: this.y,
        direction: radians + offset,
        rotation: radians + offset,
        damage: this.bulletDamage,
        speed: 30,
        source: this,
        additionalPierceChance: this.additionalBulletPierceChance
      })
    );

    this.fireShake();
  }
};

Player.prototype.fireSound = function () {
  for (var i = 0; i < Math.min(this.upgrades.length+1, 10); i++)
    this.game.audio.play(this.sounds.fire, 0.2, { sourceStart: Math.random() * 0.5 });
};

Player.prototype.fireShake = function () {
  var offsetDistance = 5;
  var shakeDistance = 7;
  var normalized = Util.normalize({ x: this.x - this.game.ui.mouse.x, y: this.y - this.game.ui.mouse.y });
  this.game.renderer.shake.x += normalized.x * shakeDistance;
  this.game.renderer.shake.y += normalized.y * shakeDistance;
  this.drawOffset.x += normalized.x * offsetDistance;
  this.drawOffset.y += normalized.y * offsetDistance;
};

Player.prototype.draw = function (context) {
  this.drawOffset.x = Util.clamp(this.drawOffset.x * 0.9, 0, 72);
  this.drawOffset.y = Util.clamp(this.drawOffset.y * 0.9, 0, 72);

  if (this.firing) {
    var flashPos = { x: -this.width / 2, y: -this.height * 1.5 };

    if (this.age % this.firingRate <= this.firingRate / 2){
      context.drawImage(this.sprites.flash1, flashPos.x, flashPos.y);
    }

    if (this.age % this.firingRate * 2 <= this.firingRate / 8 * 3) {
      context.drawImage(this.sprites.flash2, flashPos.x, flashPos.y);
    }
  }
};