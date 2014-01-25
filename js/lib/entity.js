function Entity (resources, overrides) {
  this.width = 0;
  this.height = 0;
  this.x = 0;
  this.y = 0;
  this.scale = 1;
  this.rotation = 0; // Image
  this.direction = 0; // Movement heading
  this.age = 0;
  this.drawOffset = { x: 0, y: 0 };
  this.speed = 0;
  this.upgrades = [];
  this.moveTarget = { x: 0, y: 0 };
  this.health = 0;
  this.lastHitBy = null;

  this.alignment = 'none';
  this.friendlyPierceChance = 0;
  this.enemyPierceChance = 0;
  this.weapons = [];

  this.components = {};

  if (typeof resources !== 'undefined') {
    this.sprites = resources.sprites;
    this.sounds = resources.sounds;
    this.game = resources.game;
    this.resources = resources;
  }

  this.markedForDeletion = false;
  this.overrides = overrides || {};
  this.applyOverrides();
}

Entity.prototype = {
  tick: function () {},

  tock: function () {
    // if (this.age === 1) this.info.dirty = true;
    if (this.weapon) this.weapon.tock();
    this.age++;
  },

  draw: function (context) {},

  drawHighlight: function (context) {
    if (this.highlighted) {
      context.beginPath();
      context.fillStyle = "rgba(247, 243, 37, 0.5)";
      context.arc(0, 0, Util.hypotenuse(this.width, this.height) * 1.5, 0, 2 * Math.PI);
      context.fill();
    }
  },

  getImage: function () {},

  applyOverrides: function () {
    _.keys(this.overrides).forEach(function (key) {
      this[key] = this.overrides[key];
    }.bind(this));
  },

  collidesWith: function (object, threshold) {
    threshold = threshold || 20;
    return (this.distanceTo(object) < threshold) ? true : false;
  },

  distanceTo: function (object) {
    return Util.hypotenuse(object.x - this.x, object.y - this.y);
  },

  lookAt: function (object) {
    this.rotation = Math.atan2(object.x - this.x, this.y - object.y);
    if (Util.isDefined(this.components.position)) {
      this.components.position.facing = this.rotation;
    }
  },

  executeUpgrades: function () {
    for (var i = 0; i < this.upgrades.length; i++) {
      this.upgrades[i].call(this);
    }
  },

  moveToTarget: function (speed, scaling) {
    this.moveTo(this.moveTarget.x, this.moveTarget.y, speed, scaling);
  },

  moveTo: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = Util.normalize({ x: x - this.x, y: y - this.y });
    this.x += normalized.x * speed * scaling;
    this.y += normalized.y * speed * scaling;
  },

  moveForward: function (speed, scaling) {
    this.moveInDirection(this.direction, speed, scaling);
  },

  moveInDirection: function (direction, speed, scaling) {
    speed   = speed || this.speed;
    scaling = scaling || 1;
    this.y -= Math.cos(direction) * speed * scaling;
    this.x += Math.sin(direction) * speed * scaling;
  },

  getMoveDelta: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = Util.normalize({ x: x - this.x, y: y - this.y });
    return { x: normalized.x * this.speed * scaling, y: normalized.y * this.speed * scaling };
  },

  getPosition: function () {
    return { x: this.x, y: this.y };
  },

  die: function () {
    this.markedForDeletion = true;
  },

  damage: function (damage, by) {
    this.health -= damage;
    this.lastHitBy = by;
  },

  say: function (text, duration) {
    // Use DOM for delicious CSS and !text wrapping!
    this.game.ui.createSpeechBubble(null, this.x, this.y - this.height * 2, text, duration);
  },

  // Hero stuff, TODO: split into 'subclass'
  addXP: function (xp, kills) {
    this.xp += xp;
    this.kills += kills || 0;
  },

  checkLevelUp: function (requiredXp) {
    requiredXp = requiredXp || 100;
    if (this.xp >= 100) {
      this.xp = this.xp - 100;
      this.level += 1;

      if (this.sounds && this.sounds.levelup)
        this.game.audio.play(this.sounds.levelup);
    }
  },

  updateHeroListItem: function () {
    this.uiElem = this.uiElem || this.game.ui.addToHeroList(this);
    this.game.ui.updateHeroListItem(this.uiElem, this);
  },

  addUpgrade: function (entityUpgrade) {
    // Not the full upgrade but a JS object {*effect: function, *icon: image}
    if (Util.isDefined(entityUpgrade.effect)) {
      this.upgrades.push(entityUpgrade.effect);
    }

    if (Util.isDefined(entityUpgrade.icon)) {
      this.game.ui.addHeroUpgradeIcon(this.uiElem, entityUpgrade.icon, entityUpgrade.tooltip);
    }
  },

  addComponent: function (component) {
    if (typeof component.initialize === 'function') component.initialize();
    this.components[component.type] = component;
  },

  getComponent: function (type) {
    return this.components[component.type]
  },

  hasComponents: function () {
    for (var i = 0; i < arguments.length; i++) {
      if (!Util.isDefined(this.components[arguments[i]])) {
        return false;
      }
    }

    return true;
  },

  addEffect: function (effect) {
    if (!Util.isDefined(this.components.effects)) {
      this.components.effects = [];
    }

    this.components.effects.push(effect);
  }
};
