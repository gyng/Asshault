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
  step: function () {},

  draw: function () {},

  getImage: function () {},

  collidesWith: function(object, threshold) {
    if (typeof threshold === 'undefined') { threshold = 20; }
    return this.distanceTo(object) < threshold ? true : false;
  },

  distanceTo: function (object) {
    return Math.sqrt(Math.pow(object.x - this.x, 2) + Math.pow(object.y - this.y, 2));
  },

  faceObject: function (object) {
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
    var dX = (x - this.x);
    var dY = (y - this.y);
    var hyp = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
    this.x += dX / hyp * speed * scaling;
    this.y += dY / hyp * speed * scaling;
  },

  getMoveDelta: function (x, y, speed, scaling) {
    scaling = scaling || 1;
    speed = speed || this.speed;
    var dX = (x - this.x);
    var dY = (y - this.y);
    var hyp = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
    return { x: dX / hyp * this.speed * scaling, y: dY / hyp * this.speed * scaling };
  }
};
