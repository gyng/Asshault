function Cleaner(resources, overrides) {
  Entity.call(this, resources, overrides);
  this.width = 42;
  this.height = 42;
  this.speed = 1 + _.random(1);
  this.variance = 4;
  this.fireRate = 80;
  this.aoe = 75;
  this.cleanAge = 0;
  this.shadow.on = true;
  this.moveTarget = { x: this.x, y: this.y };

  this.name = _.sample(['Gallus', 'Ocellata', 'Pictus', 'Coqui', 'Lerwa', 'Perdix', 'Rollulus', 'Bonasa']);
  this.info.text.push(this.name);
  this.info.draw = true;

  this.sounds = {
    spawn: 'waw',
    target: 'beep'
  };
  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample([
    'Yuck!',
    'Stop killing!',
    'Things die when they are killed!',
    'Disgusting.',
  ]));
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
    var prevOp = this.game.renderer.decalContext.globalCompositeOperation;
    this.game.renderer.decalContext.globalCompositeOperation = 'destination-out';
    this.game.renderer.decalContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.game.renderer.decalContext.beginPath();
    this.game.renderer.decalContext.arc(this.x, this.y, this.aoe, 0, 2 * Math.PI);
    this.game.renderer.decalContext.fill();
    this.game.renderer.decalContext.globalCompositeOperation = prevOp;
    this.cleanAge = 0;
  });

  this.moveToTarget();
  this.lookAt(this.moveTarget);
};

Cleaner.prototype.getImage = function () {
  return this.sprites.herocleaner;
};

Cleaner.prototype.draw = function (context) {
  if (this.cleanAge < 10) {
    context.drawImage(this.sprites.flash1, -this.width / 2, -this.height / 2);
  }
};