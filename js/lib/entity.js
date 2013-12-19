function Entity(x, y, resources) {
  this.x = x;
  this.y = y;
  this.rotation = 0;
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
}

Entity.prototype = {
  tick: function () {},

  tock: function () {
    this.age++;
  },

  draw: function () {},

  getImage: function () {},

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

  getMoveDelta: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var normalized = normalize({ x: x - this.x, y: y - this.y });
    return { x: normalized.x * this.speed * scaling, y: normalized.y * this.speed * scaling };
  }
};
