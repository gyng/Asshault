function Player (resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width  = 48;
  this.height = 48;
  this.health = 10;
  this.speed = 0;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.alignment = 'friendly';
  this.friendlyPierceChance = 1;
  this.enemyPierceChance = 0;
  this.nearestEnemy = null;

  this.weapon = new MachineGun(this);
  this.additionalWeaponPierce = 0;

  this.addComponent(new PositionComponent(this.x, this.y));
  this.addComponent(new RenderShadowComponent(45, 45, 'rgba(0, 0, 0, 0.3)', 'square', 1, true));
  this.addComponent(new RenderSpriteComponent(this.sprites.debug, this.x, this.y, this.direction || 0, 1, this.width, this.height, 0, 0));
  this.addComponent(new RenderInfoComponent({ addToHeroList: true }));

  this.name = 'You!';
  // this.info.draw = true;
  // this.info.addToHeroList = true;

  this.sounds = {
    levelup: 'powerup'
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
    var fireDirection = Math.atan2(this.game.ui.mouse.y - this.y, this.game.ui.mouse.x - this.x);
    this.weapon.fire(fireDirection);
  }

  this.lookAt({ x: this.game.ui.mouse.x, y: this.game.ui.mouse.y });
  this.returnToMap();

  // Update nearest enemy for point-defence drones so we don't have to do the expensive op in each drone
  if (this.age % 30 === 0) {
    this.nearestEnemy = Util.nearestPoint(this.game.enemies, { x: this.x, y: this.y });

    if (!Util.isDefined(this.nearestEnemy) || this.nearestEnemy.markedForDeletion) {
      this.nearestEnemy = null;
      this.distanceToNearestEnemy = null;
    } else {
      this.distanceToNearestEnemy = this.distanceTo(this.nearestEnemy);
    }
  }

  this.components.renderSprite.offsetX = Util.clamp(this.components.renderSprite.offsetX * 0.9, 0, 72);
  this.components.renderSprite.offsetY = Util.clamp(this.components.renderSprite.offsetY * 0.9, 0, 72);
};

Player.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.components.renderInfo.info.text = {
    name:  { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp:    { value: this.xp, postfix: 'xp' },
  };

  this.components.renderInfo.checkInfo();
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

Player.prototype.draw = function (context) {
  if (this.firing) {
    this.weapon.draw(context);
  }
};