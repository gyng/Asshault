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
  this.alignment = 'friendly';
  this.friendlyPierceChance = 0.98;
  this.enemyPierceChance = 0;

  this.level = 0;
  this.xp = 0;
  this.kills = 0;

  this.name = _.sample(['Gallus', 'Ocellata', 'Pictus', 'Coqui', 'Lerwa', 'Perdix', 'Rollulus', 'Bonasa']);
  this.info.draw = true;
  this.info.addToHeroList = true;

  this.sounds = {
    spawn: 'waw',
    target: 'beep',
    levelup: 'powerup'
  };
  this.game.audio.play(this.sounds.spawn);

  this.say(_.sample([
    'Yuck!',
    'Stop killing!',
    'Things die when they are killed!',
    'Disgusting.',
  ]));
  this.updateInfo();
}

Cleaner.prototype = new Entity();

Cleaner.prototype.constructor = Cleaner;

Cleaner.prototype.tick = function () {
  this.cleanAge++;

  if (this.distanceTo(this.moveTarget) < 20) {
    this.game.audio.play(this.sounds.target, 0.7);
    this.moveTarget = { x: _.random(this.game.canvas.width), y: _.random(this.game.canvas.height) };
    this.xp += ~~(this.cleanAge / 10);
    this.updateInfo();
  }

  if (this.age % 60 === 0) {
    var prevOp = this.game.renderer.decalContext.globalCompositeOperation;
    this.game.renderer.decalContext.globalCompositeOperation = 'destination-out';
    this.game.renderer.decalContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.game.renderer.decalContext.beginPath();
    this.game.renderer.decalContext.arc(this.x, this.y, this.aoe, 0, 2 * Math.PI);
    this.game.renderer.decalContext.fill();
    this.game.renderer.decalContext.globalCompositeOperation = prevOp;
    this.cleanAge = 0;
  }

  this.moveToTarget();
  this.lookAt(this.moveTarget);
};

Cleaner.prototype.updateInfo = function () {
  this.checkLevelUp();

  this.info.text = {
    name: { value: this.name, draw: true },
    level: { prepend: 'level', value: this.level },
    xp: { value: this.xp, postfix: 'xp' },
  };

  this.checkHeroInfo();
};

Cleaner.prototype.getImage = function () {
  return this.sprites.herocleaner;
};

Cleaner.prototype.draw = function (context) {
  if (this.cleanAge < 10) {
    context.drawImage(this.sprites.flash1, -this.width / 2, -this.height / 2);
  }
};