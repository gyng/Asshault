function Entity(resources, overrides) {
  this.x = 0;
  this.y = 0;
  this.rotation = 0; // Image
  this.direction = 0; // Movement heading
  this.age = 0;
  this.drawOffset = { x: 0, y: 0 };
  this.speed = 0;
  this.upgrades = [];
  this.moveTarget = { x: 0, y: 0 };
  if (typeof resources !== 'undefined') {
    this.sprites = resources.sprites;
    this.sounds = resources.sounds;
    this.game = resources.game;
    this.resources = resources;
  }
  this.overrides = overrides || {};

  this.hasShadow = false;
  this.shadowOffset = { x: 0, y: 0 };
  this.shadowColor = "rgba(0, 0, 0, 0.3)";
  this.shadowSize = { x: 45, y: 45 };
  this.shadowShape = 'square';
}

Entity.prototype = {
  tick: function () {},

  tock: function () {
    this.age++;
  },

  draw: function () {},

  getImage: function () {},

  applyOverrides: function () {
    _.keys(this.overrides).forEach(function (key) {
      this[key] = this.overrides[key];

    }.bind(this));
  },

  collidesWith: function(object, threshold) {
    if (typeof threshold === 'undefined') { threshold = 20; }
    return this.distanceTo(object) < threshold ? true : false;
  },

  distanceTo: function (object) {
    return hypotenuse(object.x - this.x, object.y - this.y);
  },

  lookAt: function (object) {
    this.rotation = Math.atan2(object.x - this.x, this.y - object.y);
  },

  executeUpgrades: function () {
    this.upgrades.forEach(function (upgrade) {
      upgrade.call(this);
    }.bind(this));
  },

  moveToTarget: function (speed, scaling) {
    this.moveTo(this.moveTarget.x, this.moveTarget.y, speed, scaling);
  },

  moveTo: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = normalize({ x: x - this.x, y: y - this.y });
    this.x += normalized.x * speed * scaling;
    this.y += normalized.y * speed * scaling;
  },

  moveForward: function(speed, scaling) {
    this.moveInDirection(this.direction, speed, scaling);
  },

  moveInDirection: function(direction, speed, scaling) {
    speed   = speed || this.speed;
    scaling = scaling || 1;
    this.y -= Math.cos(direction) * speed * scaling;
    this.x += Math.sin(direction) * speed * scaling;
  },

  getMoveDelta: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = normalize({ x: x - this.x, y: y - this.y });
    return { x: normalized.x * this.speed * scaling, y: normalized.y * this.speed * scaling };
  }
};
