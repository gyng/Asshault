function Cleaner(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 42;
  this.height = 42;
  this.speed = 2 + _.random(2);

  this.variance = 4;
  this.fireRate = 80;
  this.aoe = 75;

  this.applyOverrides();

  this.moveTarget = { x: 500, y: 500 };

  this.hasShadow = true;

  this.cleanAge = 0;

  this.sounds = {
    spawn: 'waw',
    target: 'beep'
  };
  this.game.audio.play(this.sounds.spawn);
}

Cleaner.prototype = new Entity();

Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.tick = function () {
  this.cleanAge++;

  if (this.distanceTo(this.moveTarget) < 20) {
    this.game.audio.play(this.sounds.target, 0.7);
    this.moveTarget = { x: _.random(this.game.canvas.width), y: _.random(this.game.canvas.height) };
  }

  this.every(60, function () {
    var prevOp = this.game.persistentContext.globalCompositeOperation;
    this.game.persistentContext.globalCompositeOperation = 'destination-out';
    this.game.persistentContext.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.game.persistentContext.beginPath();
    this.game.persistentContext.arc(this.x, this.y, this.aoe, 0, 2 * Math.PI);
    this.game.persistentContext.fill();

    this.game.persistentContext.globalCompositeOperation = prevOp;
    this.cleanAge = 0;
  }.bind(this));

  this.moveToTarget();
  this.lookAt(this.moveTarget);
};

Cleaner.prototype.getImage = function () {
  return this.sprites.herocleaner;
};

Cleaner.prototype.draw = function (context) {
  if (this.cleanAge < 10) {
    context.drawImage(this.sprites.flash1, 0, 0);
  }
};